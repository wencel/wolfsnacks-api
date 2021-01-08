require('dotenv').config();
const { userOne, userThree, userTwo } = require('./fixtures/db');
const databaseHelper = require('../src/helpers/database');
const MemoryDatabaseServer = require('./fixtures/MemoryDatabaseServer');
console.log('OMGSIHIFGHDF');
beforeAll(async () => {
  const dbUri = await MemoryDatabaseServer.getConnectionString();
  console.log(dbUri);
  return databaseHelper.connect(dbUri);
});

beforeEach(async () => {
  await databaseHelper.truncate();
  await new User(userOne).save();
  await new User(userTwo).save();
  await new User(userThree).save();
  return;
});

afterAll(() => {
  return databaseHelper.disconnect();
});
