import crypto from "crypto";
import { ValidationError } from "../../../../packages/error-handler";
import { NextFunction } from "express";
import redis from "../../../../packages/libs/redis";
import { sendEmail } from "./sendMail";
import prisma from "@packages/libs/prisma";

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

export const handleForgotPassword = async (req: any, res: any, next: NextFunction, userType: "user" | "seller") => {
    try {
        const { email } = req.body;
        if (!email) {
            return next(new ValidationError("Email is required!"));
        }
        if (!emailRegex.test(email)) {
            return next(new ValidationError("Invalid email format!"));
        }
        const user = userType === "user" && await prisma.users.findUnique({ where: { email } });
        if (!user) {
            throw new ValidationError(`No ${userType} found with this email!`);
        }
        await checkOtpRestrictions(email, next);
        await trackOtpRequest(email, next);
        await sendOtp(user.name, email, `${userType}-forgot-password-mail`);
        res.status(200).json({
            message: `OTP sent to ${userType} email. Please verify your account`
        });
    } catch (error) {
        return next(error);

    }
}

export const verifyForgotPasswordOtp = async (req: any, res: any, next: NextFunction) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp ) {
            throw new ValidationError("Enail and OTP are required!");
        }
        if (!emailRegex.test(email)) {
            return next(new ValidationError("Invalid email format!"));
        }
        await verifyOtp(email, otp, next);
        res.status(200).json({
            success: true,
            message: `OTP verified successfully! You can now reset your password.`
        });
    } catch (error) {
        return next(error);
    }
}