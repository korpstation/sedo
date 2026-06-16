const AppError = require('../utils/AppError');
const { ERROR_CODES } = require('../config/constants');
const logger = require('../utils/logger');

// Gestionnaire d'erreurs central -> modèle uniforme { error: { code, message, details? } }.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    const body = { error: { code: err.code, message: err.message } };
    if (err.details) body.error.details = err.details;
    return res.status(err.statusCode).json(body);
  }

  // Clé dupliquée Mongo (seul champ unique : email).
  if (err.code === 11000) {
    return res.status(409).json({
      error: { code: ERROR_CODES.EMAIL_ALREADY_USED, message: 'Cet email est déjà utilisé.' },
    });
  }

  // Identifiant Mongoose malformé (ex: ObjectId invalide).
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: { code: ERROR_CODES.VALIDATION_ERROR, message: 'Identifiant invalide.' },
    });
  }

  logger.error(err.stack || err.message);
  return res.status(500).json({
    error: { code: ERROR_CODES.INTERNAL_ERROR, message: 'Erreur interne du serveur.' },
  });
}

module.exports = errorHandler;
