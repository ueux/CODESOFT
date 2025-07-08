import crypto from "crypto";
import { ValidationError } from "../../../../packages/error-handler";
import { NextFunction } from "express";
import redis from "../../../../packages/libs/redis";
import { sendEmail } from "./sendMail";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRegistrationData = (data: any, userType: "user" | "seller") => {
    const { name, email, password, phone_number, country } = data;
    if (!name || !email || !password || (userType === "seller" && (!phone_number || !country))) {
        throw new ValidationError("Missing required fields!")
    }
    if (!emailRegex.test(email)) {
        throw new ValidationError("Invalid email format!")
    }
}

export const checkOtpRestrictions =async (email: string, next: NextFunction) => {
    if(await redis.get(`otp_lock:${email}`)){
        return  next(new ValidationError("Acount locked due to multiple failed OTP attempts. Please try again after 30 minutes"));
    }
    if (await redis.get(`otp_spam_lock:${email}`)) {
        return next(new ValidationError("You have reached the maximum number of OTP requests. Please wait 1 hour before requesting again."));
    }
    if (await redis.get(`opt_cooldown:${email}`)) {
        return next(new ValidationError("Please wait 1 minute before requesting a new OTP!"));
    }

}

export const trackOtpRequest = async (email: string, next: NextFunction) => {
    const otpRequestKey = `opt_request_count:${email}`;
    let otpRequests = parseInt((await redis.get(otpRequestKey)) || "0");
    if (otpRequests >= 2) {
        await redis.set(`otp_spam_lock:${email}`, "locked", "EX", 3600); //lock for one hour
        return next(new ValidationError("Too many OTP requests. Please wait 1 hour before requesting again."))
    }
    await redis.set(otpRequestKey,otpRequests+1,"EX",3600)
}

export const sendOtp = async (name: string, email: string, template: string) => {
    const otp = crypto.randomInt(1000, 9999).toString();
    await sendEmail(email, "Verify Your Email", template, {
        name, otp
    });
    // Here you would typically send the OTP via email
    await redis.set(`otp:${email}`, otp, 'EX', 300); // Store OTP in Redis with a 5-minute expiration
    await redis.set(`otp_cooldown:${email}`, 'true', 'EX', 60); // Set a cooldown period of 1 minute

}

export const verifyOtp = async (email: string, otp: string, next: NextFunction) => {
    const storedOtp = await redis.get(`otp:${email}`);
    if (!storedOtp) {
        throw new ValidationError("OTP expired or not found!");
    }
    const failedAttemptsKey = `otp_attempts:${email}`;
    let failedOtpAttempts = parseInt((await redis.get(failedAttemptsKey)) || "0");
    if (storedOtp !== otp) {
        if (failedOtpAttempts >= 2) {
            await redis.set(`otp_lock:${email}`, "locked", "EX", 1800); // Lock account for 30 minutes
            await redis.del(`otp:${email}`,failedAttemptsKey); // Clear OTP after successful verification
            throw new ValidationError("Account locked due to multiple failed OTP attempts. Please try again after 30 minutes");
        }
        await redis.set(failedAttemptsKey, failedOtpAttempts+1, 'EX', 300); // Store attempts for 5 minutes
        throw new ValidationError("Invalid OTP!");
    }
    await redis.del(`otp:${email}`, failedAttemptsKey); // Clear OTP and attempts after successful verification

}