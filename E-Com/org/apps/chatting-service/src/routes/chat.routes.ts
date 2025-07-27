import isAuthenticated from "@packages/middleware/isAuthenticated"
import express from "express"
import { fetchMessages, fetchSellerMessages, getSellerConversation, getUserConversation, newConversation } from "../controllers/chat.controllers"
import { isSeller } from "@packages/middleware/authorizeRole"

const router = express.Router()

router.post("/create-user-conversationGroup",isAuthenticated,newConversation)
router.post("/get-user-conversations",isAuthenticated,getUserConversation)
router.post("/get-seller-conversations",isAuthenticated,isSeller,getSellerConversation)
router.post("/get-messages/:conversationId",isAuthenticated,fetchMessages)
router.post("/get-seller-messages/:conversationId", isAuthenticated,isSeller, fetchSellerMessages)

export default router