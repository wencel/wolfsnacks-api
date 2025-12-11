import express from 'express';
import { checkValidUpdates } from '../utils.js';
import multer from 'multer';
import User from '../models/user.js';
import sharp from 'sharp';
import auth from '../middlewares/auth.js';
import { sendWelcomeEmail, sendCancelationEmail } from '../emails/account.js';
import { errorMessages } from '../constants.js';
import logger from '../utils/logger.js';

const userRouter = express.Router();

// Create user
userRouter.post('/', async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    const token = await user.generateAuthToken(true);
    sendWelcomeEmail(user.email, user.name, token).catch((err) => {
      logger.error({ err, entity: 'user', operation: 'sendWelcomeEmail', userId: user._id }, 'Error sending welcome email');
    });
    res.status(201).send({ user, token });
  } catch (error) {
    logger.error({ error, entity: 'user', operation: 'create' }, 'Error creating user');
    let errorMessage = error.message;
    if (error.name === 'ValidationError') {
      errorMessage = error.message;
    } else if (error.code === 11000) {
      errorMessage = 'El correo electrónico ya está en uso';
    }
    res.status(400).send({ error: errorMessage });
  }
});
// Read current user
userRouter.get('/me', auth, async (req, res) => {
  res.send(req.user);
});
// Update user
userRouter.patch('/me', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'password'];
  const failedUpdates = checkValidUpdates(updates, allowedUpdates);
  if (failedUpdates.length > 0) {
    return res.status(400).send({
      error: `Invalid fields to update ${failedUpdates.toString()}`,
    });
  }
  try {
    updates.forEach(u => {
      req.user[u] = req.body[u];
    });
    await req.user.save();
    res.send(req.user);
  } catch (error) {
    logger.error({ error, entity: 'user', operation: 'update', userId: req.user._id }, 'Error updating user');
    error.reason
      ? res.status(400).send({ error: error.reason.toString() })
      : res.status(500).send({ error: error.toString() });
  }
});
// Delete user
userRouter.delete('/me', auth, async (req, res) => {
  try {
    const user = await User.findOneAndDelete({
      _id: req.user._id,
    });
    sendCancelationEmail(req.user.email, req.user.name).catch((err) => {
      logger.error({ err, entity: 'user', operation: 'sendCancelationEmail', userId: req.user._id }, 'Error sending cancelation email');
    });
    res.send(req.user);
  } catch (error) {
    logger.error({ error, entity: 'user', operation: 'delete', userId: req.user._id }, 'Error deleting user');
    error.reason
      ? res.status(400).send({ error: error.reason.toString() })
      : res.status(500).send({ error: error.toString() });
  }
});
// Login user
userRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByCredentials(email, password);
    if (!user.active) {
      throw new Error(errorMessages.USER_NOT_ACTIVE);
    }
    const token = await user.generateAuthToken(false);
    res.send({ user, token });
  } catch (error) {
    logger.error({ error, entity: 'user', operation: 'login', email: req.body.email }, 'Error logging in user');
    res.status(400).send({ message: error.message });
  }
});
// Logout user
userRouter.post('/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      token => req.token !== token.token
    );
    await req.user.save();
    res.send();
  } catch (error) {
    logger.error({ error, entity: 'user', operation: 'logout', userId: req.user._id }, 'Error logging out user');
    res.status(500).send({ error: error.toString() });
  }
});
// Logout user all sessions
userRouter.post('/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (error) {
    logger.error({ error, entity: 'user', operation: 'logoutAll', userId: req.user._id }, 'Error logging out all sessions');
    res.status(500).send({ error: error.toString() });
  }
});
// Activate user
userRouter.post('/activate/:activationToken', async (req, res) => {
  try {
    const { activationToken } = req.params;
    const user = await User.findOne({ activationToken });
    if (!user) {
      throw new Error(errorMessages.INVALID_ACTIVATION_TOKEN);
    }
    user.activationToken = '';
    user.active = true;
    const token = await user.generateAuthToken(false);
    res.send({ user, token });
  } catch (error) {
    logger.error({ error, entity: 'user', operation: 'activate' }, 'Error activating user');
    res.status(400).send({ error: error.toString() });
  }
});
// Upload users's profile image
const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      cb(new Error(errorMessages.INVALID_IMAGE_FORMAT));
    }
    cb(undefined, true);
  },
});
userRouter.post(
  '/me/avatar',
  auth,
  upload.single('avatar'),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .png()
      .resize({ width: 250, height: 250 })
      .toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send({ message: 'File uploaded successfully' });
  },
  (error, req, res, next) => {
    logger.error({ error, entity: 'user', operation: 'uploadAvatar', userId: req.user?._id }, 'Error uploading avatar');
    res.status(400).send({ error: error.message });
  }
);

userRouter.delete('/me/avatar', auth, async (req, res) => {
  try {
    req.user.avatar = undefined;
    await req.user.save();
    res.send({ message: 'Avatar removed' });
  } catch (error) {
    logger.error({ error, entity: 'user', operation: 'deleteAvatar', userId: req.user._id }, 'Error deleting avatar');
    res.status(400).send({ error: error.toString() });
  }
});

userRouter.get('/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) {
      throw new Error(errorMessages.USER_AVATAR_NOT_FOUND);
    }
    res.set('Content-Type', 'image/png');
    res.send(user.avatar);
  } catch (error) {
    logger.error({ error, entity: 'user', operation: 'getAvatar', userId: req.params.id }, 'Error getting avatar');
    res.status(400).send({ error: error.toString() });
  }
});

export default userRouter;
