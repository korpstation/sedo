const AppError = require('../../utils/AppError');
const { ERROR_CODES } = require('../../config/constants');
const { signRegistrationToken, verifyRegistrationToken } = require('../../utils/jwt');
const { hashPassword } = require('../../utils/password');
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
  await User.create({ prenom, nom, email, telephone, motDePasse: motDePasseHashe });
  // TODO (cycle verify-email) : générer emailVerifToken + envoyer l'email de vérification.
}

module.exports = {
  createRegistrationToken,
  registerSecurity,
};
