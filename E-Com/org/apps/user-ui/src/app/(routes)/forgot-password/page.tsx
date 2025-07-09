"use client";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

type FormData = {
  email: string;
  password:string
};
const ForgotPassword = () => {
  const [step, setStep] = useState<"email" | "otp" | "reset">("email")
  const [otp, setOtp] = useState(["", "", "", ""])
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [canResend, setCanResend] = useState(true)
  const [timer,setTimer]=useState(60)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

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
const requestOtpMutation=useMutation({
        mutationFn: async ({email}:{email:string}) => {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/forgot-password-user`, { email });
        console.log(response)
            return response.data;
        },
        onSuccess: (_, {email}) => {
            setUserEmail(email);
          setStep("otp");
          setServerError(null)
            setCanResend(false);
            setTimer(60);
            startResendTimer()
  },
  onError: (error: AxiosError) => {
          const errorMessage = (error.response?.data as { message?: string })?.message || "Invalid OTP. Try Again!";
      setServerError(errorMessage)
        }
});
  const verifyOtpMutation=useMutation({
         mutationFn: async () => {
            if (!userEmail) return;
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/verify-forgot-password-otp-user`, { email:userEmail, otp: otp.join("") });
            return response.data;
        },
    onSuccess: () => {
      setStep("reset")
      setServerError(null)
        },
  onError: (error: AxiosError) => {
          const errorMessage = (error.response?.data as { message?: string })?.message || "Invalid OTP. Try Again!";
      setServerError(errorMessage)
        }
  });
  const resetPasswardMutation=useMutation({
         mutationFn: async ({password}:{password:string}) => {
            if (!password) return;
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/reset-password-user`, { email:userEmail, newPassword: password });
            return response.data;
        },
    onSuccess: () => {
      setStep("email")
      toast.success("Password reset successfully! Please login with your new password")
      setServerError(null)
      router.push("/login")
        },
  onError: (error: AxiosError) => {
          const errorMessage = (error.response?.data as { message?: string })?.message || "Invalid OTP. Try Again!";
      setServerError(errorMessage)
        }
  });
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

  const onSubmitEmail = async ({email}: {email:string}) => {requestOtpMutation.mutate({email})};
  const onSubmitPassword = async ({password}: {password:string}) => {resetPasswardMutation.mutate({password})};
  return (
    <div className="w-full py-10 min-h-[85vh] bg-[#f1f1f1]">
      <h1 className="text-4xl font-Poppins font-semibold text-black text-center">
        Forgot Password
      </h1>
      <p className="text-center text-lg font-medium py-3 text-[#00000099]">
        Home . Forgot Password
      </p>
      <div className="w-full flex justify-center">
        <div className="md:w-[480px] bg-white p-8 rounded-lg shadow">
          {step == "email" && (
            <>
              <h3 className="text-3xl font-semibold text-center mb-2">
            Login to Your Account
          </h3>
          <p className="text-center text-grey-500 mb-4">
            Go back to ?{" "}
            <Link href="/login" className="text-blue-500 hover:underline">
              Login
            </Link>
          </p>
          <form onSubmit={handleSubmit(onSubmitEmail)}>
            <label className="block mb-1 text-gray-700">Email</label>
            <input type="email" placeholder="support@gmail.com" className="w-full p-2 border border-gray-300 rounded mb-1 outline-0 focus:outline-none focus:ring-2 focus:ring-blue-500" {...register("email", { required: "Email is required", pattern: { value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, message: "Invalid email address" } })} />
            {errors.email && (<p className="text-red-500 text-sm">{String(errors.email.message)}</p>)}

            <button
                  type="submit"
                  disabled={requestOtpMutation.isPending}
              className="w-full bg-blue-500 mt-4 text-white py-2 rounded hover:bg-blue-600 transition-colors"
            >
              {requestOtpMutation.isPending?"Sending OTP...":"Submit"}
            </button>
            {serverError && (
              <p className="text-red-500 text-sm mt-2">{serverError}</p>
            )}
          </form>
            </>
          )}
          {step == "otp" && (
            <>
                    <h3 className="text-xl font-semibold text-center mb-4">Enter OTP</h3>
                    <div className="flex justify-center gap-6">
                        {otp.map((value, index) => (
                            <input
                                key={index}
                                type="text"
                                maxLength={1}
                                value={value}
                                placeholder={`${index + 1}`}
                                title={`OTP digit ${index + 1}`}
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
                                      <button onClick={()=>requestOtpMutation.mutate({email:userEmail!})} className="text-blue-500 hover:underline">Resend OTP</button>
                                  ):(`Resend OTP in ${timer} seconds`)}
                              </p>
                              {
                                  serverError && (
                                      <p className="text-red-500 text-sm mt-2">
                                          {serverError }
                                      </p>
                                  )
                              }
            </>
          )}
          {step == "reset" && (
            <>
              <h3 className="text-xl font-semibold text-center mb-4">
            Reset Password
          </h3>
          <form onSubmit={handleSubmit(onSubmitPassword)}>
            <label className="block mb-1 text-gray-700">New Password</label>
            <input
                type= "password"
                placeholder="Min. 5 characters"
                className="w-full p-2 border border-gray-300 rounded mb-1 outline-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register("password", { required: "Password is required", minLength: { value: 5, message: "Password must be at least 5 characters" } })}
              />
            {errors.password && (<p className="text-red-500 text-sm">{String(errors.password.message)}</p>)}

            <button
                  type="submit"
                  disabled={resetPasswardMutation.isPending}
              className="w-full bg-blue-500 mt-4 text-white py-2 rounded hover:bg-blue-600 transition-colors"
            >
              {resetPasswardMutation.isPending?"Resetting...":"Reset Password"}
            </button>
            {serverError && (
              <p className="text-red-500 text-sm mt-2">{serverError}</p>
            )}
          </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
