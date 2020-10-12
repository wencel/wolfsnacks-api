const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Product = require('./product');
const Customer = require('./customer');
const Sale = require('./sale');
const Order = require('./order');
const { errorMessages } = require('../constants');
const passwordValidator = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[*.!@$%^&(){}[\]:;<>,.?\/~_+\-=|]).{8,32}$/;

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error(errorMessages.INVALID_EMAIL);
        }
      },
    },
    password: {
      type: String,
      trim: true,
      minlength: 8,
      required: true,
    },
    activationToken: {
      type: String,
    },
    active: {
      type: Boolean,
      default: false,
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    avatar: {
      type: Buffer,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    if (!passwordValidator.test(user.password)) {
      throw new Error(errorMessages.INVALID_PASSWORD);
    }
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

// Cascade delete child documents
userSchema.pre('remove', async function (next) {
  const user = this;
  await Customer.deleteMany({ user: user._id });
  await Product.deleteMany({ user: user._id });
  await Sale.deleteMany({ user: user._id });
  await Order.deleteMany({ user: user._id });
  next();
});

userSchema.virtual('customers', {
  ref: 'Customer',
  localField: '_id',
  foreignField: 'user',
});

userSchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'user',
});

userSchema.virtual('orders', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'user',
});

userSchema.virtual('sales', {
  ref: 'Sale',
  localField: '_id',
  foreignField: 'user',
});

userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;
  delete userObject.avatar;
  delete userObject.activationToken;

  return userObject;
};

userSchema.methods.generateAuthToken = async function (
  isActivationToken = false
) {
  const user = this;
  let token;
  if (isActivationToken) {
    token = jwt.sign({ _id: user.id.toString() }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });
    user.activationToken = token;
  } else {
    token = jwt.sign({ _id: user.id.toString() }, process.env.JWT_SECRET);
    user.tokens = [...user.tokens, { token }];
  }
  await user.save();
  return token;
};
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error(errorMessages.INVALID_EMAIL_PASWORD);
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error(errorMessages.INVALID_EMAIL_PASWORD);
  }
  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
