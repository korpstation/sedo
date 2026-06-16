const rateLimit = require('express-rate-limit');
const { ERROR_CODES } = require('../config/constants');

// NB (MVP) : store in-memory -> par instance. En multi-instance (k8s, N replicas),
// passer sur un store partagé Redis pour un comptage global.
function createRateLimiter({ windowMs, max }) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => process.env.DISABLE_RATE_LIMIT === 'true',
    handler: (req, res) => {
      const retryMs = (req.rateLimit.resetTime || Date.now()) - Date.now();
      res.set('Retry-After', String(Math.max(Math.ceil(retryMs / 1000), 0)));
      res.status(429).json({
        error: {
          code: ERROR_CODES.RATE_LIMITED,
          message: 'Trop de tentatives. Veuillez réessayer plus tard.',
        },
      });
    },
  });
}

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

// 5 tentatives de login -> blocage 15 min (spec).
const loginLimiter = createRateLimiter({ windowMs: 15 * MINUTE, max: 5 });
const registerLimiter = createRateLimiter({ windowMs: HOUR, max: 20 });
const resendLimiter = createRateLimiter({ windowMs: HOUR, max: 5 });
const forgotPasswordLimiter = createRateLimiter({ windowMs: HOUR, max: 5 });

module.exports = {
  createRateLimiter,
  loginLimiter,
  registerLimiter,
  resendLimiter,
  forgotPasswordLimiter,
};
