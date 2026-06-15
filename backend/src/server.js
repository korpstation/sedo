const app = require('./app');
const env = require('./config/env');
const { connectDB, disconnectDB } = require('./config/db');
const logger = require('./utils/logger');

let server;

async function start() {
  try {
    await connectDB();
    logger.info('MongoDB connecté');
    server = app.listen(env.PORT, () => {
      logger.info(`SÈDO API démarrée sur le port ${env.PORT} (${env.NODE_ENV})`);
    });
  } catch (err) {
    logger.error(`Échec du démarrage : ${err.message}`);
    process.exit(1);
  }
}

// Arrêt propre (SIGTERM/SIGINT) : on draine puis on ferme Mongo.
async function shutdown(signal) {
  logger.info(`${signal} reçu, arrêt en cours...`);
  if (server) await new Promise((resolve) => server.close(resolve));
  await disconnectDB();
  process.exit(0);
}

['SIGTERM', 'SIGINT'].forEach((sig) => process.on(sig, () => shutdown(sig)));

start();
