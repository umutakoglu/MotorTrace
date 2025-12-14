const express = require('express');
const router = express.Router();
const technicianController = require('../controllers/technicianController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');

// All routes require authentication
router.use(authenticateToken);

// Get all technicians (all authenticated users)
router.get('/', technicianController.getAllTechnicians);

// Get technician statistics
router.get('/stats', requireAdmin, technicianController.getTechnicianStats);

// Get technician by ID
router.get('/:id', technicianController.getTechnicianById);

// Admin only routes
router.post('/', requireAdmin, technicianController.createTechnician);
router.put('/:id', requireAdmin, technicianController.updateTechnician);
router.delete('/:id', requireAdmin, technicianController.deleteTechnician);

module.exports = router;
