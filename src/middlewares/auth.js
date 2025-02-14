import jwt from 'jsonwebtoken';
import { errorMessages } from '../constants.js';
import User from '../models/user.js';

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      _id: decoded._id,
      'tokens.token': token,
    });
    if (!user) {
      throw new Error();
    }

    req.user = user;
    req.token = token;
    next();
  } catch {
    res.status(401).send({ error: errorMessages.PLEASE_AUTHENTICATE });
  }
};

export default auth;
