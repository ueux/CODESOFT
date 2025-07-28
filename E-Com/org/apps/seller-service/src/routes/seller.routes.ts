// seller.routes.ts
import express, { Router } from "express";
import {
  getSeller,
  getSellerProducts,
  getSellerEvents,
  followShop,
  unfollowShop,
  isFollowingShop,
  getSellerReviews,
  trackShopVisit,
  getSellerFollowers,
  getSellerAnalytics
} from "../controllers/seller.controller";
import isAuthenticated from "@packages/middleware/isAuthenticated";

const router: Router = express.Router();

// Public routes
router.get("/get-seller/:id", getSeller);
router.get("/get-seller-products/:id", getSellerProducts);
router.get("/get-seller-events/:id", getSellerEvents);
router.get("/get-seller-reviews/:id", getSellerReviews);

// Authenticated routes
router.post("/follow-shop", isAuthenticated, followShop);
router.post("/unfollow-shop", isAuthenticated, unfollowShop);
router.get("/is-following/:shopId", isAuthenticated, isFollowingShop);
router.post("/track-shop-visit", isAuthenticated, trackShopVisit);

// Seller analytics (admin/seller only)
router.get("/get-followers/:shopId", isAuthenticated, getSellerFollowers);
router.get("/get-analytics/:shopId", isAuthenticated, getSellerAnalytics);

export default router;