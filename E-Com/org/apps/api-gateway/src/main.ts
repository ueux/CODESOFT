
import express from 'express';
import * as path from 'path';
import cors from 'cors';
import proxy from "express-http-proxy";
import morgan from "morgan";
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import initializeSiteConfig from './libs/initializeSiteConfig';

const app = express();

app.use(cors(
  {
    origin: ['http://localhost:3000','http://localhost:3001','http://localhost:3002'], // Allow all origins
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
app.use("/recommendation", proxy("http://localhost:6007")); // Recommendation Service
app.use("/chatting", proxy("http://localhost:6006")); // Chatting Service
app.use("/admin", proxy("http://localhost:6005")); // Admin Service
app.use("/order", proxy("http://localhost:6004")); // Order Service
app.use("/seller", proxy("http://localhost:6003")); // Seller Service
app.use("/product", proxy("http://localhost:6002")); // Product Service **Should be before "/" **
app.use("/", proxy("http://localhost:6001")); // Auth Service

const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}/api`);

  try {
    initializeSiteConfig()
    console.log("Site config initialized successfully!")
  } catch (error) {
    console.error("Failed to initialize site config:",error)
  }
});
server.on('error', console.error);
