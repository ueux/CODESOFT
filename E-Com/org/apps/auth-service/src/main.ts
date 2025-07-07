import express from 'express';
import cors from 'cors';
import { errorMiddleware } from '../../../packages/error-handler/error-middleware';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
    origin: ['http://localhost:3000'], // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
    credentials: true // Allow credentials (cookies, authorization headers, etc.))
}));
app.use(express.json()); // Parse JSON bodies
app.use(cookieParser()); // Parse cookies

app.use(errorMiddleware);

const port = process.env.PORT ? Number(process.env.PORT) : 6001;

app.get('/', (req, res) => {
    res.send({ 'message': 'Hello API'});
});

const server=app.listen(port, () => {
    console.log(`[ Auth service ready ] http://localhost:${port}`);
});
server.on('error', (err: Error) => {
    console.log(`[ Auth service error ] ${err}`);
});