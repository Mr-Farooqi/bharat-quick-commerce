const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/blinkit_clone';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[DB] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[DB] Could not connect to local/specified MongoDB (${uri}): ${error.message}`);
    console.log('[DB] Launching embedded MongoDB (mongodb-memory-server) for zero-config development...');

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memoryUri = mongod.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`[DB] Embedded In-Memory MongoDB Connected at: ${memoryUri}`);
      console.log(`[DB] Note: To persist data permanently, install MongoDB locally or put your MongoDB Atlas URI in backend/.env`);
      return conn;
    } catch (memError) {
      console.error(`[DB Fatal] Failed to start embedded MongoDB: ${memError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
