import express, { Router } from "express";
import { loginUser, resetUserPassword, userForgotPassword, userRegistration, verifUser, verifyUserForgotPassword } from "../controllers/auth.controller";

const router: Router = express.Router();

router.post("/user-registration", userRegistration)
router.post("/verify-user", verifUser)
router.post("/login-user", loginUser);
router.post("/forgot-password-user", userForgotPassword);
router.post("/verify-forgot-password-otp-user", verifyUserForgotPassword);
router.post("/reset-password-user",resetUserPassword);


export default router;