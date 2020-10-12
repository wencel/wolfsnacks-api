const mongoose = require('mongoose');
const { errorMessages } = require('../constants');
// Schema to use in the order and sales schemas
const alternateProductSchema = mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Product',
  },
  price: {
    type: Number,
    required: true,
    validate(value) {
      if (value <= 0) {
        throw new Error(errorMessages.PRICE_INFERIOR_LIMIT);
      }
    },
  },
  quantity: {
    type: Number,
    required: true,
    validate(value) {
      if (value <= 0) {
        throw new Error(errorMessages.QUANTITY_INFERIOR_LIMIT);
      }
    },
  },
  totalPrice: {
    type: Number,
    required: true,
    validate(value) {
      if (value <= 0) {
        throw new Error(errorMessages.TOTAL_PRICE_INFERIOR_LIMIT);
      }
    },
  },
});

module.exports = alternateProductSchema;
