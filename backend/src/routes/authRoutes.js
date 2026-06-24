const express = require('express');
const ctrl = require('../controllers/authController');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { registerSchema, loginSchema, refreshSchema, changePasswordSchema } = require('../validators/authValidators');

const router = express.Router();

router.post('/register', validate({ body: registerSchema }), ctrl.register);
router.post('/login', validate({ body: loginSchema }), ctrl.login);
router.post('/refresh', validate({ body: refreshSchema }), ctrl.refresh);
router.post('/logout', ctrl.logout);
router.get('/me', authenticate, ctrl.getMe);
router.patch('/change-password', authenticate, validate({ body: changePasswordSchema }), ctrl.changePassword);

module.exports = router;
