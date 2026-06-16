const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const AppError = require('../../utils/AppError');
const { ERROR_CODES, ACCOUNT_STATUS } = require('../../config/constants');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require('../../utils/jwt');
const Session = require('../../models/session.model');
const User = require('../../models/user.model');

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');

const invalidToken = () =>
  new AppError(ERROR_CODES.INVALID_TOKEN, 401, 'Refresh token invalide, expiré ou révoqué.');

// Émet un refresh token et persiste la Session (nouvelle famille ou famille existante).
async function issueRefreshToken(user, familyId = uuidv4()) {
  const refreshToken = signRefreshToken({ sub: user.id, familyId, jti: uuidv4() });
  const { exp } = verifyRefreshToken(refreshToken);
  await Session.create({
    user: user.id,
    familyId,
    tokenHash: sha256(refreshToken),
    expiresAt: new Date(exp * 1000),
  });
  return refreshToken;
}

// Connexion : paire access + refresh, nouvelle famille de session.
async function startSession(user) {
  const accessToken = signAccessToken({ sub: user.id, role: user.role });
  const refreshToken = await issueRefreshToken(user);
  return { accessToken, refreshToken, utilisateur: user.toPublic() };
}

// Rotation : valide le refresh, détecte la réutilisation, émet une nouvelle paire.
async function rotate(presentedToken) {
  try {
    verifyRefreshToken(presentedToken);
  } catch (err) {
    throw invalidToken();
  }

  const session = await Session.findOne({ tokenHash: sha256(presentedToken) });
  if (!session || session.revoked) throw invalidToken();

  if (session.used) {
    // Réutilisation d'un token déjà roté -> vol probable : on révoque la famille.
    await Session.updateMany({ familyId: session.familyId }, { revoked: true });
    throw invalidToken();
  }

  session.used = true;
  await session.save();

  const user = await User.findById(session.user);
  if (!user) throw invalidToken();

  // Le compte a pu être suspendu/banni depuis l'émission : on coupe la famille.
  if (
    user.statut === ACCOUNT_STATUS.SUSPENDED ||
    user.statut === ACCOUNT_STATUS.BANNED
  ) {
    await Session.updateMany({ familyId: session.familyId }, { revoked: true });
    throw invalidToken();
  }

  const accessToken = signAccessToken({ sub: user.id, role: user.role });
  const refreshToken = await issueRefreshToken(user, session.familyId);
  return { accessToken, refreshToken, utilisateur: user.toPublic() };
}

// Déconnexion : révoque la session correspondant au token (pour cet utilisateur).
async function revoke(userId, presentedToken) {
  await Session.updateOne(
    { user: userId, tokenHash: sha256(presentedToken) },
    { revoked: true }
  );
}

// Révoque toutes les sessions d'un utilisateur (ex: reset de mot de passe).
async function revokeAllForUser(userId) {
  await Session.updateMany({ user: userId }, { revoked: true });
}

module.exports = {
  startSession,
  rotate,
  revoke,
  revokeAllForUser,
};
