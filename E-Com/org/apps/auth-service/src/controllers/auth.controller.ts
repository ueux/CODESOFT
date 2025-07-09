import {Request, Response,NextFunction } from "express"
import { checkOtpRestrictions, handleForgotPassword, sendOtp, trackOtpRequest, validateRegistrationData, verifyForgotPasswordOtp, verifyOtp } from "../utils/auth.helper"
import prisma from "../../../../packages/libs/prisma";
import { AuthError, ValidationError } from "../../../../packages/error-handler";
import bcrypt from "bcryptjs";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { setCookies } from "../utils/cookies/setCookies";

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

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return next(new AuthError("Email and password are required!"));
        }
        const user = await prisma.users.findUnique({
            where: { email }
        });
        const isPasswordValid = user && await bcrypt.compare(password, user.password!);
        if (!user || !isPasswordValid) {
            return next(new AuthError("Invalid email or password!"));
        }
        // Here you would typically generate a JWT token
        const accessToken = jwt.sign(
            { id: user.id, role: "user" },
            process.env.ACCESS_TOKEN_SECRET as string,
            { expiresIn: "15m" }
        );
        const refreshToken = jwt.sign(
            { id: user.id, role: "user" },
            process.env.REFRESH_TOKEN_SECRET as string,
            { expiresIn: "7d" }
        );
        //store refresh and access token in an httpOnly cookie
        setCookies(res, "accessToken", accessToken);
        setCookies(res, "refreshToken", refreshToken);
        res.status(200).json({
            success: true,
            message: "User logged in successfully!",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            }
        });
    } catch (error) {
        return next(error);
    }
}

export const userForgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    await handleForgotPassword(req, res, next, "user");
}

export const verifyUserForgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    await verifyForgotPasswordOtp(req, res, next);
}


export const resetUserPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, newPassword } = req.body;
        if (!email || !newPassword) {
            return next(new ValidationError("All fields are required!"));
        }
        const user = await prisma.users.findUnique({
            where: { email }
        });
        if (!user) {
            return next(new ValidationError("No user found with this email!"));
        }
        const isSamePassword = await bcrypt.compare(newPassword, user.password!);
        if (isSamePassword) {
            return next(new ValidationError("New password cannot be the same as the old password!"));
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.users.update({
            where: { email },
            data: { password: hashedPassword }
        });
        res.status(200).json({
            success: true,
            message: "Password reset successfully!"
        });
    } catch (error) {
        return next(error);
    }
}

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            throw new ValidationError("Unauthorized! No refresh token.")
        }
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string) as { id: string; role: string };
        if (!decoded || !decoded.id || !decoded.role) {
            return new JsonWebTokenError("Forbidden! Invailid refresh token.")
        }
        const user=await prisma.users.findUnique({ where: { id: decoded.id } })
if (!user) {
            throw new AuthError("Forbidden! User/Seller not found.")
        }
        const newAccessToken = jwt.sign({ id: decoded.id, role: decoded.role }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: "15m" })
        setCookies(res, "accessToken", newAccessToken)
        return res.status(201).json({success:true})
    } catch (error) {
        return next(error)
    }
}

export const getUser = async (req: any, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        res.status(201).json({success:true,user})
    } catch (error) {
next(error)
    }
}