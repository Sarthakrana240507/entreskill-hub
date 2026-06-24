const express = require('express');

const authRoutes = require('./authRoutes');
const profileRoutes = require('./profileRoutes');
const ideaRoutes = require('./ideaRoutes');
const roadmapRoutes = require('./roadmapRoutes');
const resourceRoutes = require('./resourceRoutes');
const mentorRoutes = require('./mentorRoutes');
const questionRoutes = require('./questionRoutes');
const sessionRoutes = require('./sessionRoutes');
const adminRoutes = require('./adminRoutes');
const miscRoutes = require('./miscRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/ideas', ideaRoutes);
router.use('/roadmaps', roadmapRoutes);
router.use('/resources', resourceRoutes);
router.use('/mentors', mentorRoutes);
router.use('/questions', questionRoutes);
router.use('/sessions', sessionRoutes);
router.use('/admin', adminRoutes);
router.use('/', miscRoutes); // /feedback, /reports, /notifications

module.exports = router;
