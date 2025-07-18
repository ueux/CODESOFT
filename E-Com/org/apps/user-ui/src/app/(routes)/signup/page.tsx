"use client";
import { useMutation } from "@tanstack/react-query";
import GoogleLoginButton from "apps/user-ui/src/shared/components/google-login-button";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios, { AxiosError } from "axios";
import { toast } from "react-hot-toast";

type FormData = {
  name: string;
  email: string;
  password: string;
};

const Signup = () => {
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [showOtp, setShowOtp] = useState<boolean>(false);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(0);
  const [otp, setOtp] = useState<string[]>(["", "", "", ""]);
  const [userData, setUserData] = useState<FormData | null>(null);
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && !canResend) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer, canResend]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const signupMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/user-registration`,
        data
      );
      return response.data;
    },
    onSuccess: (_, formData) => {
      setUserData(formData);
      setShowOtp(true);
      setCanResend(false);
      setTimer(60);
      toast.success("OTP sent to your email!");
    },
    onError: (error: AxiosError) => {
      toast.error(
        error.response?.data?.message || "Registration failed. Please try again."
      );
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      if (!userData) throw new Error("No user data");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/verify-user`,
        { ...userData, otp: otp.join("") }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Account created successfully!");
      router.push("/login");
    },
    onError: (error: AxiosError) => {
      toast.error(
        error.response?.data?.message || "Verification failed. Please try again."
      );
    },
  });

  const onSubmit = async (data: FormData) => {
    signupMutation.mutate(data);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const resendOtp = () => {
    if (userData && canResend) {
      signupMutation.mutate(userData);
      setCanResend(false);
      setTimer(60);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Create Your Account</h1>
            <p className="mt-2 text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign in
              </Link>
            </p>
          </div>

          <GoogleLoginButton className="w-auto" />

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or continue with email
              </span>
            </div>
          </div>

          {!showOtp ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Full Name
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    placeholder="John Doe"
                    className={`block w-full px-4 py-3 rounded-md border ${
                      errors.name ? "border-red-300" : "border-gray-300"
                    } shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    {...register("name", { required: "Name is required" })}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.name.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className={`block w-full px-4 py-3 rounded-md border ${
                      errors.email ? "border-red-300" : "border-gray-300"
                    } shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                        message: "Invalid email address",
                      },
                    })}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    type={passwordVisible ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className={`block w-full px-4 py-3 rounded-md border ${
                      errors.password ? "border-red-300" : "border-gray-300"
                    } shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 5,
                        message: "Password must be at least 5 characters",
                      },
                    })}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                  >
                    {passwordVisible ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={signupMutation.isPending}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  {signupMutation.isPending ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      Creating account...
                    </>
                  ) : (
                    "Create account"
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  Verify Your Email
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  We've sent a verification code to{" "}
                  <span className="font-medium">{userData?.email}</span>
                </p>
              </div>

              <div className="flex justify-center gap-4">
                {otp.map((value, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={value}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                    ref={(el) => {
                      if (el) inputRefs.current[index] = el;
                    }}
                    className="w-14 h-14 text-center text-xl font-semibold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ))}
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => verifyOtpMutation.mutate()}
                  disabled={
                    verifyOtpMutation.isPending || otp.some((digit) => !digit)
                  }
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition-colors duration-200"
                >
                  {verifyOtpMutation.isPending ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Account"
                  )}
                </button>
              </div>

              <div className="text-center text-sm text-gray-600">
                {canResend ? (
                  <button
                    onClick={resendOtp}
                    className="text-blue-600 hover:text-blue-500 font-medium"
                  >
                    Resend OTP
                  </button>
                ) : (
                  <p>
                    Resend OTP in{" "}
                    <span className="font-medium">{timer} seconds</span>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Signup;