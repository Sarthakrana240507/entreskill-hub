const express = require('express');
const ctrl = require('../controllers/feedbackController');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { feedbackSchema, reportSchema } = require('../validators/miscValidators');

const router = express.Router();

router.post('/feedback', authenticate, validate({ body: feedbackSchema }), ctrl.submitFeedback);
router.post('/reports', authenticate, validate({ body: reportSchema }), ctrl.submitReport);
router.get('/notifications/mine', authenticate, ctrl.listMyNotifications);
router.patch('/notifications/:id/read', authenticate, ctrl.markNotificationRead);

module.exports = router;
