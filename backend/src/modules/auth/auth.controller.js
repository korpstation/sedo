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

module.exports = {
  register,
};
