import mongoose from 'mongoose';
import autoIncrement from 'mongoose-id-autoincrement';
import Product from './product.js';
import alternateProductSchema from './alternateProductSchema.js';
import { errorMessages } from '../constants.js';

const saleSchema = mongoose.Schema(
  {
    saleId: {
      type: Number,
    },
    saleDate: {
      type: Date,
      default: new Date(),
    },
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
          throw new Error(errorMessages.PRICE_INFERIOR_LIMIT_2);
        }
      },
    },
    totalPrice: {
      type: Number,
      validate(value) {
        if (value <= 0) {
          throw new Error(errorMessages.PRICE_INFERIOR_LIMIT);
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
  /* On presave the new item stock will be calculated, this is previous stock minus the 
  amount in the sale*/
  for (let i = 0, len = this.products.length; i < len; i++) {
    try {
      const product = this.products[i];
      const item = await Product.findById(product.product);
      if (!item) {
        throw new Error('El producto no existe');
      }
      let quantityToRemove = product.quantity;
      /* if there are previous products then this is an existing sale and the quantity
      to substract will be the diference between the previous order amount and the new
      order amount, this takes negatives into account*/
      if (this._previousProducts && this._previousProducts.length > 0) {
        const newQuantity = this._previousProducts.find(
          p => p.product.toString() === product.product.toString()
        )?.quantity;
        quantityToRemove = product.quantity - (newQuantity ? newQuantity : 0);
      }
      item.stock = item.stock - quantityToRemove;
      if (item.stock < 0) {
        throw new Error(`${errorMessages.NOT_ENOUGH_PRODUCT} ${item.fullName}`);
      }
      await item.save();
      next();
    } catch (e) {
      throw new Error(e);
    }
  }
  /* If there are previous products this block checks if a product was removed, and if so
  adds the quantity to the stock, the stock cannot be less than zero*/
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

/* When an sale is removed, the items are added to the stock as well, the stock
cannot be less than zero */
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

autoIncrement.initialize(mongoose.connection);

saleSchema.plugin(autoIncrement.plugin, {
  model: 'Sale',
  field: 'saleId',
  startAt: 1,
});

const Sale = mongoose.model('Sale', saleSchema);

export default Sale;
