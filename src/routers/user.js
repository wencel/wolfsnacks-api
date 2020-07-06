const express = require('express');
const User = require('../models/user');
const checkValidUpdates = require('../utils');
const auth = require('../middlewares/auth');
const multer = require('multer');
const sharp = require('sharp');
const { sendWelcomeEmail, sendCancelationEmail } = require('../emails/account');

const userRouter = express.Router();

// Create user
userRouter.post('/', async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    const token = await user.generateAuthToken(true);
    sendWelcomeEmail(user.email, user.name, token);
    res.status(201).send({ user, token });
  } catch (error) {
    res.status(400).send({ error });
  }
});
// Read current user
userRouter.get('/me', auth, async (req, res) => {
  // The populate, fills the tasks array from a foreign key
  // To add to the resposne please check the toJSON defined in the user model
  await req.user.populate('tasks').execPopulate();
  res.send(req.user);
});
// Update user
userRouter.patch('/me', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'email', 'password', 'email'];
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
    error.reason
      ? res.status(400).send({ error: error.reason.toString() })
      : res.status(500).send({ error: error.toString() });
  }
});
// Delete user
userRouter.delete('/me', auth, async (req, res) => {
  try {
    await req.user.remove();
    sendCancelationEmail(req.user.email, req.user.name);
    res.send(req.user);
  } catch (error) {
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
      throw new Error('El usuario no esta activo');
    }
    const token = await user.generateAuthToken(false);
    res.send({ user, token });
  } catch (error) {
    res.status(400).send({ error: error.toString() });
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
    res.status(500).send({ error: error.toString() });
  }
});
// Activate user
userRouter.get('/activate/:activationToken', async (req, res) => {
  try {
    const { activationToken } = req.params;
    const user = await User.findOne({ activationToken });
    if (!user) {
      throw new Error('Token inválido');
    }
    user.activationToken = '';
    user.active = true;
    const token = await user.generateAuthToken(false);
    res.send({ user, token });
  } catch (error) {
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
      cb(new Error('Please upload a valid image'));
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
    res.status(400).send({ error: error.message });
  }
);

userRouter.delete('/me/avatar', auth, async (req, res) => {
  try {
    req.user.avatar = undefined;
    await req.user.save();
    res.send({ message: 'Avatar removed' });
  } catch (error) {
    res.status(400).send({ error: error.toString() });
  }
});

userRouter.get('/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) {
      throw new Error('User avatar not found');
    }
    res.set('Content-Type', 'image/png');
    res.send(user.avatar);
  } catch (error) {
    res.status(400).send({ error: error.toString() });
  }
});

module.exports = userRouter;
