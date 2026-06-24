const express = require('express');
const ctrl = require('../controllers/adminController');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { reportReviewSchema } = require('../validators/miscValidators');
const { z } = require('zod');

const router = express.Router();

router.use(authenticate, requireRole('ADMIN'));

router.get('/dashboard', ctrl.getDashboardSummary);
router.get('/users', ctrl.listUsers);
router.patch('/users/:id/status', validate({ body: z.object({ isActive: z.boolean() }) }), ctrl.setUserActiveStatus);
router.get('/resources/pending', ctrl.listPendingResources);
router.get('/reports', ctrl.listReports);
router.patch('/reports/:id', validate({ body: reportReviewSchema }), ctrl.reviewReport);
router.get('/audit-logs', ctrl.listAuditLogs);
router.get('/feedback', ctrl.listFeedback);

module.exports = router;
