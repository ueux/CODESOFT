import express, { Router } from "express";
import { getUser, loginUser, refreshToken, resetUserPassword, userForgotPassword, userRegistration, verifUser, verifyUserForgotPassword } from "../controllers/auth.controller";
import isAuthenticated from "../../../../packages/middleware/isAuthenticated";

const router: Router = express.Router();

router.post("/user-registration", userRegistration)
router.post("/verify-user", verifUser)
router.post("/login-user", loginUser);
router.post("/forgot-password-user", userForgotPassword);
router.post("/verify-forgot-password-otp-user", verifyUserForgotPassword);
router.post("/reset-password-user", resetUserPassword);
router.post("/refresh-token-user", refreshToken)
router.get("/logged-in-user", isAuthenticated,getUser)


export default router;