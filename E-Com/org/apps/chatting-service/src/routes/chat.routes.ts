import isAuthenticated from "@packages/middleware/isAuthenticated"
import express from "express"
import { fetchMessages, fetchSellerMessages, getSellerConversation, getUserConversation, newConversation } from "../controllers/chat.controllers"
import { isSeller } from "@packages/middleware/authorizeRole"

const router = express.Router()

router.post("/create-user-conversationGroup",isAuthenticated,newConversation)
router.get("/get-user-conversations",isAuthenticated,getUserConversation)
router.get("/get-seller-conversations",isAuthenticated,isSeller,getSellerConversation)
router.get("/get-messages/:conversationId",isAuthenticated,fetchMessages)
router.get("/get-seller-messages/:conversationId", isAuthenticated,isSeller, fetchSellerMessages)

export default router