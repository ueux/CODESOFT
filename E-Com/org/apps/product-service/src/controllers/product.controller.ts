import { ValidationError } from "@packages/error-handler";
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

export const creatDiscountCodes = async (req: any, res: Response, next: NextFunction) => {
    try {
        const {public_name,discountType,discountValue,discountCode}=req.body
        const isDiscountCodeExist= await prisma.discount_codes.findUnique({
            where:{discountCode}
        })
        if (isDiscountCodeExist) {
            return next(new ValidationError("Discount code already available use a diffrent code"))
        }
        const discount_code=await prisma.discount_codes.create({data:{public_name,discountType,discountValue:parseFloat(discountValue),discountCode,sellerId:req.seller.id}})
        res.status(200).json({
            success: true,
            discount_code
        })
    } catch (error) {
        return next(error)
    }
}

export const getDiscountCodes = async (req: any, res: Response, next: NextFunction) => {
    try {
        const discount_codes= await prisma.discount_codes.findMany({
            where:{sellerId:req.seller.id}
        })
        res.status(200).json({
            success: true,
            discount_codes
        })
    } catch (error) {
        return next(error)
    }
}

export const deleteDiscountCode = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const sellerId=req.seller?.id
        const discountCode= await prisma.discount_codes.findUnique({
            where: { id },
            select:{id:true,sellerId:true}
        })
        if (!discountCode) {
            return next(new ValidationError("Discount code not found"))
        }
        if (discountCode.sellerId !== sellerId) {
            return next(new ValidationError("Unauthorized Access!"))
        }
        await prisma.discount_codes.delete({ where: { id } })
        res.status(200).json({
            message:"Discount code successfully deleted"
        })
    } catch (error) {
        return next(error)
    }
}