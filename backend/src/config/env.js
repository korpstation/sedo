// Charge et valide les variables d'environnement au démarrage (fail-fast).
const Joi = require('joi');

const schema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().default(3000),
  MONGO_URI: Joi.string().default('mongodb://localhost:27017/sedo'),

  JWT_ACCESS_SECRET: Joi.string().min(16).required(),
  JWT_REFRESH_SECRET: Joi.string().min(16).required(),
  JWT_REGISTRATION_SECRET: Joi.string().min(16).required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  SENDGRID_API_KEY: Joi.string().allow('').default(''),
  EMAIL_FROM: Joi.string().default('noreply@sedo.app'),
  ADMIN_EMAIL: Joi.string().default('admin@sedo.app'),
  APP_URL: Joi.string().default('http://localhost:3000'),
}).unknown(true);

const { value, error } = schema.validate(process.env);
if (error) {
  throw new Error(`Configuration d'environnement invalide : ${error.message}`);
}

module.exports = value;
