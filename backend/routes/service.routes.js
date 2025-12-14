const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const serviceController = require('../controllers/serviceController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Configure multer for service attachments
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/services');
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'service-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allow images and PDFs
        const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Sadece resim ve PDF dosyaları yüklenebilir'));
        }
    }
});

// All service routes require authentication
router.use(authenticateToken);

// Get services for a motor (all authenticated users)
router.get('/motor/:motorId', serviceController.getMotorServices);

// Get service report (HTML for printing - all authenticated users)
router.get('/:id/report', serviceController.getServiceReport);

// Create service (admin and technician only, not user)
router.post('/motor/:motorId', requireRole('admin', 'technician'), serviceController.createService);

// Update service (admin and technician only, not user)
router.put('/:id', requireRole('admin', 'technician'), serviceController.updateService);

// Delete service (admin only)
router.delete('/:id', requireAdmin, serviceController.deleteService);

// Service attachments (admin and technician only)
router.post('/:id/attachments', requireRole('admin', 'technician'), upload.single('file'), serviceController.uploadAttachment);
router.delete('/attachments/:attachmentId', requireRole('admin', 'technician'), serviceController.deleteAttachment);

module.exports = router;
