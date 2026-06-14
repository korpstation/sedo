const { signRegistrationToken } = require('../../utils/jwt');

// Étape 1 : émet un token de poursuite portant l'identité (pas encore de compte).
function createRegistrationToken(identity) {
  const { prenom, nom, email, telephone } = identity;
  return signRegistrationToken({ prenom, nom, email, telephone });
}

module.exports = {
  createRegistrationToken,
};
