const express = require('express');
const controller = require('./auth.controller');
const validate = require('../../middlewares/validate');
const { registerStep1Schema } = require('./auth.validation');

const router = express.Router();

router.post('/register', validate(registerStep1Schema), controller.register);

module.exports = router;
