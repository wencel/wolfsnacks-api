const mongoose = require('mongoose');
const { errorMessages } = require('../constants.js');
const constants = require('../constants.js');

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      enum: constants.productTypes,
      required: true,
      index: true,
      text: true,
    },
    presentation: {
      type: String,
      enum: constants.presentations,
      required: true,
    },
    weight: {
      type: Number,
      required: true,
      validate(value) {
        if (value <= 0) {
          throw new Error('El peso debe ser mayor a 0');
        }
      },
    },
    basePrice: {
      type: Number,
      required: true,
      validate(value) {
        if (value <= 0) {
          throw new Error(errorMessages.PRICE_INFERIOR_LIMIT);
        }
      },
    },
    sellingPrice: {
      type: Number,
      required: true,
      validate(value) {
        if (value <= 0) {
          throw new Error(errorMessages.PRICE_INFERIOR_LIMIT);
        }
      },
    },
    stock: {
      type: Number,
      required: true,
      validate(value) {
        if (value < 0) {
          throw new Error(errorMessages.QUANTITY_INFERIOR_LIMIT_2);
        }
      },
      default: 0,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

productSchema.virtual('fullName').get(function () {
  return `${this.name} ${this.presentation} ${this.weight}`;
});

productSchema.post('save', function (error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    throw new Error(errorMessages.PRODUCT_DUPLICATE_ERROR);
    next();
  } else {
    next(error);
  }
});

productSchema.index(
  { name: 1, presentation: 1, weight: 1, user: 1 },
  { unique: true }
);

productSchema.set('toObject', { virtuals: true });
productSchema.set('toJSON', { virtuals: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
