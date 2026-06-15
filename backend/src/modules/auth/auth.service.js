const { v4: uuidv4 } = require('uuid');
const AppError = require('../../utils/AppError');
const { ERROR_CODES, ACCOUNT_STATUS } = require('../../config/constants');
const { signRegistrationToken, verifyRegistrationToken } = require('../../utils/jwt');
const { hashPassword } = require('../../utils/password');
const mailer = require('../../utils/mailer');
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

module.exports = {
  createRegistrationToken,
  registerSecurity,
  verifyEmail,
  resendVerification,
};
