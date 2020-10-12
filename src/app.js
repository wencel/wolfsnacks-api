const express = require('express');
const cors = require('cors');
const userRouter = require('./routers/user');
const productRouter = require('./routers/product');
const customerRouter = require('./routers/customer');
const orderRouter = require('./routers/order');
const saleRouter = require('./routers/sale');
const utilsRouter = require('./routers/utils');

require('./db/mongoose');

const app = express();

const allowedOrigins = ['http://localhost:3001', 'http://192.168.1.138:3001'];
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

module.exports = app;
