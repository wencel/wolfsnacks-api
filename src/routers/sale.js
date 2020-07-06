const express = require('express');
const auth = require('../middlewares/auth');
const utils = require('../utils');
const Sale = require('../models/sale');

const saleRouter = express.Router();

// Create sale
saleRouter.post('/', auth, async (req, res) => {
  const sale = new Sale({ ...req.body, user: req.user._id });
  try {
    await sale.save();
    res.status(201).send(sale);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});
// Get sales
saleRouter.get('/', auth, async (req, res) => {
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
    const sales = await Sale.find(match);
    res.send(sales);
  } catch (error) {
    res.status(500).send({ error: error.toString() });
  }
});
// Get sale
saleRouter.get('/:id', auth, async (req, res) => {
  try {
    const sale = await Sale.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!sale) {
      res.status(404).send({ error: 'Sale not found' });
    }
    res.send(sale);
  } catch (error) {
    error.reason
      ? res.status(400).send({ error: error.reason.toString() })
      : res.status(500).send({ error: error.toString() });
  }
});
// Update sale
saleRouter.patch('/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    'customer',
    'isThirteenDozen',
    'owes',
    'partialPayment',
    'totalPrice',
    'products',
  ];
  const failedUpdates = utils.checkValidUpdates(updates, allowedUpdates);
  if (failedUpdates.length > 0) {
    return res.status(400).send({
      error: `Invalid fields to update ${failedUpdates.toString()}`,
    });
  }
  try {
    const sale = await Sale.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!sale) {
      res.status(404).send({ error: 'Sale not found' });
    }
    updates.forEach(u => {
      sale[u] = req.body[u];
    });
    await sale.save();
    res.send(sale);
  } catch (error) {
    error.reason
      ? res.status(400).send({ error: error.reason.toString() })
      : res.status(500).send({ error: error.toString() });
  }
});
// Delete sale
saleRouter.delete('/:id', auth, async (req, res) => {
  try {
    const sale = await Sale.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!sale) {
      res.status(404).send({ error: 'Sale not found' });
      return;
    }
    await sale.remove();
    res.send(sale);
  } catch (error) {
    error.reason
      ? res.status(400).send({ error: error.reason.toString() })
      : res.status(500).send({ error: error.toString() });
  }
});

module.exports = saleRouter;
