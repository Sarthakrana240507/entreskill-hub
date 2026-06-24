const express = require('express');
const ctrl = require('../controllers/resourceController');
const validate = require('../middleware/validate');
const { authenticate, attachUserIfPresent } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { createResourceSchema, resourceQuerySchema } = require('../validators/miscValidators');

const router = express.Router();

router.get('/', attachUserIfPresent, validate({ query: resourceQuerySchema }), ctrl.listResources);
router.get('/mine/uploaded', authenticate, requireRole('MENTOR', 'ADMIN'), ctrl.listMyUploads);

router.post('/', authenticate, requireRole('MENTOR', 'ADMIN'), validate({ body: createResourceSchema }), ctrl.createResource);
router.patch('/:id/review', authenticate, requireRole('ADMIN'), ctrl.reviewResource);
router.delete('/:id', authenticate, requireRole('MENTOR', 'ADMIN'), ctrl.deleteResource);
router.post('/:id/complete', authenticate, ctrl.markResourceComplete);

module.exports = router;
