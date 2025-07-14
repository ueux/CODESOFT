import express,{ Router } from "express";
import { creatDiscountCodes, createProduct, deleteDiscountCode, deleteProduct, deleteProductImage, getCategories, getDiscountCodes, getShopProducts, restoreProduct, uploadProductImage } from "../controllers/product.controller";
import isAuthenticated from "@packages/middleware/isAuthenticated";

const router: Router = express.Router();

router.get("/get-categories", getCategories)
router.post("/create-discount-code",isAuthenticated,creatDiscountCodes)
router.delete("/delete-discount-code/:id",isAuthenticated,deleteDiscountCode)
router.get("/get-discount-codes",isAuthenticated,getDiscountCodes)
router.post("/upload-product-image",isAuthenticated,uploadProductImage)
router.delete("/delete-product-image/:fileId",isAuthenticated,deleteProductImage)
router.post("/create-product",isAuthenticated,createProduct)
router.get("/get-shop-products",isAuthenticated,getShopProducts)
router.delete("/delete-product/:id",isAuthenticated,deleteProduct)
router.put("/restore-product/:id",isAuthenticated,restoreProduct)

export default router; 