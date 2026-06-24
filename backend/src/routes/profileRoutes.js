const express = require('express');
const ctrl = require('../controllers/profileController');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { upsertProfileSchema } = require('../validators/profileValidators');

const router = express.Router();

router.get('/skills', ctrl.listSkills);
router.get('/interests', ctrl.listInterests);
router.get('/me', authenticate, ctrl.getMyProfile);
router.put('/me', authenticate, validate({ body: upsertProfileSchema }), ctrl.upsertMyProfile);

module.exports = router;
