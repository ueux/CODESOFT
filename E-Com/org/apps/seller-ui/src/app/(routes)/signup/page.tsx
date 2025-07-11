"use client";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, {  useState } from "react";
import { useForm } from "react-hook-form";
import axios,{AxiosError} from "axios";
import { countries } from "apps/seller-ui/src/utils/countries";
import CreateShop from "apps/seller-ui/src/shared/modules/auth/create-shop";


const Signup = () => {
    const [activeStep, setActiveStep] = useState<number>(2);
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
    const [showOtp, setShowOtp] = useState<boolean>(false);
    const [canResend, setCanResend] = useState<boolean>(true);
    const [timer, setTimer] = useState<number>(60);
    const [otp, setOtp] = useState<string[]>(["", "", "", ""]);
    const [sellerData, setSellerData] = useState<FormData | null>(null);
    const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);
    const [sellerId ,setSellerId]=useState("")
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
    } = useForm();
    const signupMutation=useMutation({
        mutationFn: async (data: FormData) => {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/seller-registration`, data)
            return response.data;
        },
        onSuccess: (_, formData) => {
            setSellerData(formData);
            setShowOtp(true);
            setCanResend(false);
            setTimer(60);
            startResendTimer()
        }
    });
    const onSubmit = async (data: any) => { signupMutation.mutate(data) };
    const verifyOtpMutation = useMutation({
        mutationFn: async () => {
            if (!sellerData) return;
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/verify-seller`, { ...sellerData, otp: otp.join("") });
            return response.data;
        },
        onSuccess: (data) => {
            setSellerId(data.seller.id)
            setActiveStep(2)
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
        if (sellerData) {
            signupMutation.mutate(sellerData)
        }
        // Here you would typically call your API to resend the OTP
    };
  return (
      <div className="w-full flex flex-col items-center pt-10 min-h-screen">
          {/*Steppper*/}
          <div className="relative flex items-center justify-between md:w-[50%] mb-8">
              <div className="absolute top-[25%] left-0 w-[80%] md:w-[90%] h-1 bg-gray-300 -z-10" />
              {[1, 2, 3].map((step) => (
                  <div key={step}>
                  <div  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${step <= activeStep ? "bg-blue-600" : "bg-gray-300"}`}>
                      {step}
                      </div>
                      <span className="ml-[-15px]">
                          {step===1?"Create Account":step===2?"Setup Shop":"Connnect Bank"}
                      </span>
                  </div>
                      ))}
          </div>
          {/*Steps content*/}
          <div className="md:w-[480px] p-8 bg-white shadow rounded-lg">
              {activeStep === 1 && (
                  <>
                      {!showOtp ? (
                          <form onSubmit={handleSubmit(onSubmit)}>
                              <h3 className="text-2xl font-semibold text-center mb-4">
                                  Create Account
                              </h3>
                    <label className="block mb-1 text-gray-700">Name</label>
                    <input type="name" placeholder="Ueux" className="w-full p-2 border border-gray-300 rounded-[4px] mb-1 outline-0 focus:outline-none focus:ring-2 focus:ring-blue-500" {...register("name", { required: "Name is required", })} />
                    <label className="block mb-1 text-gray-700">Email</label>
                    <input type="email" placeholder="support@gmail.com" className="w-full p-2 border border-gray-300 rounded-[4px] mb-1 outline-0 focus:outline-none focus:ring-2 focus:ring-blue-500" {...register("email", { required: "Email is required", pattern: { value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, message: "Invalid email address" } })} />
                              {errors.email && (<p className="text-red-500 text-sm">{String(errors.email.message)}</p>)}
                              <label className="block mb-1 text-gray-700">Phone Number</label>
                              <input type="tel" placeholder="1234567890" className="w-full p-2 border border-gray-300 rounded-[4px] mb-1 outline-0 focus:outline-none focus:ring-2 focus:ring-blue-500" {...register("phone_number", { required: "Phone Number is required",pattern:{value:/^\+?[1-9]\d{1,14}$/, message:"Invalid Phone Number format"},minLength:{value:10, message:"Phone Number must be at least 10 digits"} })} />
                              {errors.phone_number && (<p className="text-red-500 text-sm">{String(errors.phone_number.message)}</p>)}
                              <label className="block mb-1 text-gray-700">Country</label>
                              <select className="w-full p-2 border border-gray-300 rounded-[4px] mb-1 outline-0 focus:outline-none focus:ring-2 focus:ring-blue-500" {...register("country", { required: "Country is required" })}>
                                  <option value="">Select Country</option>
                                  {countries.map((country) => (
                                      <option key={country.code} value={country.name}>
                                          {country.name}
                                      </option>
                                  ))}
                                </select>
                              {errors.country && (<p className="text-red-500 text-sm">{String(errors.country.message)}</p>)}

                    <label className="block mb-1 text-gray-700">Password</label>
                    <div className="relative">
                        <input
                            type={passwordVisible ? "text" : "password"}
                            placeholder="Min. 5 characters"
                            className="w-full p-2 border border-gray-300 rounded-[4px] mb-1 outline-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full bg-blue-500 mt-4 text-white py-2 rounded-[4px] hover:bg-blue-600 transition-colors"
                    >
                    {signupMutation.isPending? "Signing up...":"Sign Up"}
                              </button>
                              {signupMutation?.isError && signupMutation.error instanceof AxiosError && (
                                  <p className="text-red-500 text-sm mt-2">
                                      {signupMutation.error.response?.data?.message || signupMutation.error?.message}
                                  </p>
                              )}
                    <p className="text-center text-sm pt-3">
                                  Already have an account?{" "}
                                  <Link href="/login" className="text-blue-500 hover:underline">
                                      Login
                                  </Link>
                                </p>
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
                                placeholder={`${index + 1}`}
                                title={`OTP digit ${index + 1}`}
                                onChange={(e) => handleOtpChange(index,e.target.value)}
                                onKeyDown={(e) => handleOtpKeyDown(e, index)}
                                ref={(el) => { if (el) inputRefs.current[index] = el}}
                                className="w-12 h-12 text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  </>
              )}
              {activeStep === 2 && (<>
                  <CreateShop sellerId={sellerId} setActiveStep={setActiveStep} />
              </>)}
          </div>
    </div>
  );
};

export default Signup;
