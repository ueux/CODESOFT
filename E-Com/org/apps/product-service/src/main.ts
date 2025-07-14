import express from 'express';
import cors from 'cors';
import { errorMiddleware } from '@packages/error-handler/error-middleware';
import cookieParser from 'cookie-parser';
import router from './routes/product.router';
import swaggerUi from "swagger-ui-express"
import bodyParser from "body-parser"
const swaggerDocument=require("./swagger-output.json")
import "./jobs/product-crone.job"
const app = express();

app.use(cors({
    origin: ['http://localhost:3000'], // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
    credentials: true // Allow credentials (cookies, authorization headers, etc.))
}));
// Increase JSON payload limit (e.g., 50MB)
app.use(bodyParser.json({ limit: '50mb' }));

// Increase URL-encoded payload limit
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true })); // Parse JSON bodies
app.use(cookieParser()); // Parse cookies


const port = process.env.PORT ? Number(process.env.PORT) : 6002;

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
    console.log(`[ Product service ready ] http://localhost:${port}`);
    console.log(`Swagger docs is available at http://localhost:${port}/docs `)
});
server.on('error', (err: Error) => {
    console.log(`[ Auth service error ] ${err}`);
});