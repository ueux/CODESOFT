import express, { Router } from "express";
import { loginUser, userRegistration, verifUser } from "../controllers/auth.controller";

const router: Router = express.Router();

router.post("/user-registreation", userRegistration)
router.post("/verify-user", verifUser)
router.post("/lohin-user", loginUser);

export default router;