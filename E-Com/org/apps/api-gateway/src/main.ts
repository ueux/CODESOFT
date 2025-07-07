
import express from 'express';
import * as path from 'path';
import cors from 'cors';
import proxy from "express-http-proxy";
import morgan from "morgan";
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import axios from 'axios';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors(
  {
    origin: ['http://localhost:3000'], // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
    credentials: true // Allow credentials (cookies, authorization headers, etc.)
  }
));
app.use(morgan('dev'));
app.use(express.json({limit: '100mb'})); // Increase the limit to 100mb
app.use(express.urlencoded({ extended: true,limit: '100mb' })); // Increase the limit to 100mb
app.use(cookieParser());
app.set('trust proxy', 1); // Trust first proxy
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: (req:any)=>(req.user?1000:100), // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req:any) => req.ip,
});
app.use(limiter);

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/gateway-health', (req, res) => {
  res.send({ message: 'Welcome to api-gateway!' });
}); 

app.use("/", proxy("http://localhost:6001")); // Auth Service

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
