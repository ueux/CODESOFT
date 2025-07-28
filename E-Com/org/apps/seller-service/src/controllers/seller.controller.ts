// seller.controller.ts
import { Request, Response, NextFunction } from "express";
import prisma from "@packages/libs/prisma";
import { AuthError, ValidationError } from "@packages/error-handler";

// Get seller profile
export const getSeller = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const seller = await prisma.shops.findUnique({
      where: { id },
      include: {
        sellers: true,
        reviews: {
          include: {
            user: true
          }
        }
      }
    });

    if (!seller) {
      return next(new ValidationError("Seller not found"));
    }

    // Get followers count
    const followersCount = await prisma.followers.count({
      where: { shopId: id }
    });

    res.status(200).json({
      success: true,
      shop: {
        id: seller.id,
        name: seller.name,
        bio: seller.bio,
        avatar: seller.avatar,
        coverBanner: seller.coverBanner,
        ratings: seller.ratings,
        address: seller.address,
        opening_hours: seller.opening_hours,
        createdAt: seller.createdAt,
        website: seller.website,
        socialLinks: seller.socialLinks
      },
      followersCount
    });
  } catch (error) {
    next(error);
  }
};

// Get seller products
export const getSellerProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where: {
          shopId: id,
          starting_date: null // Regular products, not events
        },
        skip,
        take: limit,
        include: {
          images: true
        }
      }),
      prisma.products.count({
        where: {
          shopId: id,
          starting_date: null
        }
      })
    ]);

    res.status(200).json({
      success: true,
      products,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get seller events
export const getSellerEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      prisma.products.findMany({
        where: {
          shopId: id,
          starting_date: { not: null } // Events have starting_date
        },
        skip,
        take: limit,
        include: {
          images: true
        }
      }),
      prisma.products.count({
        where: {
          shopId: id,
          starting_date: { not: null }
        }
      })
    ]);

    res.status(200).json({
      success: true,
      events,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Follow shop
export const followShop = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { shopId } = req.body;
    const userId = req.user.id;

    if (!shopId) {
      return next(new ValidationError("Shop ID is required"));
    }

    // Check if already following
    const existingFollow = await prisma.followers.findFirst({
      where: {
        userId,
        shopId
      }
    });

    if (existingFollow) {
      return next(new ValidationError("You are already following this shop"));
    }

    // Create follow relationship
    await prisma.followers.create({
      data: {
        userId,
        shopId
      }
    });

    res.status(200).json({
      success: true,
      message: "Successfully followed the shop"
    });
  } catch (error) {
    next(error);
  }
};

// Unfollow shop
export const unfollowShop = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { shopId } = req.body;
    const userId = req.user.id;

    if (!shopId) {
      return next(new ValidationError("Shop ID is required"));
    }

    // Delete follow relationship
    await prisma.followers.deleteMany({
      where: {
        userId,
        shopId
      }
    });

    res.status(200).json({
      success: true,
      message: "Successfully unfollowed the shop"
    });
  } catch (error) {
    next(error);
  }
};

// Check if user is following shop
export const isFollowingShop = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { shopId } = req.params;
    const userId = req.user.id;

    const isFollowing = await prisma.followers.findFirst({
      where: {
        userId,
        shopId
      }
    });

    res.status(200).json({
      success: true,
      isFollowing: !!isFollowing
    });
  } catch (error) {
    next(error);
  }
};

// Get seller reviews
export const getSellerReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.shopsReviews.findMany({
        where: { shopId: id },
        skip,
        take: limit,
        include: {
          user: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.shopsReviews.count({
        where: { shopId: id }
      })
    ]);

    res.status(200).json({
      success: true,
      reviews,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Track shop visit
export const trackShopVisit = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { shopId, country, city, device } = req.body;
    const userId = req.user.id;

    if (!shopId) {
      return next(new ValidationError("Shop ID is required"));
    }

    // Track unique visitor
    await prisma.uniqueShopVisitors.upsert({
      where: {
        shopId_userId: {
          shopId,
          userId
        }
      },
      create: {
        shopId,
        userId
      },
      update: {
        visitedAt: new Date()
      }
    });

    // Update shop analytics
    await prisma.shopAnalytics.upsert({
      where: { id: shopId },
      create: {
        id: shopId,
        totalVisitors: 1,
        countryStats: country ? { [country]: 1 } : {},
        cityStats: city ? { [city]: 1 } : {},
        deviceStats: device ? { [device]: 1 } : {},
        lastVisitedAt: new Date()
      },
      update: {
        totalVisitors: { increment: 1 },
        countryStats: country ? {
          [country]: { increment: 1 }
        } : undefined,
        cityStats: city ? {
          [city]: { increment: 1 }
        } : undefined,
        deviceStats: device ? {
          [device]: { increment: 1 }
        } : undefined,
        lastVisitedAt: new Date()
      }
    });

    res.status(200).json({
      success: true,
      message: "Shop visit tracked"
    });
  } catch (error) {
    next(error);
  }
};

// Get seller followers
export const getSellerFollowers = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { shopId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Verify the requester is the shop owner
    const shop = await prisma.shops.findUnique({
      where: { id: shopId },
      select: { sellerId: true }
    });

    if (!shop) {
      return next(new ValidationError("Shop not found"));
    }

    if (shop.sellerId !== req.user.id && req.user.role !== 'admin') {
      return next(new AuthError("Unauthorized access"));
    }

    const [followers, total] = await Promise.all([
      prisma.followers.findMany({
        where: { shopId },
        skip,
        take: limit,
        include: {
          users: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.followers.count({
        where: { shopId }
      })
    ]);

    res.status(200).json({
      success: true,
      followers,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get seller analytics
export const getSellerAnalytics = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { shopId } = req.params;

    // Verify the requester is the shop owner
    const shop = await prisma.shops.findUnique({
      where: { id: shopId },
      select: { sellerId: true }
    });

    if (!shop) {
      return next(new ValidationError("Shop not found"));
    }

    if (shop.sellerId !== req.user.id && req.user.role !== 'admin') {
      return next(new AuthError("Unauthorized access"));
    }

    const analytics = await prisma.shopAnalytics.findUnique({
      where: { id: shopId }
    });

    if (!analytics) {
      return res.status(200).json({
        success: true,
        analytics: {
          totalVisitors: 0,
          countryStats: {},
          cityStats: {},
          deviceStats: {}
        }
      });
    }

    res.status(200).json({
      success: true,
      analytics
    });
  } catch (error) {
    next(error);
  }
};

export const sellerNotifications = async (req: any, res: Response, next: NextFunction) => {
  try {
    const sellerId = req.seller.id
    const notifications = await prisma.notifications.findMany(({
      where: {
        receiverId:sellerId
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

export const markNotificationAsRead = async (req: any, res: Response, next: NextFunction) => {
  try {
      const { notificationId } = req.body
      if(!notificationId)return next(new ValidationError("Notification id is required!"))
    const notification = await prisma.notifications.update(({
      where: {
        id:notificationId
      },
      data: {
        status:"Read"
      }
    }))
    res.status(200).json({
      success: true,
      notification
    })
  } catch (error) {
    return next(error)
  }
}