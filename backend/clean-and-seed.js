const { promisePool } = require('./config/database');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config();

const newSampleMotors = [
    { model: 'Yamaha MT-07', year: 2024, color: '#000000', manufacturer: 'Yamaha', chassis: 'YMHTT0700001', engine: 'MT07E-1001' },
    { model: 'Honda CRF 250L', year: 2023, color: '#FF0000', manufacturer: 'Honda', chassis: 'HNDCRF250001', engine: 'CRF25E-2002' },
    { model: 'Kawasaki Z900', year: 2024, color: '#00FF00', manufacturer: 'Kawasaki', chassis: 'KWSZ90000001', engine: 'Z900E-3003' },
    { model: 'Ducati Monster', year: 2022, color: '#C0C0C0', manufacturer: 'Ducati', chassis: 'DCTMNS000001', engine: 'MNSTE-4004' },
    { model: 'Vespa GTS 300', year: 2023, color: '#FFFF00', manufacturer: 'Vespa', chassis: 'VSPGTS300001', engine: 'GTS30E-5005' }
];

const cleanAndSeed = async () => {
    try {
        console.log('🧹 Starting cleanup and seed process...\n');

        // 1. DELETE EXISTING DATA
        console.log('🗑️  Deleting existing data...');
        // Disable foreign key checks to allow truncation
        await promisePool.query('SET FOREIGN_KEY_CHECKS = 0');
        await promisePool.query('TRUNCATE TABLE service_attachments');
        await promisePool.query('TRUNCATE TABLE service_history');
        await promisePool.query('TRUNCATE TABLE motor_custom_fields');
        await promisePool.query('TRUNCATE TABLE qr_codes');
        await promisePool.query('TRUNCATE TABLE motors');
        await promisePool.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('✅ Tables truncated.\n');

        // 2. DELETE QR FILES
        console.log('🗑️  Cleaning QR code directory...');
        const qrDir = path.join(__dirname, 'uploads/qr-codes');
        try {
            const files = await fs.readdir(qrDir);
            for (const file of files) {
                await fs.unlink(path.join(qrDir, file));
            }
            console.log('✅ QR directory cleared.\n');
        } catch (err) {
            console.log('⚠️  QR directory not found or empty, creating it...');
            await fs.mkdir(qrDir, { recursive: true });
        }

        // 3. INSERT NEW DATA
        console.log('🏍️  Adding NEW sample motor data...');

        // Ensure admin user exists (or get ID)
        // Assuming the admin ID from setup-database.js is stable or we query it. 
        // For safety, let's query a user or fall back to the known ID.
        const [users] = await promisePool.query('SELECT id FROM users WHERE role="admin" LIMIT 1');
        const adminUserId = users.length > 0 ? users[0].id : '550e8400-e29b-41d4-a716-446655440000';

        let count = 0;
        for (const motor of newSampleMotors) {
            const motorId = uuidv4();

            // Insert motor
            await promisePool.query(
                'INSERT INTO motors (id, chassis_number, engine_number, color, model, year, manufacturer, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [motorId, motor.chassis, motor.engine, motor.color, motor.model, motor.year, motor.manufacturer, 'in_stock', adminUserId]
            );

            // Generate QR code
            const qrId = uuidv4();
            // IMPORTANT: Ensuring port 3000 is used for frontend URL in QR data
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            const qrData = `${frontendUrl}/scan/${motorId}`;
            const qrFileName = `${motorId}.png`;
            const qrFilePath = path.join(qrDir, qrFileName);

            await QRCode.toFile(qrFilePath, qrData, {
                width: 300,
                margin: 1,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });

            // Path stored in DB should be relative to server root or as expected by API
            // Based on motorController.js, it stores `/uploads/qr-codes/${qrFileName}`
            const qrImagePath = `/uploads/qr-codes/${qrFileName}`;

            await promisePool.query(
                'INSERT INTO qr_codes (id, motor_id, qr_code_data, qr_image_path) VALUES (?, ?, ?, ?)',
                [qrId, motorId, qrData, qrImagePath]
            );

            count++;
            console.log(`✅ Added: ${motor.model}`);
        }

        console.log(`\n🎉 Successfully refreshed database with ${count} new motors!\n`);
        process.exit(0);

    } catch (error) {
        console.error('❌ Failed:', error);
        process.exit(1);
    }
};

cleanAndSeed();
