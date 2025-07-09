"use client";
import { useMutation } from "@tanstack/react-query";
import GoogleLoginButton from "apps/user-ui/src/shared/components/google-login-button";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { use, useState } from "react";
import { useForm } from "react-hook-form";
import axios,{AxiosError} from "axios";

type FormData = {
    name:string,
    email: string;
    password: string;
};
const Signup = () => {
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
    const [showOtp, setShowOtp] = useState<boolean>(false);
    const [canResend, setCanResend] = useState<boolean>(true);
    const [timer, setTimer] = useState<number>(60);
    const [otp, setOtp] = useState<string[]>(["", "", "", ""]);
    const [userData, setUserData] = useState<FormData | null>(null);
    const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);
    const startResendTimer = () => {
        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(interval)
                    setCanResend(true);
                    return 0;
                }
                return prev - 1;
            })
        },1000)
    }
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    } = useForm<FormData>();
    const signupMutation=useMutation({
        mutationFn: async (data: FormData) => {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/user-registration`, data);
            console.log(response)
            return response.data;
        },
        onSuccess: (_, formData) => {
            setUserData(formData);
            setShowOtp(true);
            setCanResend(false);
            setTimer(60);
            startResendTimer()
        }
    });
    const onSubmit = async (data: FormData) => { signupMutation.mutate(data) };
    const verifyOtpMutation = useMutation({
        mutationFn: async () => {
            if (!userData) return;
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/verify-user`, { ...userData, otp: otp.join("") });
            return response.data;
        },
        onSuccess: () => {
            router.push("/login")
        }
    })
    const handleOtpChange = (index: number, value: string) => {
        if(!/^[0-9]?$/.test(value)) return; // Allow only digits
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if(value && index<inputRefs.current.length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };
    const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };
    const resendOtp = () => {
        setCanResend(false);
        setTimer(60);
        setTimeout(() => {
            setCanResend(true);
        }, 60000);
        // Here you would typically call your API to resend the OTP
    };
  return (
    <div className="w-full py-10 min-h-[85vh] bg-[#f1f1f1]">
      <h1 className="text-4xl font-Poppins font-semibold text-black text-center">
        Signup
      </h1>
      <p className="text-center text-lg font-medium py-3 text-[#00000099]">
        Home . Signup
      </p>
      <div className="w-full flex justify-center">
            <div className="md:w-[480px] bg-white p-8 rounded-lg shadow">
                <h3 className="text-3xl font-semibold text-center mb-2">
                    Signup to Your Account
                </h3>
                <p className="text-center text-grey-500 mb-4">
                    Already have an account?{" "}
                    <Link href="/signup" className="text-blue-500 hover:underline">
                        Login
                    </Link>
                </p>
                <GoogleLoginButton/>
                <div className="flex items-center my-5 text-gray-400 text-sm ">
                    <div className="flex-1 border-t border-gray-300" />
                    <span className="px-3">or Sign in with Email</span>
                    <div className="flex-1 border-t border-gray-300" />
                </div>
                {!showOtp ? (
                <form onSubmit={handleSubmit(onSubmit)}>
                    <label className="block mb-1 text-gray-700">Name</label>
                    <input type="name" placeholder="Ueux" className="w-full p-2 border border-gray-300 rounded mb-1 outline-0 focus:outline-none focus:ring-2 focus:ring-blue-500" {...register("name", { required: "Name is required", })} />
                    <label className="block mb-1 text-gray-700">Email</label>
                    <input type="email" placeholder="support@gmail.com" className="w-full p-2 border border-gray-300 rounded mb-1 outline-0 focus:outline-none focus:ring-2 focus:ring-blue-500" {...register("email", { required: "Email is required", pattern: { value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, message: "Invalid email address" } })} />
                    {errors.email && (<p className="text-red-500 text-sm">{String(errors.email.message)}</p>)}
                    <label className="block mb-1 text-gray-700">Password</label>
                    <div className="relative">
                        <input
                            type={passwordVisible ? "text" : "password"}
                            placeholder="Min. 5 characters"
                            className="w-full p-2 border border-gray-300 rounded mb-1 outline-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    <button
                    type="submit"
                    disabled={signupMutation.isPending}
                    className="w-full bg-blue-500 mt-4 text-white py-2 rounded hover:bg-blue-600 transition-colors"
                    >
                    {signupMutation.isPending? "Signing up...":"Sign Up"}
                    </button>
                </form>) : (
                <div>
                    <h3 className="text-xl font-semibold text-center mb-4">Enter OTP</h3>
                    <div className="flex justify-center gap-6">
                        {otp.map((value, index) => (
                            <input
                                key={index}
                                type="text"
                                maxLength={1}
                                value={value}
                                onChange={(e) => handleOtpChange(index,e.target.value)}
                                onKeyDown={(e) => handleOtpKeyDown(e, index)}
                                ref={(el) => { if (el) inputRefs.current[index] = el}}
                                className="w-12 h-12 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        ))}
                    </div>
                    <button type="submit" className="w-full bg-blue-500 mt-4 text-white py-2 rounded-lg text-lg hover:bg-blue-600 transition-colors" disabled={verifyOtpMutation.isPending} onClick={()=>verifyOtpMutation.mutate()}>{verifyOtpMutation.isPending? "Verifying...":"Verify OTP"}</button>
                    <p className="text-center text-sm mt-4">
                                  {canResend ? (
                                      <button onClick={resendOtp} className="text-blue-500 hover:underline">Resend OTP</button>
                                  ):(`Resend OTP in ${timer} seconds`)}
                              </p>
                              {
                                  verifyOtpMutation?.isError && verifyOtpMutation.error instanceof AxiosError && (
                                      <p className="text-red-500 text-sm mt-2">
                                          {verifyOtpMutation.error.response?.data?.message||verifyOtpMutation.error?.message }
                                      </p>
                                  )
                              }
                </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default Signup;
