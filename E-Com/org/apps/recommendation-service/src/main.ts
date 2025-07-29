
import express from 'express';
import * as path from 'path';
import cookieParser from "cookie-parser";
import router from './routes/recommendation.routes';

const app = express();
app.use(express.json({ limit: "100mb" }))
app.use(express.urlencoded({limit:"100mb",extended:true}))
app.use(cookieParser())

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/', (req, res) => {
  res.send({ message: 'Welcome to recommendation-service!' });
});

app.use("/api",router)

const port = process.env.PORT || 6007;
const server = app.listen(port, () => {
  console.log(`[Recommendation Service Running... ]Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
