const mongoose = require('mongoose');
const constants = require('../constants.js');

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      enum: constants.productTypes,
      required: true,
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
          throw new Error('El precio debe ser mayor a 0');
        }
      },
    },
    sellingPrice: {
      type: Number,
      required: true,
      validate(value) {
        if (value <= 0) {
          throw new Error('El precio debe ser mayor a 0');
        }
      },
    },
    stock: {
      type: Number,
      required: true,
      validate(value) {
        if (value < 0) {
          throw new Error('La cantidad debe ser mayor o igual a 0');
        }
      },
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

productSchema.index({ name: 1, presentation: 1, weight: 1 }, { unique: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
