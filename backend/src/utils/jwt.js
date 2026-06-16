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

// Access token (court) — porte l'identité et le rôle.
function signAccessToken(payload) {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
}

// Refresh token (long).
function signRefreshToken(payload) {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });
}

function verifyRefreshToken(token) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
}

module.exports = {
  signRegistrationToken,
  verifyRegistrationToken,
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  verifyRefreshToken,
};
