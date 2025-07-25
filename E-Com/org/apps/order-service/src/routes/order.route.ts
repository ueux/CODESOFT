import isAuthenticated from "@packages/middleware/isAuthenticated";
import express, { Router } from "express";
import { createPaymentIntent, createPaymentSession, getOrderDetails, getSellerOrders, updateOrderStatus, verifyingPaymentSession } from "../controllers/order.controller";
import { isSeller } from "@packages/middleware/authorizeRole";

const router: Router = express.Router()

router.post("/create-payment-intent", isAuthenticated, createPaymentIntent)
router.post("/create-payment-session", isAuthenticated, createPaymentSession)
router.get("/verifying-payment-session", isAuthenticated, verifyingPaymentSession)
router.get("/get-seller-orders",isAuthenticated,isSeller,getSellerOrders)
router.get("/get-order-details/:orderId",isAuthenticated,getOrderDetails)
router.get("/update-status/:orderId",isAuthenticated,isSeller,updateOrderStatus)

export default router