import mongoose from 'mongoose';
import validator from 'validator';
import { errorMessages, localities } from '../constants.js';

const customerSchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate(value) {
        if (value && !validator.isEmail(value)) {
          throw new Error(errorMessages.IVALID_EMAIL);
        }
      },
      index: true,
    },
    address: {
      type: String,
      required: true,
    },
    storeName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      validate(value) {
        if (value && !validator.isNumeric(value)) {
          throw new Error(errorMessages.INVALID_PHONE_NUMBER);
        }
      },
      trim: true,
    },
    secondaryPhoneNumber: {
      type: String,
      validate(value) {
        if (value && !validator.isNumeric(value)) {
          throw new Error(errorMessages.INVALID_PHONE_NUMBER);
        }
      },
      trim: true,
    },
    locality: {
      type: String,
      enum: localities,
      trim: true,
      allowNull: true,
    },
    town: {
      type: String,
      trim: true,
      index: true,
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
customerSchema.index({
  name: 'text',
  email: 'text',
  storeName: 'text',
  town: 'text',
});

customerSchema.index(
  { address: 1, storeName: 1, phoneNumber: 1, user: 1 },
  { unique: true }
);

const Customer = mongoose.model('Customer', customerSchema);

export default Customer;
