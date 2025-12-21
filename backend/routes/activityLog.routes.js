const express = require('express');
const router = express.Router();
const activityLogController = require('../controllers/activityLogController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');

// All routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Get activity logs
router.get('/', activityLogController.getActivityLogs);

// Get activity statistics
router.get('/stats', activityLogController.getActivityStats);

module.exports = router;
