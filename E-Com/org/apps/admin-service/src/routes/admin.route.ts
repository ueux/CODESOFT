import express,{ Router } from "express";
import { addNewAdmin, getAllAdmins, getAllCustomizations, getAllEvents, getAllProducts } from "../controllers/admin.controllers";
import isAuthenticated from "@packages/middleware/isAuthenticated";
import { isAdmin } from "@packages/middleware/authorizeRole";

const router: Router = express.Router()

router.get("/get-all-products",isAuthenticated,isAdmin ,getAllProducts)
router.get("/get-all-events",isAuthenticated,isAdmin ,getAllEvents)
router.get("/get-all-admins",isAuthenticated,isAdmin ,getAllAdmins)
router.put("/add-new-admin",isAuthenticated,isAdmin ,addNewAdmin)
router.get("/get-all" ,getAllCustomizations)

export default router