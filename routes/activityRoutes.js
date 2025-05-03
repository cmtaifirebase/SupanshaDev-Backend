const express = require('express');
const router = express.Router();
const { getRecentActivities } = require('../controllers/activityController');
const { requireRole, authenticate } = require('../middlewares/authMiddleware');

router.get('/recent-activities', authenticate, requireRole('admin'), getRecentActivities);

module.exports = router;
