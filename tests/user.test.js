import request from 'supertest';
import app from '../src/app';
import User from '../src/models/user';
import { setupDB, userOne, userThree, userTwo, clearDB } from './fixtures/db';

beforeEach(setupDB);
afterEach(clearDB);

test('Should create a new user', async () => {
  const response = await request(app)
    .post('/api/users')
    .send({
      name: 'Wencel Santos',
      email: 'wencelsantos@gmail.com',
      password: 'Mpasss123!',
    })
    .expect(201);
  // Assert user create din DB
  const user = await User.findById(response.body.user._id);
  expect(user).toBeTruthy();
  // Assert Expected object
  expect(response.body).toMatchObject({
    user: {
      active: false,
      name: 'Wencel Santos',
      email: 'wencelsantos@gmail.com',
    },
    token: user.activationToken,
  });
});

test('Should not create a new user with inapropiate password', async () => {
  await request(app)
    .post('/api/users')
    .send({
      name: 'Wencel Santos',
      email: 'wencelsantos@gmail.com',
      password: 'Mpasss123',
    })
    .expect(400);
});

test('Should not create a new user with existing email', async () => {
  await request(app)
    .post('/api/users')
    .send({
      name: 'Wencel Santos',
      email: userOne.email,
      password: 'Mpasss123',
    })
    .expect(400);
});

test('Should not create a new user with incomplete info', async () => {
  await request(app)
    .post('/api/users')
    .send({
      name: '',
      email: 'wencelsantos@gmail.com',
      password: 'Mpasss123!',
    })
    .expect(400);
  await request(app)
    .post('/api/users')
    .send({
      name: 'Wencel Santos',
      email: '',
      password: 'Mpasss123',
    })
    .expect(400);
  await request(app)
    .post('/api/users')
    .send({
      name: 'Wencel Santos',
      email: 'wencelsantos@gmail.com',
      password: '',
    })
    .expect(400);
});

test('Should login existing user', async () => {
  const response = await request(app)
    .post('/api/users/login')
    .send({
      email: userOne.email,
      password: userOne.password,
    })
    .expect(200);
  const user = await User.findById(userOne._id);
  // Assert Expected object

  expect(user.tokens[0]).toMatchObject({ token: response.body.token });
});

test('Should not login non existing user', async () => {
  await request(app)
    .post('/api/users/login')
    .send({
      email: 'wencelsantos@gmail.com',
      password: userOne.password,
    })
    .expect(400);
});

test('Should not login with wrong password or missing information', async () => {
  await request(app)
    .post('/api/users/login')
    .send({
      email: '',
      password: userOne.password,
    })
    .expect(400);
  await request(app)
    .post('/api/users/login')
    .send({
      email: userOne.password,
      password: 'aksdjfaksldjf',
    })
    .expect(400);
  await request(app)
    .post('/api/users/login')
    .send({
      email: userOne.password,
      password: '',
    })
    .expect(400);
});

test('Should not login inactive user', async () => {
  await request(app)
    .post('/api/users/login')
    .send({
      email: userThree.email,
      password: userThree.password,
    })
    .expect(400);
});

test('Should logout user', async () => {
  await request(app)
    .post('/api/users/logout')
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(200);
  const user = await User.findById(userTwo._id);
  expect(user.tokens).toHaveLength(1);
});

test('Should not logout unauthenticated user', async () => {
  await request(app)
    .post('/api/users/logout')
    .set('Authorization', `Bearer`)
    .send()
    .expect(401);
  await request(app).post('/api/users/logout').send().expect(401);
});

test('Should logout all sessions for user', async () => {
  await request(app)
    .post('/api/users/logoutAll')
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(200);
  const user = await User.findById(userTwo._id);
  expect(user.tokens).toHaveLength(0);
});

test('Should upload avatar image', async () => {
  await request(app)
    .post('/api/users/me/avatar')
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .attach('avatar', 'tests/fixtures/profile-pic.jpg')
    .expect(200);
  const user = await User.findById(userTwo._id);
  expect(user.avatar).toEqual(expect.any(Buffer));
});

test('Should not upload avatar image to unauthenticated user', async () => {
  await request(app)
    .post('/api/users/me/avatar')
    .set('Authorization', `Bearer`)
    .attach('avatar', 'tests/fixtures/profile-pic.jpg')
    .expect(401);
  await request(app)
    .post('/api/users/me/avatar')
    .attach('avatar', 'tests/fixtures/profile-pic.jpg')
    .expect(401);
});

test('Should update valid fields for user', async () => {
  const newData = {
    name: 'fabi123',
    password: 'newPas123!!',
  };
  const response = await request(app)
    .patch('/api/users/me')
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send(newData)
    .expect(200);
  // Assert valid respone
  expect(response.body).toMatchObject({
    name: 'fabi123',
  });
  // logout user to login with new password
  await request(app)
    .post('/api/users/logoutAll')
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(200);
  const response2 = await request(app)
    .post('/api/users/login')
    .send({
      email: userTwo.email,
      password: newData.password,
    })
    .expect(200);
  const user = await User.findById(userTwo._id);
  expect(user.tokens[0]).toMatchObject({ token: response2.body.token });
});

test('Should not update invalid fields for user', async () => {
  const newData = {
    email: 'wencel@gmai.com',
  };
  await request(app)
    .patch('/api/users/me')
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send(newData)
    .expect(400);
});

test('Should not update unauthenticated user', async () => {
  const newData = {
    name: 'wencel@gmai.com',
  };
  await request(app)
    .patch('/api/users/me')
    .set('Authorization', `Bearer `)
    .send(newData)
    .expect(401);
  await request(app).patch('/api/users/me').send(newData).expect(401);
});
