import express from 'express';
import auth from '../middlewares/auth.js';
import { checkValidUpdates } from '../utils.js';
import Product from '../models/product.js';
import { errorMessages } from '../constants.js';
import logger from '../utils/logger.js';

const productRouter = express.Router();

// Create product
productRouter.post('/', auth, async (req, res) => {
  const product = new Product({ ...req.body, user: req.user._id });
  try {
    await product.save();
    res.status(201).send(product);
  } catch (error) {
    logger.error({ error, entity: 'product', operation: 'create', userId: req.user._id }, 'Error creating product');
    res.status(400).send({ error: error.toString() });
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
      const regex = new RegExp(`${req.query.textQuery}(h?)`, 'gmi');
      match['$or'] = [
        {
          name: { $regex: regex },
        },
        {
          presentation: { $regex: regex },
        },
      ];
    }
    const sort = {
      name: 'desc',
      weight: 'asc',
      presentation: 'asc',
    };

    // if (req.query.sortBy) {
    //   const parts = req.query.sortBy.split(':');
    //   sort[parts[0]] = parts[1] === 'desc' ? 1 : -1;
    // }
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = req.query.skip ? parseInt(req.query.skip) : 0;
    await req.user.populate({
      path: 'products',
      match,
      options: {
        limit,
        skip,
        sort,
      },
    });
    const total = await Product.countDocuments({
      user: req.user._id,
      ...match,
    });
    res.send({ data: req.user.products, limit, skip, total });
  } catch (error) {
    logger.error({ error, entity: 'product', operation: 'list', userId: req.user._id }, 'Error listing products');
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
      return res.status(404).send({ error: errorMessages.PRODUCT_NOT_FOUND });
    }
    res.send(product);
  } catch (error) {
    logger.error({ error, entity: 'product', operation: 'read', userId: req.user._id, productId: req.params.id }, 'Error getting product');
    error.reason
      ? res.status(400).send({ error: error.reason.toString() })
      : res.status(500).send({ error: error.toString() });
  }
});
// Update product
productRouter.patch('/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['basePrice', 'sellingPrice', 'stock'];
  const failedUpdates = checkValidUpdates(updates, allowedUpdates);
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
      return res.status(404).send({ error: errorMessages.PRODUCT_NOT_FOUND });
    }
    updates.forEach(u => {
      product[u] = req.body[u];
    });
    await product.save();
    res.send(product);
  } catch (error) {
    logger.error({ error, entity: 'product', operation: 'update', userId: req.user._id, productId: req.params.id }, 'Error updating product');
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
      res.status(404).send({ error: errorMessages.PRODUCT_NOT_FOUND });
      return;
    }
    res.send(product);
  } catch (error) {
    logger.error({ error, entity: 'product', operation: 'delete', userId: req.user._id, productId: req.params.id }, 'Error deleting product');
    error.reason
      ? res.status(400).send({ error: error.reason.toString() })
      : res.status(500).send({ error: error.toString() });
  }
});

export default productRouter;
