
import express from 'express';
import * as path from 'path';
import cookieParser from "cookie-parser"
import router from './routes/seller.routes';

const app = express();
app.use(express.json())
app.use(cookieParser())

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to seller-service!' });
});

app.use("/api",router)

const port = process.env.PORT || 6003;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
