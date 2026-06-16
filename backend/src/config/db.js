const mongoose = require('mongoose');
const env = require('./env');

async function connectDB() {
  await mongoose.connect(env.MONGO_URI);
  return mongoose.connection;
}

async function disconnectDB() {
  await mongoose.disconnect();
}

// Vérifie que Mongo répond réellement (utilisé par /health). Lève si indisponible.
async function ping() {
  if (mongoose.connection.readyState !== 1) {
    throw new Error('MongoDB non connecté');
  }
  await mongoose.connection.db.admin().ping();
}

module.exports = {
  connectDB,
  disconnectDB,
  ping,
};
