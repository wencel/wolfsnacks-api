const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../../src/models/user');

const userOneId = new mongoose.Types.ObjectId();
const userOne = {
  _id: userOneId,
  name: 'Fabian Santos',
  email: 'testuser@test.com',
  password: '123Data!',
  active: true,
};

const userTwoId = new mongoose.Types.ObjectId();
const userTwo = {
  _id: userTwoId,
  name: 'Wencel Santos',
  email: 'testuser2@test.com',
  password: '123Data!!',
  active: true,
  tokens: [
    {
      token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET),
    },
    {
      token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET + 'extra'),
    },
  ],
};

const userThreeId = new mongoose.Types.ObjectId();
const userThree = {
  _id: userThreeId,
  name: 'Fabian Santos',
  email: 'testuser3@test.com',
  password: '123Data!',
  active: false,
};

module.exports = {
  userOne,
  userTwo,
  userThree,
};
