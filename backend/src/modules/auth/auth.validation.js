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

// Mot de passe : 8 caractères min, au moins 1 majuscule, 1 chiffre, 1 symbole.
const motDePasse = Joi.string()
  .min(8)
  .pattern(/[A-Z]/)
  .pattern(/[0-9]/)
  .pattern(/[^A-Za-z0-9]/)
  .required()
  .messages({
    'string.min': 'Le mot de passe doit faire au moins 8 caractères.',
    'string.pattern.base':
      'Le mot de passe doit contenir une majuscule, un chiffre et un symbole.',
    'any.required': 'Le mot de passe est requis.',
  });

// Inscription étape 2 — mot de passe
const registerSecuritySchema = Joi.object({
  registrationToken: Joi.string().required(),
  motDePasse,
});

// Connexion
const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  motDePasse: Joi.string().required(),
});

// Refresh / logout
const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

// Vérification email
const verifyEmailSchema = Joi.object({
  token: Joi.string().required(),
});

// Renvoi de l'email de vérification
const resendVerificationSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
});

module.exports = {
  registerStep1Schema,
  registerSecuritySchema,
  loginSchema,
  refreshTokenSchema,
  verifyEmailSchema,
  resendVerificationSchema,
};
