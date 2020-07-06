const mongoose = require('mongoose');
const Product = require('./product');
const alternateProductSchema = require('./alternateProductSchema');

const saleSchema = mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Customer',
    },
    isThirteenDozen: {
      type: Boolean,
      default: false,
    },
    owes: {
      type: Boolean,
      default: false,
    },
    partialPayment: {
      type: Number,
      default: 0,
      validate(value) {
        if (value < 0) {
          throw new Error('El valor debe ser mayor o igual a 0');
        }
      },
    },
    totalPrice: {
      type: Number,
      validate(value) {
        if (value <= 0) {
          throw new Error('El valor debe ser mayor a 0');
        }
      },
    },
    products: {
      type: [alternateProductSchema],
      set: function (products) {
        this._previousProducts = this.products;
        return products;
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

saleSchema.pre('save', async function (next) {
  for (let i = 0, len = this.products.length; i < len; i++) {
    try {
      const product = this.products[i];
      const item = await Product.findById(product.product);
      let quantityToRemove = product.quantity;
      if (this._previousProducts && this._previousProducts.length > 0) {
        const newQuantity = this._previousProducts.find(
          p => p.product.toString() === product.product.toString()
        )?.quantity;
        quantityToRemove = product.quantity - (newQuantity ? newQuantity : 0);
      }
      item.stock = item.stock - quantityToRemove;
      await item.save();
    } catch (e) {
      throw new Error(e);
    }
  }
  if (this._previousProducts && this._previousProducts.length > 0) {
    for (let i = 0, len = this._previousProducts.length; i < len; i++) {
      try {
        const prevProduct = this._previousProducts[i];
        if (
          !this.products.find(
            p => p.product.toString() === prevProduct.product.toString()
          )
        ) {
          const item = await Product.findById(prevProduct.product);
          item.stock = item.stock + prevProduct.quantity;
          await item.save();
        }
      } catch (e) {
        throw new Error(e);
      }
    }
  }
  this.previousProducts = this.products;
  next();
});

saleSchema.pre('remove', async function (next) {
  for (let i = 0, len = this.products.length; i < len; i++) {
    try {
      const product = this.products[i];
      const item = await Product.findById(product.product);
      item.stock = item.stock + product.quantity;
      await item.save();
    } catch (e) {
      throw new Error(e);
    }
  }
  next();
});

const Sale = mongoose.model('Sale', saleSchema);

module.exports = Sale;
