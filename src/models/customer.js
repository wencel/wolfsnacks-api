const mongoose = require('mongoose');
const validator = require('validator');
const constants = require('../constants.js');

const customerSchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('El correo electrónico no es válido');
        }
      },
    },
    address: {
      type: String,
      required: true,
    },
    storeName: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      validate(value) {
        if (!validator.isNumeric(value)) {
          throw new Error('El número de teléfono no es válido');
        }
      },
      trim: true,
    },
    locality: {
      type: String,
      enum: constants.localities,
      trim: true,
    },
    town: {
      type: String,
      trim: true,
    },
    idNumber: {
      type: String,
      trim: true,
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

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
