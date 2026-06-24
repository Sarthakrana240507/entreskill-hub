const express = require('express');
const ctrl = require('../controllers/mentorController');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { sessionRequestSchema, sessionUpdateSchema } = require('../validators/miscValidators');

const router = express.Router();

router.post('/', authenticate, validate({ body: sessionRequestSchema }), ctrl.requestSession);
router.get('/mine', authenticate, ctrl.listMySessions);
router.patch('/:id', authenticate, validate({ body: sessionUpdateSchema }), ctrl.updateSession);

module.exports = router;
