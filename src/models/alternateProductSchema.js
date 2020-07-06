const mongoose = require('mongoose');
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
        throw new Error('El valor debe ser mayor a 0');
      }
    },
  },
  quantity: {
    type: Number,
    required: true,
    validate(value) {
      if (value <= 0) {
        throw new Error('El valor debe ser mayor a 0');
      }
    },
  },
  totalPrice: {
    type: Number,
    required: true,
    validate(value) {
      if (value <= 0) {
        throw new Error('El valor debe ser mayor a 0');
      }
    },
  },
});

module.exports = alternateProductSchema;
