import express,{ Router } from "express";
import { creatDiscountCodes, deleteDiscountCode, getCategories, getDiscountCodes } from "../controllers/product.controller";
import isAuthenticated from "@packages/middleware/isAuthenticated";

const router: Router = express.Router();

router.get("/get-categories", getCategories)
router.post("/create-discount-code",isAuthenticated,creatDiscountCodes)
router.delete("/delete-discount-code/:id",isAuthenticated,deleteDiscountCode)
router.get("/get-discount-codes",isAuthenticated,getDiscountCodes)


export default router;