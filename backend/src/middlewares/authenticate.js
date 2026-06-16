const { verifyAccessToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');
const { ERROR_CODES } = require('../config/constants');
const User = require('../models/user.model');

// Vérifie le Bearer access token et charge l'utilisateur dans req.user.
async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new AppError(ERROR_CODES.UNAUTHORIZED, 401, 'Authentification requise.');
    }

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch (err) {
      throw new AppError(ERROR_CODES.UNAUTHORIZED, 401, 'Token invalide ou expiré.');
    }

    const user = await User.findById(payload.sub);
    if (!user) {
      throw new AppError(ERROR_CODES.UNAUTHORIZED, 401, 'Token invalide ou expiré.');
    }

    req.user = user;
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = authenticate;
