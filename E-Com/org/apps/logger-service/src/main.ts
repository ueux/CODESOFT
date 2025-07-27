
import express from 'express';
import * as path from 'path';
import cookieParser from "cookie-parser";

const app = express();
app.use(express.json())
app.use(cookieParser())

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/', (req, res) => {
  res.send({ message: 'Welcome to logger-service!' });
});

const port = process.env.PORT || 6008;
const server = app.listen(port, () => {
  console.log(`[Logger Service Running... ] Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
