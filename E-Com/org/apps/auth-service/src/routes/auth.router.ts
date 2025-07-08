import express, { Router } from "express";
import { userRegistration, verifUser } from "../controllers/auth.controller";

const router: Router = express.Router();

router.post("/user-registreation", userRegistration)
router.post("/verify-user",verifUser)

export default router;