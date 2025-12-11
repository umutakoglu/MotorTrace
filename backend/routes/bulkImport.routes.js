// Bulk Import Routes
const express = require('express');
const router = express.Router();
const multer = require('multer');
const bulkImportController = require('../controllers/bulkImportController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Check file extension
        if (file.originalname.match(/\.(xlsx|xls)$/)) {
            cb(null, true);
        } else {
            cb(new Error('Sadece Excel dosyaları (.xlsx, .xls) yüklenebilir'));
        }
    }
});

// Download Excel template (authenticated users)
router.get('/template', authenticateToken, bulkImportController.downloadTemplate);

// Upload and import Excel file (admin only)
router.post('/upload', authenticateToken, requireAdmin, upload.single('file'), bulkImportController.bulkImport);

module.exports = router;
