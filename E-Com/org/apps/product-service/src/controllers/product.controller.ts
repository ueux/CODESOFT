import prisma from "@packages/libs/prisma";
import {Request, Response,NextFunction } from "express"

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const config=await prisma.site_config.findFirst()
        if (!config) {
            return res.status(404).json({message:"Categories not found !"})
        }
        res.status(200).json({
            categories: config.categories,
            subCategories:config.subCategories
        })
    } catch (error) {
        return next(error)
    }
}
