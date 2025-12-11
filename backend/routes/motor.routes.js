const express = require('express');
const router = express.Router();
const motorController = require('../controllers/motorController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');

// All motor routes require authentication
router.use(authenticateToken);

// Public (authenticated) routes
router.get('/', motorController.getAllMotors);
router.get('/:id', motorController.getMotorById);
router.get('/scan/:motorId', motorController.scanQRCode);
router.get('/:id/qr/download', motorController.downloadQRCode);

// Admin only routes
router.post('/', requireAdmin, motorController.createMotor);
router.put('/:id', requireAdmin, motorController.updateMotor);
router.delete('/:id', requireAdmin, motorController.deleteMotor);
router.post('/:id/generate-qr', requireAdmin, motorController.generateQR);
router.post('/generate-all-qr', requireAdmin, motorController.generateAllQRs);

module.exports = router;
