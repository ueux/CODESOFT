import express, { Router } from "express";
import { addUserAddress, createShop, createStripeConnectLink, deleteUserAddress, getSeller, getUser, getUserAddresses, loginAdmin, loginSeller, loginUser, refreshToken, registerSeler, resetUserPassword, updateUserPassword, userForgotPassword, userRegistration, verifUser, verifySeller, verifyUserForgotPassword } from "../controllers/auth.controller";
import isAuthenticated from "../../../../packages/middleware/isAuthenticated";
import { isSeller } from "../../../../packages/middleware/authorizeRole";

const router: Router = express.Router();

router.post("/user-registration", userRegistration)
router.post("/verify-user", verifUser)
router.post("/login-user", loginUser);
router.post("/forgot-password-user", userForgotPassword);
router.post("/verify-forgot-password-otp-user", verifyUserForgotPassword);
router.post("/reset-password-user", resetUserPassword);
router.post("/refresh-token", refreshToken)
router.get("/logged-in-user", isAuthenticated,getUser)
router.post("/seller-registration", registerSeler)
router.post("/verify-seller", verifySeller)
router.post("/create-shop", createShop)
router.post("/create-stripe-link", createStripeConnectLink)
router.post("/login-seller", loginSeller)
router.get("/logged-in-seller", isAuthenticated,isSeller,getSeller)
router.get("/shipping-addresses", isAuthenticated,getUserAddresses)
router.post("/add-address", isAuthenticated,addUserAddress)
router.delete("/delete-address/:addressId", isAuthenticated, deleteUserAddress)
router.post("/change-password", isAuthenticated, updateUserPassword)
router.post("/login-admin", loginAdmin);



export default router;