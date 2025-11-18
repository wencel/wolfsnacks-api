import express from 'express';
import auth from '../middlewares/auth.js';
import { checkValidUpdates } from '../utils.js';
import Sale from '../models/sale.js';
import { errorMessages } from '../constants.js';

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
    if (req.query.isThirteenDozen) {
      match.isThirteenDozen = req.query.isThirteenDozen === 'true';
    }
    if (req.query.owes) {
      match.owes = req.query.owes === 'true';
    }
    if (req.query.customer) {
      match.customer = req.query.customer;
    }
    if (req.query.initDate && req.query.endDate) {
      match.saleDate = {
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
      path: 'sales',
      populate: [
        {
          path: 'customer',
        },
        {
          path: 'products.product',
        },
      ],
      match,
      options: {
        limit,
        skip,
        sort,
      },
    });
    const total = await Sale.countDocuments({ user: req.user._id });
    res.send({ data: req.user.sales, limit, skip, total });
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
    }).populate([
      {
        path: 'customer',
      },
      {
        path: 'products.product',
      },
    ]);
    if (!sale) {
      return res.status(404).send({ error: errorMessages.SALE_NOT_FOUND });
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
    'saleDate',
  ];
  const failedUpdates = checkValidUpdates(updates, allowedUpdates);
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
      return res.status(404).send({ error: errorMessages.SALE_NOT_FOUND });
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
    const sale = await Sale.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!sale) {
      res.status(404).send({ error: errorMessages.SALE_NOT_FOUND });
      return;
    }
    res.send(sale);
  } catch (error) {
    error.reason
      ? res.status(400).send({ error: error.reason.toString() })
      : res.status(500).send({ error: error.toString() });
  }
});

export default saleRouter;
