import {Request, Response,NextFunction } from "express"
import { checkOtpRestrictions, sendOtp, trackOtpRequest, validateRegistrationData, verifyOtp } from "../utils/auth.helper"
import prisma from "../../../../packages/libs/prisma";
import { ValidationError } from "../../../../packages/error-handler";
import bcrypt from "bcryptjs";

export const userRegistration = async (req: Request, res: Response, next: NextFunction) => {
    try {
        validateRegistrationData(req.body, "user");
        // Here you would typically save the user to the database
        const { name, email } = req.body;
        const existingUser = await prisma.users.findUnique({
            where: {email}
        });
        if (existingUser) {
            return next(new ValidationError("User already exists!"));
        }
        await checkOtpRestrictions(email, next);
        await trackOtpRequest(email, next);
        await sendOtp(name,email,"user-activation-mail")
        res.status(200).json({
            message:"OTP sent to email. PLease verify your account"
        })
    } catch (error) {
        return next(error)
    }
}

export const verifUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, otp,password,name } = req.body;
        if (!email || !otp || !password || !name) {
            return next(new ValidationError("All fields are required!"));
        }
        const existingUser = await prisma.users.findUnique({
            where: { email }
        });
        if (existingUser) {
            return next(new ValidationError("User alredy exists with this email!"));
        }
        // Here you would typically activate the user account
        await verifyOtp(email, otp, next);
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.users.create({
            data: {
                name,
                email,
                password: hashedPassword,
            }
        });
        res.status(201).json({
            success: true,
            message: "User registered successfully!"
        });
    } catch (error) {
        return next(error);
    }
}

