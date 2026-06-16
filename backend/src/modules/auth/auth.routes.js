const express = require('express');
const controller = require('./auth.controller');
const validate = require('../../middlewares/validate');
const authenticate = require('../../middlewares/authenticate');
const {
  loginLimiter,
  registerLimiter,
  resendLimiter,
  forgotPasswordLimiter,
} = require('../../middlewares/rateLimiter');
const {
  registerStep1Schema,
  registerSecuritySchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  resendVerificationSchema,
} = require('./auth.validation');

const router = express.Router();

router.post(
  '/register',
  registerLimiter,
  validate(registerStep1Schema),
  controller.register
);
router.post(
  '/register/security',
  validate(registerSecuritySchema),
  controller.registerSecurity
);
router.post('/login', loginLimiter, validate(loginSchema), controller.login);
router.post('/refresh-token', validate(refreshTokenSchema), controller.refreshToken);
router.post('/logout', authenticate, validate(refreshTokenSchema), controller.logout);
router.post(
  '/forgot-password',
  forgotPasswordLimiter,
  validate(forgotPasswordSchema),
  controller.forgotPassword
);
router.post('/reset-password', validate(resetPasswordSchema), controller.resetPassword);
router.post('/verify-email', validate(verifyEmailSchema), controller.verifyEmail);
router.post(
  '/resend-verification',
  resendLimiter,
  validate(resendVerificationSchema),
  controller.resendVerification
);

router.get('/me', authenticate, controller.me);

module.exports = router;
