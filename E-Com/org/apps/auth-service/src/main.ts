import express from 'express';
import cors from 'cors';
import { errorMiddleware } from '@packages/error-handler/error-middleware';
import cookieParser from 'cookie-parser';
import router from './routes/auth.router';
import swaggerUi from "swagger-ui-express"
const swaggerDocument=require("./swagger-output.json")

const app = express();

app.use(cors({
    origin: ['http://localhost:3000'], // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
    credentials: true // Allow credentials (cookies, authorization headers, etc.))
}));
app.use(express.json()); // Parse JSON bodies
app.use(cookieParser()); // Parse cookies


const port = process.env.PORT ? Number(process.env.PORT) : 6001;

app.get('/', (req, res) => {
    res.send({ 'message': 'Hello API'});
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.get("/docs-json", (req, res) => {
    res.json(swaggerDocument)
})

app.use("/api",router)

app.use(errorMiddleware);

const server=app.listen(port, () => {
    console.log(`[ Auth service ready ] http://localhost:${port}`);
    console.log(`Swagger docs is available at http://localhost:${port}/docs `)
});
server.on('error', (err: Error) => {
    console.log(`[ Auth service error ] ${err}`);
});