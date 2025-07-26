import prisma from "@packages/libs/prisma"
import { Prisma } from "@prisma/client"
import { NextFunction, Request, Response } from "express"

export const getAllProducts=async (req:Request,res:Response,next:NextFunction)=> {
    try {
        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 20
        const skip = (page - 1) * limit
        const [products, total] = await Promise.all([prisma.products.findMany({
            skip,
            take: limit,
            select: {
                id: true,
                title: true,
                slug: true,
                sale_price: true,
                stock: true,
                createdAt: true,
                ratings: true,
                category: true,
                images: {
                    select: { url: true },
                    take:1
                },
                Shop: {
                    select:{name:true}
                }
            },
            where: { starting_date: null },
            orderBy:{createdAt:"desc"},
        }),
            prisma.products.count({  where: { starting_date: null } })
        ])
        res.status(201).json({
            success: true,
            data: products,
            meta: {
            totalProducts:total,
            currentPage: page,
            totalPages:Math.ceil(total/limit)
            }
        })
    } catch (error) {
        return next(error)
    }
}

export const getAllEvents=async (req:Request,res:Response,next:NextFunction)=> {
    try {
        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 20
        const skip = (page - 1) * limit
        const [products, total] = await Promise.all([prisma.products.findMany({
            skip,
            take: limit,
            select: {
                id: true,
                title: true,
                slug: true,
                sale_price: true,
                stock: true,
                createdAt: true,
                ratings: true,
                category: true,
                images: {
                    select: { url: true },
                    take:1
                },
                Shop: {
                    select:{name:true}
                }
            },
            where: { starting_date:  {not:null}  },
            orderBy:{createdAt:"desc"},
        }),
            prisma.products.count({  where: { starting_date: {not:null} } })
        ])
        res.status(201).json({
            success: true,
            data: products,
            meta: {
            totalProducts:total,
            currentPage: page,
            totalPages:Math.ceil(total/limit)
            }
        })
    } catch (error) {
        return next(error)
    }
}

export const getAllAdmins=async (req:Request,res:Response,next:NextFunction)=> {
    try {

        const admins=await prisma.users.findMany({  where: { role:"admin" } })
        res.status(201).json({
            success: true,
            admins,
        })
    } catch (error) {
        return next(error)
    }
}