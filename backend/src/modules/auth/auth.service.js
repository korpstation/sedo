const { v4: uuidv4 } = require('uuid');
const AppError = require('../../utils/AppError');
const { ERROR_CODES, ACCOUNT_STATUS } = require('../../config/constants');
const { signRegistrationToken, verifyRegistrationToken } = require('../../utils/jwt');
const { hashPassword, comparePassword } = require('../../utils/password');
const mailer = require('../../utils/mailer');
const sessionService = require('./session.service');
const User = require('../../models/user.model');

// Étape 1 : émet un token de poursuite portant l'identité (pas encore de compte).
function createRegistrationToken(identity) {
  const { prenom, nom, email, telephone } = identity;
  return signRegistrationToken({ prenom, nom, email, telephone });
}

// Étape 2 : crée le compte (PENDING) à partir du token de l'étape 1.
async function registerSecurity(registrationToken, motDePasse) {
  let payload;
  try {
    payload = verifyRegistrationToken(registrationToken);
  } catch (err) {
    throw new AppError(
      ERROR_CODES.INVALID_TOKEN,
      401,
      "Lien d'inscription invalide ou expiré."
    );
  }

  const { prenom, nom, email, telephone } = payload;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError(ERROR_CODES.EMAIL_ALREADY_USED, 409, 'Cet email est déjà utilisé.');
  }

  const motDePasseHashe = await hashPassword(motDePasse);
  const emailVerifToken = uuidv4();
  await User.create({
    prenom,
    nom,
    email,
    telephone,
    motDePasse: motDePasseHashe,
    emailVerifToken,
  });

  await mailer.sendVerificationEmail(email, emailVerifToken);
}

// Connexion : vérifie les identifiants puis l'état du compte, émet les tokens.
async function login(email, motDePasse) {
  const user = await User.findOne({ email });
  const invalides = new AppError(
    ERROR_CODES.INVALID_CREDENTIALS,
    401,
    'Email ou mot de passe incorrect.'
  );
  if (!user) throw invalides;

  const motDePasseOk = await comparePassword(motDePasse, user.motDePasse);
  if (!motDePasseOk) throw invalides;

  if (user.statut === ACCOUNT_STATUS.BANNED) {
    throw new AppError(
      ERROR_CODES.ACCOUNT_BANNED,
      403,
      'Votre compte a été désactivé définitivement.'
    );
  }
  if (user.statut === ACCOUNT_STATUS.SUSPENDED) {
    throw new AppError(
      ERROR_CODES.ACCOUNT_SUSPENDED,
      403,
      'Votre compte est suspendu. Contactez le support.'
    );
  }
  if (!user.emailVerifie || user.statut === ACCOUNT_STATUS.PENDING) {
    throw new AppError(
      ERROR_CODES.EMAIL_NOT_VERIFIED,
      403,
      'Veuillez vérifier votre email avant de vous connecter.'
    );
  }

  return sessionService.startSession(user);
}

// Vérifie l'email via le token reçu : PENDING -> VERIFIED.
async function verifyEmail(token) {
  const user = await User.findOne({ emailVerifToken: token });
  if (!user) {
    throw new AppError(
      ERROR_CODES.INVALID_TOKEN,
      400,
      'Token de vérification invalide ou expiré.'
    );
  }

  user.emailVerifie = true;
  user.statut = ACCOUNT_STATUS.VERIFIED;
  user.emailVerifToken = undefined;
  await user.save();
}

// Renvoie l'email de vérification (réponse neutre : pas d'indice d'existence).
async function resendVerification(email) {
  const user = await User.findOne({ email });
  if (!user || user.emailVerifie) return;

  user.emailVerifToken = uuidv4();
  await user.save();
  await mailer.sendVerificationEmail(user.email, user.emailVerifToken);
}

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 h

// Demande de reset (réponse neutre : pas d'indice d'existence).
async function forgotPassword(email) {
  const user = await User.findOne({ email });
  if (!user) return;

  user.resetPasswordToken = uuidv4();
  user.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
  await user.save();
  await mailer.sendPasswordResetEmail(user.email, user.resetPasswordToken);
}

// Réinitialise le mot de passe et révoque toutes les sessions de l'utilisateur.
async function resetPassword(token, motDePasse) {
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: new Date() },
  });
  if (!user) {
    throw new AppError(
      ERROR_CODES.INVALID_TOKEN,
      400,
      'Lien de réinitialisation invalide ou expiré.'
    );
  }

  user.motDePasse = await hashPassword(motDePasse);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  await sessionService.revokeAllForUser(user.id);
}

module.exports = {
  createRegistrationToken,
  registerSecurity,
  login,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
};
