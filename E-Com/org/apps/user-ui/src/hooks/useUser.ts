import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance";
import { useAuthStore } from "../store/authStore";
import { isProtected } from "../utils/protected";

const fetchUser = async (isLoggedIn: boolean) => {
  try {
    const config = isLoggedIn ? isProtected : {};
    const response = await axiosInstance.get("/api/logged-in-user", config);
    return response.data.user || null; // Ensure we never return undefined
  } catch (error) {
    return null; // Return null instead of undefined on error
  }
};

const useUser = () => {
  const { setLoggedIn, isLoggedIn } = useAuthStore();
  const {
    data: user,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["user"],
    queryFn: () => fetchUser(isLoggedIn),
    staleTime: 1000 * 60 * 5,
    retry: false,
    //@ts-ignore
    onSuccess: () => {
      setLoggedIn(true);
    },
    onError: () => {
      setLoggedIn(false);
    }
  });

  return { user:user as any, isLoading: isPending, isError };
};

export default useUser;