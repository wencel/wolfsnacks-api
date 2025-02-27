import mongoose from 'mongoose';
import autoIncrement from 'mongoose-id-autoincrement';
import Product from './product.js';
import alternateProductSchema from './alternateProductSchema.js';
import { errorMessages } from '../constants.js';

const orderSchema = mongoose.Schema(
  {
    orderId: {
      type: Number,
    },
    orderDate: {
      type: Date,
      default: new Date(),
    },
    totalPrice: {
      type: Number,
      validate(value) {
        if (value < 0) {
          throw new Error(errorMessages.TOTAL_PRICE_INFERIOR_LIMIT);
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
  /* On presave the new item stock will be calculated, this is previous stock plus the 
  amount in the order*/
  for (let i = 0, len = this.products.length; i < len; i++) {
    try {
      const product = this.products[i];
      const item = await Product.findById(product.product);
      if (!item) {
        throw new Error('El producto no existe');
      }
      let quantityToAdd = product.quantity;
      /* if there are previous products then this is an existing order and the quantity
      to add will be the diference between the previous order amount and the new
      order amount, this takes negatives into account*/
      if (this._previousProducts && this._previousProducts.length > 0) {
        const newQuantity = this._previousProducts.find(
          p => p.product.toString() === product.product.toString()
        )?.quantity;
        quantityToAdd = product.quantity - (newQuantity ? newQuantity : 0);
      }
      item.stock = item.stock + quantityToAdd;
      await item.save();
      next();
    } catch (e) {
      throw new Error(e);
    }
  }
  /* If there are previous products this block checks if a product was removed, and if so
  removes the quantity from the stock, the stock cannot be less than zero*/
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
          item.stock = item.stock - prevProduct.quantity;
          item.stock = item.stock < 0 ? 0 : item.stock;
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

/* When an order is removed, the items are removed from the stock as well, the stock
cannot be less than zero */
orderSchema.pre('remove', async function (next) {
  for (let i = 0, len = this.products.length; i < len; i++) {
    try {
      const product = this.products[i];
      const item = await Product.findById(product.product);
      item.stock = item.stock - product.quantity;
      item.stock = item.stock < 0 ? 0 : item.stock;
      await item.save();
    } catch (e) {
      throw new Error(e);
    }
  }
  next();
});

autoIncrement.initialize(mongoose.connection);

orderSchema.plugin(autoIncrement.plugin, {
  model: 'Order',
  field: 'orderId',
  startAt: 1,
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
