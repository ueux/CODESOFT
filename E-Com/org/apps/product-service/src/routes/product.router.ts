import express,{ Router } from "express";
import { creatDiscountCodes, createProduct, deleteDiscountCode, deleteProduct, deleteProductImage, getAllEvents, getAllProducts, getCategories, getDiscountCodes, getFilteredEvents, getFilteredProducts, getFilteredShops, getProduct, getShopEvents, getShopProducts, getTopShops, restoreProduct, searchProducts, uploadProductImage } from "../controllers/product.controller";
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
router.get("/get-shop-events",isAuthenticated,getShopEvents)
router.delete("/delete-product/:id",isAuthenticated,deleteProduct)
router.put("/restore-product/:id",isAuthenticated,restoreProduct)
router.get("/get-all-products",getAllProducts)
router.get("/get-all-events",getAllEvents)
router.get("/get-product/:slug",getProduct)
router.get("/get-filtered-products",getFilteredProducts)
router.get("/get-filtered-events",getFilteredEvents)
router.get("/get-filtered-shops",getFilteredShops)
router.get("/search-products", searchProducts)
router.get("/get-top-shops",getTopShops)

export default router;