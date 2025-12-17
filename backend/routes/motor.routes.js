const express = require('express');
const router = express.Router();
const motorController = require('../controllers/motorController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// All routes require authentication
router.use(authenticateToken);

// Get all motors (all authenticated users)
router.get('/', motorController.getAllMotors);

// Get motor statistics (all authenticated users)
router.get('/stats', motorController.getMotorStats);

// Get motor by ID (all authenticated users)
router.get('/:id', motorController.getMotorById);

// Create motor (admin and user only, not technician)
router.post('/', requireRole('admin', 'user'), motorController.createMotor);

// Update motor (admin and user only, not technician)
router.put('/:id', requireRole('admin', 'user'), motorController.updateMotor);

// Delete motor (admin only)
router.delete('/:id', requireAdmin, motorController.deleteMotor);

// QR code operations
router.get('/:id/qr/download', motorController.downloadQRCode);
router.post('/:id/generate-qr', requireAdmin, motorController.generateQR);
router.get('/scan/:motorId', motorController.scanQRCode);

// Bulk operations (admin only)
router.post('/generate-all-qr', requireAdmin, motorController.generateAllQRs);

module.exports = router;
