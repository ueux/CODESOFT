import express,{ Router } from "express";
import { addNewAdmin, adminNotifications, getAllAdmins, getAllCustomizations, getAllEvents, getAllProducts, getAllSellers, getAllUsers, userNotifications } from "../controllers/admin.controllers";
import isAuthenticated from "@packages/middleware/isAuthenticated";
import { isAdmin } from "@packages/middleware/authorizeRole";

const router: Router = express.Router()

router.get("/get-all-products",isAuthenticated,isAdmin ,getAllProducts)
router.get("/get-all-events",isAuthenticated,isAdmin ,getAllEvents)
router.get("/get-all-admins",isAuthenticated,isAdmin ,getAllAdmins)
router.put("/add-new-admin",isAuthenticated,isAdmin ,addNewAdmin)
router.get("/get-all-users",isAuthenticated,isAdmin ,getAllUsers)
router.get("/get-all-sellers",isAuthenticated,isAdmin ,getAllSellers)
router.get("/get-all" ,getAllCustomizations)

router.get("/admin-notifications", isAuthenticated,isAdmin, adminNotifications);
router.get("/user-notifications", isAuthenticated, userNotifications);

export default router