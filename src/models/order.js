const mongoose = require('mongoose');
const Product = require('./product');
const alternateProductSchema = require('./alternateProductSchema');

const orderSchema = mongoose.Schema(
  {
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

orderSchema.pre('save', async function (next) {
  for (let i = 0, len = this.products.length; i < len; i++) {
    try {
      const product = this.products[i];
      const item = await Product.findById(product.product);
      let quantityToAdd = product.quantity;
      if (this._previousProducts && this._previousProducts.lenght > 0) {
        const newQuantity = this._previousProducts.find(
          p => p.product.toString() === product.product.toString()
        )?.quantity;
        quantityToAdd = product.quantity - (newQuantity ? newQuantity : 0);
      }
      item.stock = item.stock + quantityToAdd;
      await item.save();
    } catch (e) {
      throw new Error(e);
    }
  }
  if (this._previousProducts && this._previousProducts.lenght > 0) {
    for (let i = 0, len = this._previousProducts.length; i < len; i++) {
      try {
        const prevProduct = this._previousProducts[i];
        if (
          !this.products.find(
            p => p.product.toString() === prevProduct.product.toString()
          )
        ) {
          const item = await Product.findById(prevProduct.product);
          item.stock = item.stock - prevProduct.quantity;
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

orderSchema.pre('remove', async function (next) {
  for (let i = 0, len = this.products.length; i < len; i++) {
    try {
      const product = this.products[i];
      const item = await Product.findById(product.product);
      item.stock = item.stock - product.quantity;
      await item.save();
    } catch (e) {
      throw new Error(e);
    }
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
