const express = require('express');
const { localities, presentations, productTypes } = require('../constants');

const utilsRouter = express.Router();

// Get Localities
utilsRouter.get('/localities', (req, res) => {
  res.status(200).send(localities);
});

// Get Localities
utilsRouter.get('/presentations', (req, res) => {
  res.status(200).send(presentations);
});

// Get Localities
utilsRouter.get('/productTypes', (req, res) => {
  res.status(200).send(productTypes);
});

module.exports = utilsRouter;
