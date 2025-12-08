import express from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import logger from './utils/logger.js';
import './db/mongoose.js';
import userRouter from './routers/user.js';
import productRouter from './routers/product.js';
import customerRouter from './routers/customer.js';
import orderRouter from './routers/order.js';
import saleRouter from './routers/sale.js';
import utilsRouter from './routers/utils.js';

const app = express();

// Add pino-http middleware for request logging
app.use(
  pinoHttp({
    logger,
    customLogLevel: function (req, res, err) {
      if (res.statusCode >= 400 && res.statusCode < 500) {
        return 'warn';
      } else if (res.statusCode >= 500 || err) {
        return 'error';
      }
      return 'info';
    },
  })
);

const defaultOrigins = [
  'http://localhost:5173',
];

// Allow additional origins from environment variable (comma-separated)
const additionalOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
  : [];

const allowedOrigins = [...defaultOrigins, ...additionalOrigins];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin
      // (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        var msg =
          'The CORS policy for this site does not ' +
          'allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  })
);
app.use(express.json());

app.use('/api/users', userRouter);
app.use('/api/products', productRouter);
app.use('/api/customers', customerRouter);
app.use('/api/orders', orderRouter);
app.use('/api/sales', saleRouter);
app.use('/api/utils', utilsRouter);

export default app;
