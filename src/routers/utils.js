import express from 'express';
import { localities, presentations, productTypes } from '../constants.js';
import auth from '../middlewares/auth.js';
import Customer from '../models/customer.js';

const utilsRouter = express.Router();

// Get Localities
utilsRouter.get('/localities', (req, res) => {
  res.status(200).send(localities);
});

// Get Presentations
utilsRouter.get('/presentations', (req, res) => {
  res.status(200).send(presentations);
});

// Get Product types
utilsRouter.get('/productTypes', (req, res) => {
  res.status(200).send(productTypes);
});

utilsRouter.post('/uploadCustomers', auth, async (req, res) => {
  let number = 0;
  debugger;
  for (let index = 0; index < req.body.values?.length; index++) {
    try {
      const customerToSend = { user: req.user._id };
      if (req.body.values[index][1]) {
        customerToSend.name = req.body.values[index][1];
      }
      if (req.body.values[index][2]) {
        customerToSend.email = req.body.values[index][2];
      }
      if (req.body.values[index][3]) {
        customerToSend.address = req.body.values[index][3];
      }
      if (req.body.values[index][4]) {
        customerToSend.storeName = req.body.values[index][4];
      }
      customerToSend.phoneNumber = req.body.values[index][5]
        ? req.body.values[index][5]
        : '0000000000';
      if (req.body.values[index][6]) {
        customerToSend.locality = req.body.values[index][6];
      }
      if (req.body.values[index][7]) {
        customerToSend.town = req.body.values[index][7];
      }
      const customer = new Customer(customerToSend);
      await customer.save();
      number++;
    } catch (e) {
      console.log(e);
    }
  }
  res.status(200).send(`Se guardaron ${number} nuevos clientes`);
});

export default utilsRouter;
