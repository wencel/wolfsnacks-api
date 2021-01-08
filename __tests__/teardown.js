const MemoryDatabaseServer = require('./fixtures/MemoryDatabaseServer');

module.exports = async () => {
  await MemoryDatabaseServer.stop();
};
