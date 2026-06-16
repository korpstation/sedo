const winston = require('winston');
const env = require('../config/env');

// Logger applicatif. Silencieux en test. Ne jamais logger mot de passe / PIN / token.
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console({ silent: env.NODE_ENV === 'test' })],
});

module.exports = logger;
