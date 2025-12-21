const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { testConnection } = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth.routes');
const motorRoutes = require('./routes/motor.routes');
const serviceRoutes = require('./routes/service.routes');
const bulkImportRoutes = require('./routes/bulkImport.routes');
const userRoutes = require('./routes/user.routes');
const activityLogRoutes = require('./routes/activityLog.routes');
const serviceTypeRoutes = require('./routes/serviceType.routes');
const technicianRoutes = require('./routes/technician.routes');
const roleRoutes = require('./routes/role.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - CORS Configuration
app.use(cors({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'MotorTrace API is running',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/motors', motorRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bulk-import', bulkImportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api/service-types', serviceTypeRoutes);
app.use('/api/technicians', technicianRoutes);
app.use('/api/roles', roleRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const startServer = async () => {
    try {
        // Test database connection
        const dbConnected = await testConnection();

        if (!dbConnected) {
            console.error('⚠️  Failed to connect to database. Please check your MySQL configuration.');
            console.log('📝 Make sure XAMPP MySQL is running and database is created.');
            process.exit(1);
        }

        app.listen(PORT, '0.0.0.0', () => {
            console.log('');
            console.log('🚀 MotorTrace API Server Started');
            console.log('================================');
            console.log(`📍 Server: http://localhost:${PORT}`);
            console.log(`📍 Network: http://10.22.170.64:${PORT}`);
            console.log(`🏥 Health: http://localhost:${PORT}/health`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log('================================');
            console.log('');
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

module.exports = app;
