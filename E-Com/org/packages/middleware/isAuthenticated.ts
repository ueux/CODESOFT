import prisma from "../libs/prisma";
import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken"
const isAuthenticated = async (req: any, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.accessToken || req.header.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Unauthorized! Token missing" })
        }
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as { id: string; role: "user" | "seller" };
        if (!decoded) {
            return res.status(401).json({ message: "Unauthorized! Invalid token" })
        }
        const account = await prisma.users.findUnique({ where: { id: decoded.id } })
        req.user = account;
        if (!account) {
            return res.status(401).json({ message: "Account not found!" })
        }
        return next()
    } catch (error) {
        return res.status(401).json({message:"Unauthorized! Token expiredor Invalid"})
    }
}

export default isAuthenticated;