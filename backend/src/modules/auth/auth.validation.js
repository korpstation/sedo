const Joi = require('joi');
const { isValidPhoneNumber } = require('libphonenumber-js');

// Téléphone international valide (E.164), vérifié via libphonenumber-js.
const telephone = Joi.string()
  .trim()
  .custom((value, helpers) => {
    if (!isValidPhoneNumber(value)) return helpers.error('any.invalid');
    return value;
  }, 'téléphone international')
  .messages({ 'any.invalid': 'Numéro de téléphone invalide.' })
  .required();

// Inscription étape 1 — identité
const registerStep1Schema = Joi.object({
  prenom: Joi.string().trim().min(1).required(),
  nom: Joi.string().trim().min(1).required(),
  email: Joi.string().trim().lowercase().email().required(),
  telephone,
});

module.exports = {
  registerStep1Schema,
};
