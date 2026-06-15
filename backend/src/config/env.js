// Charge et valide les variables d'environnement au démarrage (fail-fast).
// dotenv hors test (en prod, les secrets viennent de l'environnement / k8s).
if (process.env.NODE_ENV !== 'test') {
  // eslint-disable-next-line global-require
  require('dotenv').config();
}

const Joi = require('joi');

// En test, Jest pose NODE_ENV=test : on fournit des secrets jetables par défaut
// pour que le chargement de l'env ne dépende ni du cwd ni de l'ordre de require.
if (process.env.NODE_ENV === 'test') {
  process.env.JWT_ACCESS_SECRET ||= 'test-access-secret-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
  process.env.JWT_REFRESH_SECRET ||= 'test-refresh-secret-bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
  process.env.JWT_REGISTRATION_SECRET ||= 'test-registration-secret-cccccccccccccccccccccccc';
}

const schema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().default(3000),
  MONGO_URI: Joi.string().default('mongodb://localhost:27017/sedo'),

  JWT_ACCESS_SECRET: Joi.string().min(16).required(),
  JWT_REFRESH_SECRET: Joi.string().min(16).required(),
  JWT_REGISTRATION_SECRET: Joi.string().min(16).required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  // Origines CORS autorisées (liste séparée par des virgules) — jamais de wildcard.
  CORS_ORIGINS: Joi.string().default('http://localhost:3000,http://localhost:5173'),

  SENDGRID_API_KEY: Joi.string().allow('').default(''),
  EMAIL_FROM: Joi.string().default('noreply@sedo.app'),
  ADMIN_EMAIL: Joi.string().default('admin@sedo.app'),
  APP_URL: Joi.string().default('http://localhost:3000'),
}).unknown(true);

const { value, error } = schema.validate(process.env);
if (error) {
  throw new Error(`Configuration d'environnement invalide : ${error.message}`);
}

// Liste d'origines CORS prête à l'emploi.
value.CORS_ORIGINS_LIST = value.CORS_ORIGINS.split(',')
  .map((o) => o.trim())
  .filter(Boolean);

module.exports = value;
