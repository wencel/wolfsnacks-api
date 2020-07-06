const express = require('express');
const auth = require('../middlewares/auth');
const utils = require('../utils');
const Product = require('../models/product');

const productRouter = express.Router();

// Create product
productRouter.post('/', auth, async (req, res) => {
  debugger;
  const product = new Product({ ...req.body, user: req.user._id });
  try {
    await product.save();
    res.status(201).send(product);
  } catch (error) {
    res.status(400).send({ error });
  }
});
// Get products
productRouter.get('/', auth, async (req, res) => {
  try {
    const match = {};
    if (req.query.presentation) {
      match.presentation = req.query.presentation;
    }
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
    await req.user
      .populate({
        path: 'products',
        match,
        options: {
          limit,
          skip,
          sort,
        },
      })
      .execPopulate();
    res.send(req.user.products);
  } catch (error) {
    res.status(500).send({ error: error.toString() });
  }
});
// Get product
productRouter.get('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!product) {
      res.status(404).send({ error: 'Product not found' });
    }
    res.send(product);
  } catch (error) {
    error.reason
      ? res.status(400).send({ error: error.reason.toString() })
      : res.status(500).send({ error: error.toString() });
  }
});
// Update product
productRouter.patch('/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['basePrice', 'sellingPrice', 'stock'];
  const failedUpdates = utils.checkValidUpdates(updates, allowedUpdates);
  if (failedUpdates.length > 0) {
    return res.status(400).send({
      error: `Invalid fields to update ${failedUpdates.toString()}`,
    });
  }
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!product) {
      res.status(404).send({ error: 'Product not found' });
    }
    updates.forEach(u => {
      product[u] = req.body[u];
    });
    await product.save();
    res.send(product);
  } catch (error) {
    error.reason
      ? res.status(400).send({ error: error.reason.toString() })
      : res.status(500).send({ error: error.toString() });
  }
});
// Delete product
productRouter.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!product) {
      res.status(404).send({ error: 'Product not found' });
      return;
    }
    res.send(product);
  } catch (error) {
    error.reason
      ? res.status(400).send({ error: error.reason.toString() })
      : res.status(500).send({ error: error.toString() });
  }
});

module.exports = productRouter;
