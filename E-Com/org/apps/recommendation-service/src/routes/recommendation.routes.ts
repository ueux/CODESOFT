import isAuthenticated from "@packages/middleware/isAuthenticated";
import express,{ Router } from "express";
import { getRecommendedProducts } from "../controllers/recommendation..controllers";

// Router setup
const router: Router = express.Router();
router.get(
    "/get-recommendation-products",
    isAuthenticated,
    getRecommendedProducts
);

export default router;