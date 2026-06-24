const express = require('express');
const ctrl = require('../controllers/mentorController');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { questionSchema, answerSchema } = require('../validators/miscValidators');

const router = express.Router();

router.post('/', authenticate, validate({ body: questionSchema }), ctrl.askQuestion);
router.get('/mine', authenticate, ctrl.listMyQuestions);
router.patch('/:id/answer', authenticate, validate({ body: answerSchema }), ctrl.answerQuestion);

module.exports = router;
