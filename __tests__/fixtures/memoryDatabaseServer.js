const { MongoMemoryServer } = require('mongodb-memory-server');

class MemoryDatabaseServer {
  constructor() {
    this.mongod = new MongoMemoryServer({
      binary: {
        version: '3.5.9',
      },
      autoStart: false,
    });
  }

  start() {
    return this.mongod.start();
  }

  stop() {
    return this.mongod.stop();
  }

  getConnectionString() {
    return this.mongod.getUri();
  }
}

module.exports = new MemoryDatabaseServer();
