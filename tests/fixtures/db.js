import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../../src/models/user';

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

const setupDB = async () => {
  await new User(userOne).save();
  await new User(userTwo).save();
  await new User(userThree).save();
};
const clearDB = async () => {
  await User.deleteMany();
};

export default {
  userOne,
  userTwo,
  userThree,
  setupDB,
  clearDB,
};
