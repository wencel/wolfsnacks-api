const express = require('express');
const auth = require('../middlewares/auth');
const utils = require('../utils');
const Order = require('../models/order');

const orderRouter = express.Router();

// Create order
orderRouter.post('/', auth, async (req, res) => {
  const order = new Order({ ...req.body, user: req.user._id });
  try {
    await order.save();
    res.status(201).send(order);
  } catch (error) {
    res.status(400).send({ error });
  }
});
// Get orders
orderRouter.get('/', auth, async (req, res) => {
  try {
    const match = {};
    if (req.query.textQuery) {
      match['$text'] = {
        $search: req.query.textQuery,
      };
    }
    const sort = {};
    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(':');
      sort[parts[0]] = parts[1] === 'desc' ? 1 : -1;
    }
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = req.query.skip ? parseInt(req.query.skip) : 0;
    const orders = await Order.find(match);
    res.send(orders);
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
      res.status(404).send({ error: 'Order not found' });
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
  const allowedUpdates = ['totalPrice', 'products'];
  const failedUpdates = utils.checkValidUpdates(updates, allowedUpdates);
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
      res.status(404).send({ error: 'Order not found' });
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
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!order) {
      res.status(404).send({ error: 'Order not found' });
      return;
    }
    await order.remove();
    res.send(order);
  } catch (error) {
    error.reason
      ? res.status(400).send({ error: error.reason.toString() })
      : res.status(500).send({ error: error.toString() });
  }
});

module.exports = orderRouter;
