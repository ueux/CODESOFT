import express, { Router } from "express";
import { createShop, createStripeConnectLink, getSeller, getUser, loginSeller, loginUser, refreshToken, registerSeler, resetUserPassword, userForgotPassword, userRegistration, verifUser, verifySeller, verifyUserForgotPassword } from "../controllers/auth.controller";
import isAuthenticated from "../../../../packages/middleware/isAuthenticated";
import { isSeller } from "../../../../packages/middleware/authorizeRole";

const router: Router = express.Router();

router.post("/user-registration", userRegistration)
router.post("/verify-user", verifUser)
router.post("/login-user", loginUser);
router.post("/forgot-password-user", userForgotPassword);
router.post("/verify-forgot-password-otp-user", verifyUserForgotPassword);
router.post("/reset-password-user", resetUserPassword);
router.post("/refresh-token-user", refreshToken)
router.get("/logged-in-user", isAuthenticated,getUser)
router.post("/seller-registration", registerSeler)
router.post("/verify-seller", verifySeller)
router.post("/create-shop", createShop)
router.post("/create-stripe-link", createStripeConnectLink)
router.post("/login-seller", loginSeller)
router.post("/logged-in-seller", isAuthenticated,isSeller,getSeller)


export default router;