const AppError = require('../utils/AppError');
const { ERROR_CODES } = require('../config/constants');

// Gestionnaire d'erreurs central -> modèle uniforme { error: { code, message, details? } }.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    const body = { error: { code: err.code, message: err.message } };
    if (err.details) body.error.details = err.details;
    return res.status(err.statusCode).json(body);
  }

  if (process.env.NODE_ENV !== 'test') {
    // eslint-disable-next-line no-console
    console.error(err);
  }
  return res.status(500).json({
    error: { code: ERROR_CODES.INTERNAL_ERROR, message: 'Erreur interne du serveur.' },
  });
}

module.exports = errorHandler;
