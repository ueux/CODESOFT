
import express from 'express';
import * as path from 'path';
import cookieParser from "cookie-parser";
import router from './routes/admin.route';
import { errorMiddleware } from '@packages/error-handler/error-middleware';

const app = express();
app.use(express.json())
app.use(cookieParser())

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/', (req, res) => {
  res.send({ message: 'Welcome to admin-service!' });
});


app.use("/api",router)

app.use(errorMiddleware)

const port = process.env.PORT || 6005;
const server = app.listen(port, () => {
  console.log(`[Admin Service Running...] Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
