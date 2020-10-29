const express = require('express');
const auth = require('../middlewares/auth');
const utils = require('../utils');
const Customer = require('../models/customer');
const constants = require('../constants');

const customerRouter = express.Router();

// Create customer
customerRouter.post('/', auth, async (req, res) => {
  const customer = new Customer({ ...req.body, user: req.user._id });
  try {
    await customer.save();
    res.status(201).send(customer);
  } catch (error) {
    res.status(400).send({ error });
  }
});
// Get customers
customerRouter.get('/', auth, async (req, res) => {
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
      sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = req.query.skip ? parseInt(req.query.skip) : 0;
    await req.user
      .populate({
        path: 'customers',
        match,
        options: {
          limit,
          skip,
          sort,
        },
      })
      .execPopulate();
    const total = await Customer.countDocuments({
      user: req.user._id,
      ...match,
    });
    res.send({ data: req.user.customers, limit, skip, total });
  } catch (error) {
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
      res
        .status(404)
        .send({ error: constants.errorMessages.CUSTOMER_NOT_FOUND });
    }
    res.send(customer);
  } catch (error) {
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
  const failedUpdates = utils.checkValidUpdates(updates, allowedUpdates);
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
      res
        .status(404)
        .send({ error: constants.errorMessages.CUSTOMER_NOT_FOUND });
    }
    updates.forEach(u => {
      customer[u] = req.body[u];
    });
    await customer.save();
    res.send(customer);
  } catch (error) {
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
      res
        .status(404)
        .send({ error: constants.errorMessages.CUSTOMER_NOT_FOUND });
      return;
    }
    res.send(customer);
  } catch (error) {
    error.reason
      ? res.status(400).send({ error: error.reason.toString() })
      : res.status(500).send({ error: error.toString() });
  }
});

module.exports = customerRouter;
