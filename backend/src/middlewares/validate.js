const AppError = require('../utils/AppError');
const { ERROR_CODES } = require('../config/constants');

// Valide req.body contre un schéma Joi ; en cas d'échec -> 422 normalisé.
function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((d) => ({
        champ: d.path.join('.'),
        message: d.message,
      }));
      return next(
        new AppError(ERROR_CODES.VALIDATION_ERROR, 422, 'Données invalides.', details)
      );
    }

    req.body = value;
    return next();
  };
}

module.exports = validate;
