import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function cleanupExpiredProducts() {
  try {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Delete products where `isDeleted` is true and `deletedAt` is older than 24 hours
    const deletedProducts = await prisma.products.deleteMany({
      where: {
        isDeleted: true,
        deletedAt: {
          lte: twentyFourHoursAgo,
        },
      },
    });

    console.log(
      `${deletedProducts.count} expired products permanently deleted.`
    );
    return deletedProducts.count;
  } catch (error) {
    console.error("Error cleaning up expired products:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

import cron from "node-cron";

cron.schedule("0 * * * *", async () => {
  await cleanupExpiredProducts();
});

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function cleanupExpiredProducts() {
  try {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Delete products where `isDeleted` is true and `deletedAt` is older than 24 hours
    const deletedProducts = await prisma.products.deleteMany({
      where: {
        isDeleted: true,
        deletedAt: {
          lte: twentyFourHoursAgo
        },
      },
    });

    console.log(`${deletedProducts.count} expired products permanently deleted.`);
    return deletedProducts.count;
  } catch (error) {
    console.error('Error cleaning up expired products:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

import cron from 'node-cron';

cron.schedule('0 * * * *', async () => {
  await cleanupExpiredProducts();
});