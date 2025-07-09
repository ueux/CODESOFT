"use client";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

type FormData = {
  email: string;
  password: string;
};
const Login = () => {
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();
  const loginMutation=useMutation({
        mutationFn: async (data: FormData) => {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/login-user`, data,{withCredentials:true});

            return response.data;
        },
    onSuccess: (_, formData) => {
      setServerError(null);
      router.push("/")
    },
    onError: (error: AxiosError)=>{
    const errorMessage = (error.response?.data as { message?: string })?.message || "Invalid Credentials";
      setServerError(errorMessage)
    }
    });
  const onSubmit = async (data: FormData) => {loginMutation.mutate(data)};
  return (
    <div className="w-full py-10 min-h-screen bg-[#f1f1f1]">
      <h1 className="text-4xl font-Poppins font-semibold text-black text-center">
        Login
      </h1>
      <p className="text-center text-lg font-medium py-3 text-[#00000099]">
        Home . Login
      </p>
      <div className="w-full flex justify-center">
        <div className="md:w-[480px] bg-white p-8 rounded-lg shadow">
          <h3 className="text-3xl font-semibold text-center mb-2">
            Login to Your Account
          </h3>
          <p className="text-center text-grey-500 mb-4">
            Don't have an account?{" "}
            <Link href="/signup" className="text-blue-500 hover:underline">
              Sign up
            </Link>
          </p>
          <div className="flex items-center my-5 text-gray-400 text-sm ">
            <div className="flex-1 border-t border-gray-300" />
            <span className="px-3">or Sign in with Email</span>
            <div className="flex-1 border-t border-gray-300" />
          </div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <label className="block mb-1 text-gray-700">Email</label>
            <input type="email" placeholder="support@gmail.com" className="w-full p-2 border border-gray-300 !rounded mb-1 outline-0 focus:outline-none focus:ring-2 focus:ring-blue-500" {...register("email", { required: "Email is required", pattern: { value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, message: "Invalid email address" } })} />
            {errors.email && (<p className="text-red-500 text-sm">{String(errors.email.message)}</p>)}
            <label className="block mb-1 text-gray-700">Password</label>
            <div className="relative">
              <input
                type={passwordVisible ? "text" : "password"}
                placeholder="Min. 5 characters"
                className="w-full p-2 border border-gray-300 !rounded mb-1 outline-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register("password", { required: "Password is required", minLength: { value: 5, message: "Password must be at least 5 characters" } })}
              />
              <button
                type="button"
                className="absolute right-2 flex items-center inset-y-0 text-gray-400"
                onClick={() => setPasswordVisible(!passwordVisible)}
              >
                {passwordVisible ? <Eye/> : <EyeOff/>}
              </button>
            </div>
            {errors.password && (<p className="text-red-500 text-sm">{String(errors.password.message)}</p>)}
            <div className="flex items-center justify-between mb-4">
              <label className="flex items-center text-gray-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="mr-2"
                />
                Remember Me
              </label>
              <Link href="/forgot-password" className="text-blue-500 hover:underline text-sm">Forgot Password?</Link>
            </div>
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-blue-500 text-white py-2 !rounded hover:bg-blue-600 transition-colors"
            >
              {loginMutation.isPending?"Logging in...":"Login"}
            </button>
            {serverError && (
              <p className="text-red-500 text-sm mt-2">{serverError}</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
