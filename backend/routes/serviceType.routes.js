const express = require('express');
const router = express.Router();
const serviceTypeController = require('../controllers/serviceTypeController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');

// All routes require authentication
router.use(authenticateToken);

// Get all service types (all authenticated users)
router.get('/', serviceTypeController.getAllServiceTypes);

// Get service type statistics
router.get('/stats', requireAdmin, serviceTypeController.getServiceTypeStats);

// Get service type by ID
router.get('/:id', serviceTypeController.getServiceTypeById);

// Admin only routes
router.post('/', requireAdmin, serviceTypeController.createServiceType);
router.put('/:id', requireAdmin, serviceTypeController.updateServiceType);
router.delete('/:id', requireAdmin, serviceTypeController.deleteServiceType);

module.exports = router;
