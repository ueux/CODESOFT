import { NotFoundError, ValidationError } from "@packages/error-handler";
import prisma from "@packages/libs/prisma";
import redis from "@packages/libs/redis";
import { NextFunction, Request, Response } from "express";
import Stripe from "stripe"
import crypto from "crypto"
import { sendEmail } from "../utils/sendMail";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion:"2025-06-30.basil"
})
export const createPaymentIntent = async (req: any, res: Response, next: NextFunction) => {
    const { amount, sellerStripeAccountId, sessionId } = req.body;

    // Validate amount
    if (typeof amount !== 'number' || isNaN(amount)) {
        return next(new ValidationError("Invalid payment amount"));
    }

    try {
        const customerAmount = Math.round(amount * 100); // Convert to paise for INR
        const platformFee = Math.floor(customerAmount * 0.1); // 10% platform fee

        // Validate stripe account ID
        if (!sellerStripeAccountId) {
            return next(new ValidationError("Invalid seller stripe account"));
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: customerAmount,
            currency: "usd",
            payment_method_types: ["card"],
            application_fee_amount: platformFee,
            transfer_data: {
                destination: sellerStripeAccountId
            },
  on_behalf_of: sellerStripeAccountId,
            metadata: {
                sessionId,
                userId: req.user.id
            }
        });

        res.send({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        next(error);
    }
}

export const createPaymentSession = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { cart, selectedAddressId, coupon } = req.body;
        const userId = req.user.id;

        // Validate cart
        if (!cart || !Array.isArray(cart) || cart.length === 0) {
            return next(new ValidationError("Cart is empty or invalid"));
        }

        // Normalize and sort cart for comparison
        const normalizedCart = JSON.stringify(cart.map((item: any) => ({
            id: item.id,
            quantity: item.quantity,
            sale_price: item.sale_price,
            shopId: item.shopId,
            selectedOptions: item.selectedOptions
        })).sort((a, b) => a.id.localeCompare(b.id)));

        // Check existing sessions
        const keys = await redis.keys("payment-session:*");
        for (const key of keys) {
            const data = await redis.get(key);
            if (data) {
                const session = JSON.parse(data);
                if (session.userId === userId) {
                    const existingCart = JSON.stringify(session.cart.map((item: any) => ({
                        id: item.id,
                        quantity: item.quantity,
                        sale_price: item.sale_price,
                        shopId: item.shopId,
                        selectedOptions: item.selectedOptions
                    })).sort((a: any, b: any) => a.id.localeCompare(b.id)));

                    if (existingCart === normalizedCart) {
                        return res.status(200).json({ sessionId: key.split(":")[1] });
                    }
                    await redis.del(key);
                }
            }
        }

        // Get shop and seller info
        const uniqueShopIds = [...new Set(cart.map((item: any) => item.shopId))];
        const shops = await prisma.shops.findMany({
            where: { id: { in: uniqueShopIds } },
            select: {
                id: true,
                sellerId: true,
                sellers: { select: { stripeId: true } }
            }
        });

        // Calculate total amount with proper validation
        const totalAmount = cart.reduce((total: number, item: any) => {
            // Validate item price and quantity
            if (typeof item.sale_price !== 'number' || isNaN(item.sale_price)) {
                throw new ValidationError(`Invalid price for product ${item.id}`);
            }
            if (typeof item.quantity !== 'number' || isNaN(item.quantity)) {
                throw new ValidationError(`Invalid quantity for product ${item.id}`);
            }
            return total + (item.quantity * item.sale_price);
        }, 0); // Initialize with 0

        // Validate total amount
        if (isNaN(totalAmount)) {
            throw new ValidationError("Invalid total amount calculation");
        }

        // Create session data
        const sessionId = crypto.randomUUID();
        const sessionData = {
            userId,
            cart,
            sellers: shops.map((shop) => ({
                shopId: shop.id,
                sellerId: shop.sellerId,
                stripeAccountId: shop?.sellers?.stripeId
            })),
            totalAmount,
            shippingAddressId: selectedAddressId || null,
            coupon: coupon || null,
        };

        await redis.setex(`payment-session:${sessionId}`, 600, JSON.stringify(sessionData));
        res.status(201).json({ sessionId });
    } catch (error) {
        next(error);
    }
}

export const verifyingPaymentSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const sessionId = req.query.sessionId as string;
        if (!sessionId) {
            return res.status(400).json({error:"Session Id is required"})
        }
        const sessionKey = `payment-session:${sessionId}`
        const sessionData = await redis.get(sessionKey)
        if (!sessionData) {
            return res.status(404).json({ error: "Session not found os expired" })
        }
        const session = JSON.parse(sessionData)
        return res.status(200).json({
            success: true,
            session
        })
    } catch (error) {
        next(error)
    }
}

//call by stripe
export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const stripeSinature = req.headers['stripe-signature']
        if (!stripeSinature) return res.status(400).send("Missing Stripe signature")
        const rawBody = (req as any).rawBody
        if (!rawBody) {
            return res.status(400).send("Missing request body");
        }

        let event
        try {
            event =stripe.webhooks.constructEvent(rawBody,stripeSinature,process.env.STRIPE_WEBHOOK_SECRET!)
        } catch (error:any) {
            console.error("Webhook signature verification failed", error.message)
            return res.status(400).send(`Webhook Error: ${error.message}`)
        }
        if (event.type === "payment_intent.succeeded") {
            const paymentIntent = event.data.object as Stripe.PaymentIntent
            const sessionId = paymentIntent.metadata.sessionId
            const userId = paymentIntent.metadata.userId;

            const sessionKey = `payment-session:${sessionId}`
            const sessionData = await redis.get(sessionKey)

            if (!sessionData) {
                console.warn("Session data expired or missing for ", sessionId)
                return res.status(200).send("No session found,skipping order creation")
            }

            const { cart, totalAmount, shippingAddressId, coupon } = JSON.parse(sessionData)
            const user = await prisma.users.findUnique({ where: { id: userId } })
            const name = user?.name!
            const email = user?.email!

            const shopGrouped = cart.reduce((acc: any, item: any) => {
                if (!acc[item.shopId]) acc[item.shopId] = []
                acc[item.shopId].push(item)
                return acc
            }, {})

            for (const shopId in shopGrouped) {
                const orderItems = shopGrouped[shopId]
                let orderTotal = orderItems.reduce((total: number, item: any) => {
                    return total + item.quantity * item.sale_price
                },0)
                if (coupon && coupon.discountedProductId && orderItems.some((item: any) => item.id === coupon.discountedProductId)) {
                    const discountedItem = orderItems.find((item: any) => item.id === coupon.discountedProductId)
                    if (discountedItem) {
                        const discount = coupon.discountPercent > 0 ?
                            (discountedItem.sale_price * discountedItem.quantity * coupon.discountPercent) / 100
                            : coupon.discountAmount
                        orderTotal -= discount
                    }
                }
                await prisma.orders.create({
                    data: {
                        userId,
                        shopId,
                        total: orderTotal,
                        status: "Paid",
                        shippingAddressId: shippingAddressId || null,
                        couponCode: coupon?.code || null,
                        discountAmount: coupon?.discountAmount || 0,
                        items: {
                            create: orderItems.map((item: any) => ({
                                productId: item.id,
                                quantity: item.quantity,
                                price: item.sale_price,
                                selectedOptions: item.selectedOptions || {}
                            }))
                        }
                    }
                })
                for (const item of orderItems) {
                    const { id: productId, quantity } = item
                    await prisma.products.update({
                        where: { id: productId },
                        data: {
                            stock: { decrement: quantity },
                            totalSales:{increment:quantity}
                        }
                    })
                    await prisma.productAnalytics.upsert({
                        where: { productId },
                        create: {
                            productId,
                            shopId,
                            purchases: quantity,
                            lastViewedAt:new Date()
                        },
                        update: {
                            purchases:{increment:quantity}
                        }
                    })
                    const existingAnalytics = await prisma.userAnalytics.findUnique({
                        where:{userId}
                    })
                    const newAction = {
                        productId,
                        shopId,
                        action: "puchase",
                        timestamp:Date.now()
                    }
                    const currentActions = Array.isArray(existingAnalytics?.actions) ?
                        (existingAnalytics.actions) : []
                    if (existingAnalytics) {
                        await prisma.userAnalytics.update({
                            where: { userId },
                            data: {
                                lastVisited: new Date(),
                                actions:[...currentActions,newAction]
                            }
                        })
                    } else {
                        await prisma.userAnalytics.create({
                            data:{
                            userId,
                                lastVisited: new Date(),
                                actions:[newAction]
                            }
                        })
                    }

                }
                await sendEmail(
                    email,
                    "Your Eshop Order Confirmation",
                    "order-confirmation",
                    {
                        name,
                        cart,
                        totalAmount: coupon?.discountAmount ? totalAmount - coupon?.discountAmount : totalAmount,
                        trackingUrl:`https://e-com.com/order/${sessionId}`
                    }
                )

                const createdShopIds = Object.keys(shopGrouped)
                const sellerShops = await prisma.shops.findMany({
                    where: { id: { in: createdShopIds } },
                    select: {
                        id: true,
                        sellerId: true,
                        name:true
                    }
                })
                for (const shop of sellerShops) {
                    const firstProduct = shopGrouped[shop.id][0]
                    const productTitle = firstProduct?.title || "new item";

                    await prisma.notifications.create({
                        data: {
                            title: "New Order Recieved",
                            message: `A customer just ordered ${productTitle} from your shop`,
                            creatorId: userId,
                            receiverId: shop.sellerId,
                            redirect_link:`https://e-com.com/order/${sessionId}`
                        }
                    })

                }
                await prisma.notifications.create({
                        data: {
                            title: "Platform Order Alert",
                            message: `A new Order was placed by ${name} `,
                            creatorId: userId,
                            receiverId: "admin",
                            redirect_link:`https://e-com.com/order/${sessionId}`
                        }
                })
                await redis.del(sessionKey)
            }
        }
        res.status(200).json({received:true})
    } catch (error) {
        console.log(error)
        return next(error)
    }
}


export const getSellerOrders= async(req:any,res:Response,next:NextFunction)=>{
    try{
        const shop=await prisma.shops.findUnique({
            where:{
                sellerId:req.seller.id
            }
        })

        const orders=await prisma.orders.findMany({
            where:{
                shopId:shop?.id
            },
            include: {
                User: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar:true
                    }
                }
            },
            orderBy: {
                createdAt:"desc"
            }
        })

        res.status(201).json({
            success: true,
            orders
        })

    } catch (error) {
        return next(error)
    }
}

export const getOrderDetails = async (req: any, res: Response, next: NextFunction) => {
    try {
        const orderId=req.params.orderId
        const order=await prisma.orders.findUnique({
            where:{
                id:orderId
            },
            include: {
                items: true,
                Shop:true
            }
        })
        if(!order)return next(new NotFoundError("Order not found with this id!"))
        const shippingAddress = order.shippingAddressId ? await prisma.address.findUnique({
            where: {
            id:order?.shippingAddressId
            }
        }) : null
        const coupon = order.couponCode ? await prisma?.discount_codes.findUnique({
            where: {
                discountCode_sellerId: {
                    discountCode: order.couponCode,
                    sellerId: order.Shop.sellerId
                }
            }
        }) : null
        const productIds=order.items.map((item)=>item.productId)
        const products = await prisma.products.findMany({
            where: {
                id: { in: productIds }
            },
            select: {
                id: true,
                title: true,
                images: {
                select: {
                    url: true,
                },
                },
            },
        });
        const productMap=new Map(products.map((p)=>[p.id,p]))

        const items = order?.items?.map((item) => ({
            ...item,
            selectedOptions: item.selectedOptions,
            product: productMap.get(item.productId) || null,
        }));

        res.status(201).json({
            success: true,
            order:{...order,items,shippingAddress,couponCode:coupon}
        })

    } catch (error) {
        return next(error)
    }
}

export const updateOrderStatus = async (req: any, res: Response, next: NextFunction) => {
    try{
        const { orderId } = req.params;
        const { deliveryStatus } = req.body
        if (!deliveryStatus || !orderId) return res.status(400).json({ error: "Missing order Id or delivery status" })
        const allowedStatuses = [
            "Ordered",
            "Packed",
            "Shipped",
            "Out for Delivery",
            "Delivered"
        ]
        if (!allowedStatuses.includes(deliveryStatus)) return next(new ValidationError("Invalid delivery status"))
        const existingOrder = await prisma.orders.findUnique({
            where: { id: orderId }
        })
        if(!existingOrder)return next (new NotFoundError("Order not found!"))
        const updatededOrder = await prisma.orders.update({
            where: { id: orderId },
            data: {
                deliveryStatus,
                updatedAt:new Date()
            }
        })

        res.status(201).json({
            success: true,
            message:"Delivery status updated successfully",
            order:updatededOrder
        })

    } catch (error) {
        return next(error)
    }
}

export const verifyCouponCode = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { couponCode, cart } = req.body
        if (!couponCode || !cart || cart.length === 0) return next(new ValidationError("Coupon code and cart are required"))
        const sellerIds = cart.map((item: any) => item.sellerId?item.sellerId:"")

        const discount = await prisma.discount_codes.findUnique({
            where: {
                discountCode_sellerId: {
                    discountCode: couponCode,
                    sellerId:{in:sellerIds}
            } }
        })
        if (!discount) return next(new ValidationError("Coupon code isn't valid!"))
        const matchingProduct = cart.find((item: any) => item.discount_codes?.some((d: any) => d === discount.id))
        if (!matchingProduct) return res.status(200).json({
            valid: false, discount: 0,
            discountAmount:0,message:"No matching product found in cart for this coupon"
        })
        let discountAmount = 0
        const price = matchingProduct.sale_price * matchingProduct.quantity
        if (discount.discountType === "percentage") discountAmount = (price * discount.discountValue) / 100
        else if (discount.discountType === "flat") discountAmount = discount.discountValue

        discountAmount = Math.min(discountAmount, price)
        res.status(200).json({
            valid: true, discount:discount.discountValue,
            discountAmount: discountAmount.toFixed(2),
            discountedProductId: matchingProduct.id,
            discountType: discount.discountType,
            message:"Discount applied to 1 eligible product"
        })
    } catch (error) {

    }
}