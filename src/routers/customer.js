import express from 'express';
import auth from '../middlewares/auth.js';
import { checkValidUpdates } from '../utils.js';
import Customer from '../models/customer.js';
import { errorMessages } from '../constants.js';
import logger from '../utils/logger.js';

const customerRouter = express.Router();

// Create customer
customerRouter.post('/', auth, async (req, res) => {
  const customer = new Customer({ ...req.body, user: req.user._id });
  try {
    await customer.save();
    res.status(201).send(customer);
  } catch (error) {
    logger.error({ error, entity: 'customer', operation: 'create', userId: req.user._id }, 'Error creating customer');
    res.status(400).send({ error });
  }
});
// Get customers
customerRouter.get('/', auth, async (req, res) => {
  try {
    const match = {};
    if (req.query.textQuery) {
      const regex = new RegExp(`${req.query.textQuery}(h?)`, 'gmi');
      match['$or'] = [
        {
          name: { $regex: regex },
        },
        {
          email: { $regex: regex },
        },
        {
          storeName: { $regex: regex },
        },
      ];
    }
    const sort = {};
    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(':');
      sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = req.query.skip ? parseInt(req.query.skip) : 0;
    await req.user.populate({
      path: 'customers',
      match,
      options: {
        limit,
        skip,
        sort,
      },
    });
    const total = await Customer.countDocuments({
      user: req.user._id,
      ...match,
    });
    res.send({ data: req.user.customers, limit, skip, total });
  } catch (error) {
    logger.error({ error, entity: 'customer', operation: 'list', userId: req.user._id }, 'Error listing customers');
    res.status(500).send({ error: error.toString() });
  }
});
// Get customer
customerRouter.get('/:id', auth, async (req, res) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!customer) {
      return res.status(404).send({ error: errorMessages.CUSTOMER_NOT_FOUND });
    }
    res.send(customer);
  } catch (error) {
    logger.error({ error, entity: 'customer', operation: 'read', userId: req.user._id, customerId: req.params.id }, 'Error getting customer');
    error.reason
      ? res.status(400).send({ error: error.reason.toString() })
      : res.status(500).send({ error: error.toString() });
  }
});
// Update customer
customerRouter.patch('/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    'name',
    'email',
    'address',
    'storeName',
    'phoneNumber',
    'secondaryPhoneNumber',
    'locality',
    'town',
    'idNumber',
  ];
  const failedUpdates = checkValidUpdates(updates, allowedUpdates);
  if (failedUpdates.length > 0) {
    return res.status(400).send({
      error: `Invalid fields to update ${failedUpdates.toString()}`,
    });
  }
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!customer) {
      return res.status(404).send({ error: errorMessages.CUSTOMER_NOT_FOUND });
    }
    updates.forEach(u => {
      customer[u] = req.body[u];
    });
    await customer.save();
    res.send(customer);
  } catch (error) {
    logger.error({ error, entity: 'customer', operation: 'update', userId: req.user._id, customerId: req.params.id }, 'Error updating customer');
    error.reason
      ? res.status(400).send({ error: error.reason.toString() })
      : res.status(500).send({ error: error.toString() });
  }
});
// Delete customer
customerRouter.delete('/:id', auth, async (req, res) => {
  try {
    const customer = await Customer.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!customer) {
      res.status(404).send({ error: errorMessages.CUSTOMER_NOT_FOUND });
      return;
    }
    res.send(customer);
  } catch (error) {
    logger.error({ error, entity: 'customer', operation: 'delete', userId: req.user._id, customerId: req.params.id }, 'Error deleting customer');
    error.reason
      ? res.status(400).send({ error: error.reason.toString() })
      : res.status(500).send({ error: error.toString() });
  }
});

export default customerRouter;
