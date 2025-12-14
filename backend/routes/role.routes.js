const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');

// All routes require authentication and admin privileges
router.use(authenticateToken);
router.use(requireAdmin);

// Get all roles
router.get('/', roleController.getAllRoles);

// Get role by ID
router.get('/:id', roleController.getRoleById);

// Get role permissions
router.get('/:id/permissions', roleController.getRolePermissions);

// Create role
router.post('/', roleController.createRole);

// Update role
router.put('/:id', roleController.updateRole);

// Delete role
router.delete('/:id', roleController.deleteRole);

module.exports = router;
