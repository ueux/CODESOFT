import { AuthError, NotFoundError, ValidationError } from "@packages/error-handler";
import prisma from "@packages/libs/prisma";
import redis from "@packages/libs/redis";
import { clearUnseenCount, getUnseenCount } from "@packages/libs/redis/message.redis";
import { NextFunction, Request, Response } from "express";

export const newConversation = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sellerId } = req.body;
    const userId = req.user.id;
    if (!sellerId) return next(new ValidationError("SellerId is Required"));
    const existingGroup = await prisma.conversationGroup.findFirst({
      where: {
        isGroup: false,
        participantIds: {
          hasEvery: [userId, sellerId],
        },
      },
    });
    if (existingGroup)
      return res
        .status(200)
        .json({ Conversation: existingGroup, isNew: false });
    const newGroup = await prisma.conversationGroup.create({
      data: {
        isGroup: false,
        creatorId: userId,
        participantIds: [userId, sellerId],
      },
    });
    await prisma.participant.createMany({
      data: [
        {
          conversationId: newGroup.id,
          userId,
        },
        {
          conversationId: newGroup.id,
          sellerId,
        },
      ],
    });
    return res.status(201).json({ conversation: newGroup, isNew: true });
  } catch (error) {
    return next(error);
  }
};

export const getUserConversation = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    const conversations = await prisma.conversationGroup.findMany({
      where: {
        participantIds: {
          has: userId,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
    const responseData = await Promise.all(
      conversations.map(async (group) => {
        const sellerPaticipant = await prisma.participant.findFirst({
          where: {
            conversationId: group.id,
            sellerId: { not: null },
          },
        });
        let seller = null;
        if (sellerPaticipant?.sellerId) {
          seller = await prisma.sellers.findUnique({
            where: {
              id: sellerPaticipant.sellerId,
            },
            include: {
              shop: true,
            },
          });
        }
        const lastMessage = await prisma.message.findFirst({
          where: {
            conversationId: group.id,
          },
          orderBy: {
            createdAt: "desc",
          },
        });
        let isOnline = false;
        if (sellerPaticipant?.sellerId) {
          const redisKey = `online:seller:${sellerPaticipant?.sellerId}`;
          const redisResult = await redis.get(redisKey);
          isOnline = !!redisResult;
        }
        const unreadCount = await getUnseenCount("user", group.id);
        return ({
          conversationId: group.id,
          seller: {
            id: seller?.id || null,
            name: seller?.shop?.name || "Unknown",
            isOnline,
            avatar: seller?.shop?.avatar,
          },
          lastMessage:
            lastMessage?.content || "Say something to start a conversation",
          lastMassageAt: lastMessage?.createdAt || group.updatedAt,
          unreadCount,
        });
      })
    );
    return res.status(200).json({ conversations: responseData });
  } catch (error) {
    return next(error);
  }
};

export const getSellerConversation = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req.seller.id;
    const conversations = await prisma.conversationGroup.findMany({
      where: {
        participantIds: {
          has: sellerId,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
    const responseData = await Promise.all(
      conversations.map(async (group) => {
        const userPaticipant = await prisma.participant.findFirst({
          where: {
            conversationId: group.id,
            userId: { not: null },
          },
        });
        let user = null;
        if (userPaticipant?.userId) {
          user = await prisma.users.findUnique({
            where: {
              id: userPaticipant.userId,
            }
          });
        }
        const lastMessage = await prisma.message.findFirst({
          where: {
            conversationId: group.id,
          },
          orderBy: {
            createdAt: "desc",
          },
        });
        let isOnline = false;
        if (userPaticipant?.userId) {
          const redisKey = `online:user:user_:${userPaticipant?.userId}`;
          const redisResult = await redis.get(redisKey);
          isOnline = !!redisResult;
        }
        const unreadCount = await getUnseenCount("seller", group.id);
        return {
          conversationId: group.id,
          user: {
            id: user?.id || null,
            name: user?.name || "Unknown",
            isOnline,
            avatar: user?.avatar||null,
          },
          lastMessage:
            lastMessage?.content || "Say something to start a conversation",
          lastMassageAt: lastMessage?.createdAt || group.updatedAt,
          unreadCount,
        };
      })
    );
    return res.status(200).json({ conversations: responseData });
  } catch (error) {
    return next(error);
  }
};

export const fetchMessages = async (req: any, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.id
        const { conversationId } = req.params
        const page = parseInt(req.query.page as string) || 1
        const pageSize = 10
        if(!conversationId) return next(new ValidationError("Conversation ID is required"))
        const conversation = await prisma.conversationGroup.findUnique({
            where: {
                id:conversationId
            }
        })
        if(!conversation) return next(new NotFoundError("Conversation not found"))
        const hasAccess = conversation.participantIds.includes(userId)
        if(!hasAccess)return next(new AuthError("Access dened to this conversation"))
        await clearUnseenCount("user", conversationId)
        const sellerPaticipant = await prisma.participant.findFirst({
            where: {
                conversationId,
                sellerId:{not:null}
            }
        })
        let seller = null
        let isOnline = false
        if (sellerPaticipant?.sellerId) {
            seller = await prisma.sellers.findUnique({
                where: {
                    id:sellerPaticipant.sellerId
                },
                include: {
                    shop:true
                }
            })
            const redisKey = `online:seller:${sellerPaticipant?.sellerId}`
            const redisResult = await redis.get(redisKey)
            isOnline=!!redisResult
        }
        const messages = await prisma.message.findMany({
            where: {
                conversationId
            },
            orderBy: {
                createdAt:"desc"
            },
            skip: (page - 1) * pageSize,
            take:pageSize
        })
        return res.status(200).json({
            messages, seller: {
                id: seller?.id || null,
                name: seller?.shop?.name,
                avatar: seller?.shop?.avatar || null,
                isOnline
            },
            currentPage: page,
            hasMore:messages.length===pageSize
        })
    } catch (error) {
        return next(error)
    }
}

export const fetchSellerMessages = async (req: any, res: Response, next: NextFunction) => {
    try {
        const sellerId = req.seller.id
        const { conversationId } = req.params
        const page = parseInt(req.query.page as string) || 1
        const pageSize = 10
        if(!conversationId) return next(new ValidationError("Conversation ID is required"))
        const conversation = await prisma.conversationGroup.findUnique({
            where: {
                id:conversationId
            }
        })
        if(!conversation) return next(new NotFoundError("Conversation not found"))
        const hasAccess = conversation.participantIds.includes(sellerId)
        if(!hasAccess)return next(new AuthError("Access dened to this conversation"))
        await clearUnseenCount("seller", conversationId)
        const userPaticipant = await prisma.participant.findFirst({
            where: {
                conversationId,
                userId:{not:null}
            }
        })
        let user = null
        let isOnline = false
        if (userPaticipant?.userId) {
            user = await prisma.users.findUnique({
                where: {
                    id:userPaticipant.userId
                }
            })
            const redisKey = `online:user:user_:${userPaticipant?.userId}`
            const redisResult = await redis.get(redisKey)
            isOnline=!!redisResult
        }
        const messages = await prisma.message.findMany({
            where: {
                conversationId
            },
            orderBy: {
                createdAt:"desc"
            },
            skip: (page - 1) * pageSize,
            take:pageSize
        })
        return res.status(200).json({
            messages, user: {
                id: user?.id || null,
                name: user?.name||"Unknown",
                avatar: user?.avatar || null,
                isOnline
            },
            currentPage: page,
            hasMore:messages.length===pageSize
        })
    } catch (error) {
        return next(error)
    }
}