import express from 'express';
import cors from 'cors';
import './db/mongoose.js';
import userRouter from './routers/user.js';
import productRouter from './routers/product.js';
import customerRouter from './routers/customer.js';
import orderRouter from './routers/order.js';
import saleRouter from './routers/sale.js';
import utilsRouter from './routers/utils.js';

const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://192.168.1.138:3001',
  'http://wolfsnacks-app.herokuapp.com',
  'https://wolfsnacks-app.herokuapp.com',
];
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
