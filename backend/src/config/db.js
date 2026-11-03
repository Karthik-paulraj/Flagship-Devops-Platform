const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecommerce';

  mongoose.connection.on('connected', async () => {
    console.log(`[Database] Connected: host=${mongoose.connection.host} port=${mongoose.connection.port} db=${mongoose.connection.name}`);
    try {
      const { autoSeedIfEmpty } = require('../seed/seed');
      await autoSeedIfEmpty();
      console.log('[Database AutoSeed] finished');
    } catch (err) {
      console.error('[Database AutoSeed] FAILED:', err);   // full error, not just message
    }
  });

  mongoose.connection.on('error', (err) => {
    console.error(`[Database] connection error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[Database] disconnected.');
  });

  try {
    return await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
  } catch (error) {
    console.error(`[Database] Could not connect to ${mongoUri}: ${error.message}`);
    // Fail loudly instead of silently running without a database
    process.exit(1);
  }
};

module.exports = connectDB;