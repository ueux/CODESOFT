
import express from 'express';
import * as path from 'path';
import cookieParser from "cookie-parser";
import { createWebSocketServer } from './websocket';
import { startConsumer } from './chat-message-consummer';

const app = express();
app.use(express.json())
app.use(cookieParser())
app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/', (req, res) => {
  res.send({ message: 'Welcome to chatting-service!' });
});

const port = process.env.PORT || 6006;
const server = app.listen(port, () => {
  console.log(`[Chatting Service Running... ]Listening at http://localhost:${port}/api`);
});

createWebSocketServer(server)

startConsumer().catch((error: any) => {
  console.log(error)
})
server.on('error', console.error);
