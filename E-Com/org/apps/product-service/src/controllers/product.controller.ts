import { AuthError, ValidationError } from "@packages/error-handler";
import { imagekit } from "@packages/libs/imagekit";
import prisma from "@packages/libs/prisma";
import { Prisma } from "@prisma/client";
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

export const uploadProductImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {fileName}=req.body
        if (!fileName) {
            return next(new ValidationError("No file uploaded"));
        }

        // Upload to ImageKit
        const uploadResponse = await imagekit.upload({
            file: fileName,
            fileName: `product-${Date.now()}.jpg`,
            folder: "/products",
            useUniqueFileName: true,
        });

        // Return the uploaded image details
        res.status(200).json({
            success: true,
            imageUrl: uploadResponse.url,
            fileId: uploadResponse.fileId,
            thumbnailUrl: uploadResponse.thumbnailUrl
        });
    } catch (error) {
        return next(error);
    }
};

export const deleteProductImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { fileId } = req.params;

        if (!fileId) {
            return next(new ValidationError("File ID is required"));
        }

        const response=await imagekit.deleteFile(fileId);

        res.status(200).json({
            success: true,
            response,
            message: "Image deleted successfully"
        });
    } catch (error) {
        return next(error);
    }
};

export const createProduct = async (req: any, res: Response, next: NextFunction) => {
  try {
    const {
      title,
      short_description,
      detailed_description,
      warranty,
      custom_specifications,
      slug,
      tags,
      cash_on_delivery,
      brand,
      video_url,
      category,
      colors = [],
      sizes = [],
      discountCodes,
      stock,
      sale_price,
      regular_price,
      subCategory,
      customProperties = {},
      images = [],
      } = req.body;
    // Basic field validation
    if (!title||
      !slug ||
      !short_description||
      !category ||
      !subCategory ||
      !sale_price ||
      !images ||
      !tags ||
      !stock ||
      !regular_price
    ) {
      return next(new ValidationError("Missing required fields"));
    }

    if (!req.seller?.id) {
      return next(new AuthError("Only seller can create products!"));
    }

    // Slug uniqueness
    const slugCheck = await prisma.products.findUnique({
      where: { slug },
    });

    if (slugCheck) {
      return next(new ValidationError("Product with this slug already exists."));
      }
      const userId = req.seller.id
      const shopId=req.seller.shop.id

    // Create Product
    const product = await prisma.products.create({
      data: {
        title,
        short_description,
        detailed_description,
        warranty,
            custom_specifications: custom_specifications || {},
        slug,
        tags:Array.isArray(tags)?tags:tags.split(","),
        cashOnDelivery:cash_on_delivery,
        brand,
        shopId:req.seller?.shop?.id,
        video_url,
        category,
        subCategory,
        colors:colors||[],
        sizes:sizes||[],
        discount_codes:discountCodes.map((codeId:string)=>codeId),
        stock: parseInt(stock),
        sale_price: parseFloat(sale_price),
        regular_price: parseFloat(regular_price),
            custom_properties: customProperties || {},
            images: {
            create:images.filter((img:any)=>img && img.fileId && img.fileUrl).map((image:any)=>({file_id:image.fileId, url:image.fileUrl,
            userId:userId,
            shopId:shopId })),
            }
        },
        include:{images:true}
    });

    res.status(201).json({ success: true, product });
  } catch (error) {
    return next(error);
  }
};
export const getShopProducts=async (req:any,res:Response,next:NextFunction)=> {
try {
    const products = await prisma.products.findMany({
        where: { shopId: req.seller.shop.id },
        include: { images: true }
    })
    res.status(201).json({
        success: true,
        products
    })
} catch (error) {
return next(error)
}

}

export const deleteProduct = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const sellerId=req.seller.shop.id
        const product = await prisma.products.findUnique({ where: { id } ,select:{id:true,shopId:true,isDeleted:true}});

        if (!product) {
            return next(new ValidationError("Product not found"))
        }
if(product.shopId!==sellerId)return next(new ValidationError("Unauthorized action"))
if(product.isDeleted)return next(new ValidationError("Product is already deleted"))
        const deleteProduct=await prisma.products.update({ where: { id },data:{isDeleted:true, deletedAt:new Date(Date.now()+24*60*60*1000)} });
        res.status(200).json({
            success: true, deleteProduct,
            message: "Product is sceduled for deletion in 24 hours. You can restore it within this time"
        });
    } catch (error) {
        return next(error);
    }
};
export const restoreProduct = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const sellerId=req.seller.shop.id
        const product = await prisma.products.findUnique({ where: { id } ,select:{id:true,shopId:true,isDeleted:true}});

        if (!product) {
            return next(new ValidationError("Product not found"))
        }
if(product.shopId!==sellerId)return next(new ValidationError("Unauthorized action"))
if(!product.isDeleted)return next(new ValidationError("Product is not in delete state "))
        const deleteProduct=await prisma.products.update({ where: { id },data:{isDeleted:false, deletedAt:null} });
        res.status(200).json({ success: true, message: "Product is successfully restored" });
    } catch (error) {
        return next(error);
    }
};

export const getAllProducts=async (req:Request,res:Response,next:NextFunction)=> {
    try {
        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 20
        const skip = (page - 1) * limit
        const type = req.query.type
const baseFilter: Prisma.productsWhereInput = {
      OR: [
        { starting_date: null },
        { ending_date: null },
      ],
        };
        const orderBy: Prisma.productsOrderByWithRelationInput = type === "latest" ? { createdAt: "desc" as Prisma.SortOrder } : { totalSales: "desc" as Prisma.SortOrder }
        const [products, total, top10Products] = await Promise.all([prisma.products.findMany({
            skip,
            take:limit,
            include: {
                images: true,
                Shop: {
                include: {
          reviews: {
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
            },
            },
            where: baseFilter,
            orderBy:{totalSales:"desc"},
        }),
            prisma.products.count({ where: baseFilter }),
            prisma.products.findMany({ take: 10, where: baseFilter ,orderBy})
        ])
    res.status(201).json({
        success: true,
        products,
        top10By: type === "latest" ? "latest" : "topSales",
        top10Products,
        total,
        currentPage: page,
        totalPages:Math.ceil(total/limit)
    })
} catch (error) {
return next(error)
}

}