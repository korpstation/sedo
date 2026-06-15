const express = require('express');
const controller = require('./auth.controller');
const validate = require('../../middlewares/validate');
const authenticate = require('../../middlewares/authenticate');
const {
  registerStep1Schema,
  registerSecuritySchema,
  loginSchema,
  refreshTokenSchema,
  verifyEmailSchema,
  resendVerificationSchema,
} = require('./auth.validation');

const router = express.Router();

router.post('/register', validate(registerStep1Schema), controller.register);
router.post(
  '/register/security',
  validate(registerSecuritySchema),
  controller.registerSecurity
);
router.post('/login', validate(loginSchema), controller.login);
router.post('/refresh-token', validate(refreshTokenSchema), controller.refreshToken);
router.post('/logout', authenticate, validate(refreshTokenSchema), controller.logout);
router.post('/verify-email', validate(verifyEmailSchema), controller.verifyEmail);
router.post(
  '/resend-verification',
  validate(resendVerificationSchema),
  controller.resendVerification
);

router.get('/me', authenticate, controller.me);

module.exports = router;
