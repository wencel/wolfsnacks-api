const express = require('express');
const userRouter = require('./routers/user');
const productRouter = require('./routers/product');
const customerRouter = require('./routers/customer');
const orderRouter = require('./routers/order');
const saleRouter = require('./routers/sale');
require('./db/mongoose');

const app = express();

app.use(express.json());

app.use('/api/users', userRouter);
app.use('/api/products', productRouter);
app.use('/api/customers', customerRouter);
app.use('/api/orders', orderRouter);
app.use('/api/sales', saleRouter);

module.exports = app;
