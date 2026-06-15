const express = require('express');
const controller = require('./auth.controller');
const validate = require('../../middlewares/validate');
const {
  registerStep1Schema,
  registerSecuritySchema,
  loginSchema,
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
router.post('/verify-email', validate(verifyEmailSchema), controller.verifyEmail);
router.post(
  '/resend-verification',
  validate(resendVerificationSchema),
  controller.resendVerification
);

module.exports = router;
