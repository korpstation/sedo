const authService = require('./auth.service');
const { REGISTRATION_TOKEN_TTL_SECONDS } = require('../../config/constants');

// POST /api/v1/auth/register — inscription étape 1 (identité)
async function register(req, res, next) {
  try {
    const registrationToken = authService.createRegistrationToken(req.body);
    res.status(200).json({
      registrationToken,
      expiresIn: REGISTRATION_TOKEN_TTL_SECONDS,
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/v1/auth/register/security — inscription étape 2 (mot de passe)
async function registerSecurity(req, res, next) {
  try {
    await authService.registerSecurity(req.body.registrationToken, req.body.motDePasse);
    res.status(201).json({
      message: 'Compte créé. Vérifiez votre email pour l’activer.',
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/v1/auth/login — connexion
async function login(req, res, next) {
  try {
    const tokens = await authService.login(req.body.email, req.body.motDePasse);
    res.status(200).json(tokens);
  } catch (err) {
    next(err);
  }
}

// POST /api/v1/auth/verify-email — valide le token de vérification
async function verifyEmail(req, res, next) {
  try {
    await authService.verifyEmail(req.body.token);
    res.status(200).json({ message: 'Email vérifié. Votre compte est activé.' });
  } catch (err) {
    next(err);
  }
}

// POST /api/v1/auth/resend-verification — renvoie l'email (réponse neutre)
async function resendVerification(req, res, next) {
  try {
    await authService.resendVerification(req.body.email);
    res.status(200).json({
      message: 'Si un compte non vérifié existe, un email de vérification a été renvoyé.',
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/auth/me — profil de l'utilisateur courant
async function me(req, res) {
  res.status(200).json(req.user.toPublic());
}

module.exports = {
  register,
  registerSecurity,
  login,
  verifyEmail,
  resendVerification,
  me,
};
