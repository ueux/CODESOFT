import prisma from "@packages/libs/prisma";
import { NextFunction, Response } from "express";
import { recommendProducts } from "../services/recommendationService";




export const getRecommendedProducts = async (
    req: any,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user.id;

        // Fetch all products
        const products = await prisma.products.findMany({
            include: { images: true, Shop: true },
        });

        // Get user analytics
        let userAnalytics = await prisma.userAnalytics.findUnique({
            where: { userId },
            select: { actions: true, recommendations: true, lastTrained: true },
        });

        const now = new Date();
        let recommendedProducts= [];

        if (!userAnalytics) {
            // If no analytics exist, return latest 10 products
            recommendedProducts = products.slice(-10);
        } else {
            const actions = Array.isArray(userAnalytics.actions)
                ? userAnalytics.actions as any[]
                : [];

            const recommendations = Array.isArray(userAnalytics.recommendations)
                ? userAnalytics.recommendations as string[]
                : [];

            const lastTrainedTime = userAnalytics.lastTrained
                ? new Date(userAnalytics.lastTrained)
                : null;

            const hoursDiff = lastTrainedTime
                ? (now.getTime() - lastTrainedTime.getTime()) / (1000 * 60 * 60)
                : Infinity;

            if (actions.length < 50) {
                // Not enough data for recommendations
                recommendedProducts = products.slice(-10);
            } else if (hoursDiff < 3 && recommendations.length > 0) {
                // Use cached recommendations if recent
                recommendedProducts = products.filter(product =>
                    recommendations.includes(product.id)
                );
            } else {
                // Generate new recommendations
                const recommendedProductIds = await recommendProducts(userId, products);
                recommendedProducts = products.filter(product =>
                    recommendedProductIds.includes(product.id)
                );

                // Update user analytics with new recommendations
                await prisma.userAnalytics.upsert({
                    where: { userId },
                    update: {
                        recommendations: recommendedProductIds,
                        lastTrained: now,
                    },
                    create: {
                        userId,
                        actions: [],lastVisited: now, 
                        recommendations: recommendedProductIds,
                        lastTrained: now,
                    },
                });
            }
        }

        res.status(200).json({
            success: true,
            recommendations: recommendedProducts,
        });

    } catch (error) {
        console.error("Error in getRecommendedProducts:", error);
        next(error);
    }
};

