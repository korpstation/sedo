const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { REGISTRATION_TOKEN_TTL_SECONDS } = require('../config/constants');

// Token court porté par l'étape 1 d'inscription (données d'identité non persistées).
function signRegistrationToken(payload) {
  return jwt.sign(
    { ...payload, typ: 'registration' },
    env.JWT_REGISTRATION_SECRET,
    { expiresIn: REGISTRATION_TOKEN_TTL_SECONDS }
  );
}

function verifyRegistrationToken(token) {
  return jwt.verify(token, env.JWT_REGISTRATION_SECRET);
}

module.exports = {
  signRegistrationToken,
  verifyRegistrationToken,
};
