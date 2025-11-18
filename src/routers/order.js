import express from 'express';
import auth from '../middlewares/auth.js';
import { checkValidUpdates } from '../utils.js';
import Order from '../models/order.js';
import { errorMessages } from '../constants.js';

const orderRouter = express.Router();

// Create order
orderRouter.post('/', auth, async (req, res) => {
  const order = new Order({ ...req.body, user: req.user._id });
  try {
    await order.save();
    res.status(201).send(order);
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: error.toString() });
  }
});
// Get orders
orderRouter.get('/', auth, async (req, res) => {
  try {
    const match = {};
    if (req.query.initDate && req.query.endDate) {
      match.orderDate = {
        $gte: new Date(req.query.initDate),
        $lte: new Date(req.query.endDate),
      };
    }
    const sort = {};
    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(':');
      sort[parts[0]] = parts[1] === 'desc' ? 1 : -1;
    }
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = req.query.skip ? parseInt(req.query.skip) : 0;
    await req.user.populate({
      path: 'orders',
      match,
      options: {
        limit,
        skip,
        sort,
      },
    });
    const total = await Order.countDocuments({
      user: req.user._id,
      ...match,
    });
    res.send({ data: req.user.orders, limit, skip, total });
  } catch (error) {
    res.status(500).send({ error: error.toString() });
  }
});
// Get order
orderRouter.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!order) {
      return res.status(404).send({ error: errorMessages.ORDER_NOT_FOUND });
    }
    res.send(order);
  } catch (error) {
    error.reason
      ? res.status(400).send({ error: error.reason.toString() })
      : res.status(500).send({ error: error.toString() });
  }
});
// Update order
orderRouter.patch('/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['totalPrice', 'products', 'orderDate'];
  const failedUpdates = checkValidUpdates(updates, allowedUpdates);
  if (failedUpdates.length > 0) {
    return res.status(400).send({
      error: `Invalid fields to update ${failedUpdates.toString()}`,
    });
  }
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!order) {
      return res.status(404).send({ error: errorMessages.ORDER_NOT_FOUND });
    }
    updates.forEach(u => {
      order[u] = req.body[u];
    });
    await order.save();
    res.send(order);
  } catch (error) {
    error.reason
      ? res.status(400).send({ error: error.reason.toString() })
      : res.status(500).send({ error: error.toString() });
  }
});
// Delete order
orderRouter.delete('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findOneAnDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!order) {
      res.status(404).send({ error: errorMessages.ORDER_NOT_FOUND });
      return;
    }
    res.send(order);
  } catch (error) {
    error.reason
      ? res.status(400).send({ error: error.reason.toString() })
      : res.status(500).send({ error: error.toString() });
  }
});

export default orderRouter;
