import {Request, Response,NextFunction } from "express"
import { checkOtpRestrictions, sendOtp, trackOtpRequest, validateRegistrationData } from "../utils/auth.helper"
import prisma from "../../../../packages/libs/prisma";
import { ValidationError } from "../../../../packages/error-handler";

export const userRegistration = async (req: Request, res: Response, next: NextFunction) => {
    try {
        validateRegistrationData(req.body, "user");
        // Here you would typically save the user to the database
        const { name, email } = req.body;
        const existingUser = await prisma.users.findUnique({
            where: email
        });
        if (existingUser) {
            return next(new ValidationError("User already exists!"));
        }
        await checkOtpRestrictions(email, next);
        await trackOtpRequest(email, next);
        await sendOtp(email, name, "user-activation-mail")
        res.status(200).json({
            message:"OTP sent to email. PLease verify your account"
        })
    } catch (error) {
        return next(error)
    }
}