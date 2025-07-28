// main.ts
import express from 'express';
import * as path from 'path';
import cookieParser from "cookie-parser";
import http from "http";
import WebSocket from "ws";
import { consumeKafkaMessages } from './logger-consumer';
import { disconnectAll } from "@packages/utils/kafka";

const app = express();
app.use(express.json())
app.use(cookieParser())

app.use('/assets', express.static(path.join(__dirname, 'assets')));

const wsServer = new WebSocket.Server({ noServer: true })
export const clients = new Set<WebSocket>()

wsServer.on("connection", (ws) => {
  console.log("New logger client connected")
  clients.add(ws)
  ws.on("close", () => {
    console.log("Logger client disconnected")
    clients.delete(ws)
  })
})

const server = http.createServer(app)
server.on("upgrade", (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, (ws) => {
    wsServer.emit("connection", ws, request)
  })
})

const port = process.env.PORT || 6008;
server.listen(port, () => {
  console.log(`[Logger Service Running... ] Listening at http://localhost:${port}/api`);
});

server.on('error', console.error);

// Start Kafka consumer
consumeKafkaMessages().catch(console.error);

// Graceful shutdown
const shutdown = async () => {
  console.log('Shutting down gracefully...');

  // Close WebSocket connections
  clients.forEach(client => client.close());
  clients.clear();

  // Close Kafka connections using the utility function
  await disconnectAll();

  // Close HTTP server
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);