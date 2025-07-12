import {Request, Response,NextFunction } from "express"
import { checkOtpRestrictions, handleForgotPassword, sendOtp, trackOtpRequest, validateRegistrationData, verifyForgotPasswordOtp, verifyOtp } from "../utils/auth.helper"
import prisma from "../../../../packages/libs/prisma";
import { AuthError, ValidationError } from "../../../../packages/error-handler";
import bcrypt from "bcryptjs";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { setCookies } from "../utils/cookies/setCookies";
import { Stripe } from "stripe"

const stripe=new Stripe(process.env.STRIPE_SECRET_KEY!,{apiVersion:"2025-06-30.basil",})

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

        res.clearCookie("sellerAccessToken")
        res.clearCookie("sellerRefreshToken")
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

export const refreshToken = async (req: any, res: Response, next: NextFunction) => {
    try {
        const refreshToken = req.cookies.refreshToken || req.cookies.sellerRefreshToken || req.headers['authorization']?.split(" ")[1];
        if (!refreshToken) {
            throw new ValidationError("Unauthorized! No refresh token.")
        }
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string) as { id: string; role: string };
        if (!decoded || !decoded.id || !decoded.role) {
            return new JsonWebTokenError("Forbidden! Invailid refresh token.")
        }
        let account;
        if (decoded.role === "user") {
            account = await prisma.users.findUnique({ where: { id: decoded.id } })
        } else if (decoded.role === "seller") {
            account = await prisma.sellers.findUnique({ where: { id: decoded.id }, include: { shop: true } })
        }

if (!account) {
            throw new AuthError("Forbidden! User/Seller not found.")
        }
        const newAccessToken = jwt.sign({ id: decoded.id, role: decoded.role }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: "15m" })

        if (decoded.role === "user") {
            setCookies(res, "accessToken", newAccessToken)
        } else if (decoded.role === "seller") {
            setCookies(res, "sellerAccessToken", newAccessToken)
        }
        req.role=decoded.role

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

export const registerSeler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        validateRegistrationData(req.body, "seller");
        const { name, email } = req.body;
        const existingSeller = await prisma.sellers.findUnique({
            where: { email }
        });
        if (existingSeller) {
            return next(new ValidationError("Seller already exists!"));
        }
        await checkOtpRestrictions(email, next);
        await trackOtpRequest(email, next);
        await sendOtp(name, email, "seller-activation-mail");
        res.status(200).json({
            message: "OTP sent to email. Please verify your account"
        });
    } catch (error) {
        return next(error);

    }
}

export const verifySeller = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, otp, password, name, phone_number, country } = req.body
        if (!email || !otp || !password || !name || !phone_number || !country) {
            return next(new ValidationError("All fields are required!"))
        }
        const existingSeller = await prisma.sellers.findUnique({ where: { email } })
        if (existingSeller) {
            return next(new ValidationError("Seller already exists with this email!"))
        }
        await verifyOtp(email, otp, next)
        const hashedPassword = await bcrypt.hash(password, 10);
        const seller=await prisma.sellers.create({
            data: {
                name,
                email,
                password: hashedPassword,
                country,
                phone_number
            }
        });
        res.status(201).json({
            seller,
            message: "Seller registered successfully!"
        });
    } catch (error) {
        return next(error)
    }
}

export const createShop = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, bio, address, opening_hours, website, category, sellerId } = req.body
        if (!name || !bio || !address || !sellerId || !opening_hours || !category) {
            return next(new ValidationError("All Fields are required!"))
        }
        const shopData:any = {
            name,
            bio,address,opening_hours,category,sellerId
        }
        if (website && website.trim() !== "") {
            shopData.website=website
        }
        const shop = await prisma.shops.create({ data: shopData })
        res.status(201).json({success:true, shop})
    } catch (error) {
        return next(error)
    }
}

export const createStripeConnectLink = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { sellerId } = req.body
        if (!sellerId) return next(new ValidationError("Seller ID is required!"))
        const seller = await prisma.sellers.findUnique({ where: { id: sellerId } })
        if (!seller) return next(new ValidationError("Seller is not available with this id!"))
        const account = await stripe.accounts.create({
            type: "express",
            email: seller?.email,
            country: "GB",
            capabilities: {
                card_payments: { requested: true },
                transfers:{requested:true}
            }
        })
        await prisma.sellers.update({ where: { id: sellerId }, data: { stripeId: account.id } })
        const accountLink = await stripe.accountLinks.create({
            account: account.id,
            refresh_url: `http://localhost:3000/success`,
            return_url: `http://localhost:3000/success`,
            type:"account_onboarding"
        })
        res.json({url:accountLink.url})

    } catch (error) {
        return next(error)
    }
}

export const loginSeller = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return next(new ValidationError("Email and password are required!"));
        }
        const seller = await prisma.sellers.findUnique({
            where: { email }
        });
        const isPasswordValid = seller && await bcrypt.compare(password, seller.password!);
        if (!seller || !isPasswordValid) {
            return next(new AuthError("Invalid email or password!"));
        }
        res.clearCookie("accessToken")
        res.clearCookie("refreshToken")
        // Here you would typically generate a JWT token
        const accessToken = jwt.sign(
            { id: seller.id, role: "seller" },
            process.env.ACCESS_TOKEN_SECRET as string,
            { expiresIn: "15m" }
        );
        const refreshToken = jwt.sign(
            { id: seller.id, role: "seller" },
            process.env.REFRESH_TOKEN_SECRET as string,
            { expiresIn: "7d" }
        );
        //store refresh and access token in an httpOnly cookie
        setCookies(res, "sellerAccessToken", accessToken);
        setCookies(res, "sellerRefreshToken", refreshToken);
        res.status(200).json({
            success: true,
            message: "Seller logged in successfully!",
            user: {
                id: seller.id,
                name: seller.name,
                email: seller.email,
            }
        });
    } catch (error) {
        return next(error);
    }
}

export const getSeller = async (req: any, res: Response, next: NextFunction) => {
    try {
        const seller = req.seller;
        res.status(201).json({success:true,seller})
    } catch (error) {
next(error)
    }
}