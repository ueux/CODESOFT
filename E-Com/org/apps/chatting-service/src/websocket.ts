import { kafka } from "@packages/utils/kafka";
import { WebSocket, WebSocketServer } from "ws"
import { Server as HttpServer} from "http"
import redis from "@packages/libs/redis";
const producer = kafka.producer()
const connectedUsers: Map<string, WebSocket> = new Map()
const unseenCount: Map<string, number> = new Map()

type IncommingMessage = {
    type?: string;
    fromUserId: string;
    toUserId: string;
    messageBody: string;
    conversationId: string;
    senderType: string;
}

export async function createWebSocketServer(server: HttpServer) {
    const wss = new WebSocketServer({ server })
    await producer.connect()
    console.log("Kafka producer connected")

    wss.on("connection", (ws: WebSocket) => {
        console.log("New Websocket connection!")
        let registeredUserId: string | null = null
        ws.on("message", async (rawMessage) => {
            try {
                const messageStr = rawMessage.toString()
                if (!registeredUserId && !messageStr.startsWith("{")) {
                    registeredUserId = messageStr;
                    connectedUsers.set(registeredUserId, ws)
                    console.log(`Registered websocker for UserId:${registeredUserId}`)
                    const isSeller = registeredUserId?.startsWith("seller_")
                    const redisKey = isSeller ? `online:seller:${registeredUserId?.replace("seller_", "")}` : `online:user:${registeredUserId}`
                    await redis.set(redisKey, "1")
                    await redis.expire(redisKey, 300)
                    return
                }

                const data: IncommingMessage = JSON.parse(messageStr)
                if (data.type === "MARK_AS_SEEN" && registeredUserId) {
                    const seenKey = `${registeredUserId}_${data.conversationId}`
                    unseenCount.set(seenKey, 0)
                    return
                }

                const { fromUserId, toUserId, messageBody, conversationId, senderType } = data
                if (!data || !toUserId || !messageBody || !conversationId) {
                    console.warn("Invalid message format:", data)
                    return
                }

                const now = new Date().toISOString()
                const messagePayload = {
                    conversationId, senderId: fromUserId,
                    content: messageBody, senderType,
                    createdAt:now
                }
                const messageEvent = JSON.stringify({
                    type: "NEW_MESSAGE",
                    payload:messagePayload
                })
                const receiverKey=senderType==="user"?`seller_${toUserId}`:`user_${toUserId}`
                const senderKey = senderType === "user" ? `user_${toUserId}` : `seller_${toUserId}`

                const unseenKey = `${receiverKey}_${conversationId}`
                const prevCount = unseenCount.get(unseenKey) || 0
                unseenCount.set(unseenKey, prevCount + 1)

                const receiverSocket = connectedUsers.get(receiverKey)
                if (receiverSocket && receiverSocket.readyState === WebSocket.OPEN) {
                    receiverSocket.send(messageEvent)

                    receiverSocket.send(JSON.stringify({
                        type: "UNSEEN_COUNT_UPDATE",
                        payload: {
                            conversationId,
                            count:prevCount+1
                        }
                    }))

                    console.log(`Delivered message + unseen count to ${receiverKey}`)
                } else {
                console.log(`USER ${receiverKey} is offline. Message queued`)
                }

                const senderSocket = connectedUsers.get(senderKey)
                if (senderSocket && senderSocket.readyState === WebSocket.OPEN) {
                    senderSocket.send(messageEvent)
                    console.log(`Echoed message to sender ${senderKey}`)
                }

                await producer.send({
                    topic: "chat.mew_message",
                    messages: [{
                        key: conversationId,
                        value:JSON.stringify(messagePayload)
                    }]
                })

                console.log(`Message queued to kafka: ${conversationId}`)
            } catch (error) {
                console.log(`Error processing WebSocket message: ${error}`)
            }
        })

        ws.on("close", async () => {
            if (registeredUserId) {
                connectedUsers.delete(registeredUserId)
                console.log((`Disconnected user ${registeredUserId}`))
                const isSeller = registeredUserId.startsWith("seller_")
                const redisKey = isSeller ? `online:seller:${registeredUserId.replace("seller_", "")}` :
                    `online:user:${registeredUserId}`
                await redis.del(redisKey)
            }
        })

        ws.on("error", (err) => {
            console.log("WedSocket error:",err)
        })
    })
    console.log("WebSocket server ready")
}