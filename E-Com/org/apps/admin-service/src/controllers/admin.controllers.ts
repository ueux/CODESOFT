import { ValidationError } from "@packages/error-handler"
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
                starting_date: true,
                ending_date:true,
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

export const addNewAdmin=async (req:Request,res:Response,next:NextFunction)=> {
    try {
        const {email,role}=req.body
        const isUser = await prisma.users.findUnique({ where: { email } })
        if (!isUser) return next(new ValidationError("Something went wrong!"))
        const updateRole = await prisma.users.update({
            where: { email },
            data: {
            role
        }})
        res.status(201).json({
            success: true,
            updateRole
        })
    } catch (error) {
        return next(error)
    }
}

export const getAllCustomizations=async (req:Request,res:Response,next:NextFunction)=> {
    try {
        const config = await prisma.site_config.findFirst()

        res.status(201).json({
            success: true,
            categories: config?.categories || [],
            subCategories: config?.subCategories || [],
            logo: config?.logo || null,
            banner:config?.banner||null
        })
    } catch (error) {
        return next(error)
    }
}


export const getAllUsers=async (req:Request,res:Response,next:NextFunction)=> {
    try {
        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 20
        const skip = (page - 1) * limit
        const [users, total] = await Promise.all([prisma.users.findMany({
            skip,
            take: limit,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                avatar: true,
                createdAt: true,
            },
            orderBy:{createdAt:"desc"},
        }),
            prisma.users.count()
        ])
        res.status(201).json({
            success: true,
            data: users,
            meta: {
            totalUsers:total,
            currentPage: page,
            totalPages:Math.ceil(total/limit)
            }
        })
    } catch (error) {
        return next(error)
    }
}

export const getAllSellers=async (req:Request,res:Response,next:NextFunction)=> {
    try {
        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 20
        const skip = (page - 1) * limit
        const [sellers, total] = await Promise.all([prisma.sellers.findMany({
            skip,
            take: limit,
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                shop: {
                    select: {
                        name: true,
                        avatar: true,
                        address:true
                    }
                }
            },
            orderBy:{createdAt:"desc"},
        }),
            prisma.sellers.count()
        ])
        res.status(201).json({
            success: true,
            data: sellers,
            meta: {
            totalSellers:total,
            currentPage: page,
            totalPages:Math.ceil(total/limit)
            }
        })
    } catch (error) {
        return next(error)
    }
}

export const adminNotifications = async (req: any, res: Response, next: NextFunction) => {
  try {
    const notifications = await prisma.notifications.findMany(({
      where: {
        receiverId:"admin"
      },
      orderBy: {
        createdAt:"desc"
      }
    }))
    res.status(200).json({
      success: true,
      notifications
    })
  } catch (error) {
    return next(error)
  }
}

export const userNotifications = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id
    const notifications = await prisma.notifications.findMany(({
      where: {
        receiverId:userId
      },
      orderBy: {
        createdAt:"desc"
      }
    }))
    res.status(200).json({
      success: true,
      notifications
    })
  } catch (error) {
    return next(error)
  }
}

