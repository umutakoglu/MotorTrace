const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');

// All service routes require authentication
router.use(authenticateToken);

// Get services for a motor (all authenticated users)
router.get('/motor/:motorId', serviceController.getMotorServices);

// Admin only routes
router.post('/motor/:motorId', requireAdmin, serviceController.createService);
router.put('/:id', requireAdmin, serviceController.updateService);
router.delete('/:id', requireAdmin, serviceController.deleteService);

module.exports = router;
