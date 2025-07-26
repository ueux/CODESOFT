import express,{ Router } from "express";
import { getAllProducts } from "../controllers/admin.controllers";
import isAuthenticated from "@packages/middleware/isAuthenticated";
import { isAdmin } from "@packages/middleware/authorizeRole";

const router: Router = express.Router()

router.get("/get-all-products",isAuthenticated,isAdmin ,getAllProducts)

export default router