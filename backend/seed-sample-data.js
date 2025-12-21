const { promisePool } = require('./config/database');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs').promises;

const sampleMotors = [
    { model: 'Honda CBR 600RR', year: 2020, color: 'Red', manufacturer: 'Honda', chassis: 'JH2PC40001M000001', engine: 'PC400E-2000001' },
    { model: 'Yamaha YZF-R1', year: 2021, color: 'Blue', manufacturer: 'Yamaha', chassis: 'JYARN231000000001', engine: 'N231E-000001' },
    { model: 'Kawasaki Ninja 650', year: 2019, color: 'Green', manufacturer: 'Kawasaki', chassis: 'JKBEX650J9A000001', engine: 'EX650E-000001' },
    { model: 'Suzuki GSX-R750', year: 2022, color: 'Gold', manufacturer: 'Suzuki', chassis: 'JS1GR7CA0M2100001', engine: 'R750K-100001' },
    { model: 'Ducati Panigale V4', year: 2023, color: 'Crimson', manufacturer: 'Ducati', chassis: 'ZDM13ANWXMB000001', engine: 'V4-000001' },
    { model: 'BMW S1000RR', year: 2020, color: 'Blue', manufacturer: 'BMW', chassis: 'WB10EJ000LZX00001', engine: 'S1000RR-00001' },
    { model: 'KTM 390 Duke', year: 2021, color: 'Orange', manufacturer: 'KTM', chassis: 'VBKMZ39000M000001', engine: '390DUKE-00001' },
    { model: 'Aprilia RSV4', year: 2022, color: 'Black', manufacturer: 'Aprilia', chassis: 'ZD4PG00N0NS000001', engine: 'RSV4RF-00001' },
    { model: 'Triumph Street Triple', year: 2019, color: 'Lime', manufacturer: 'Triumph', chassis: 'SMTD03NK0MS000001', engine: 'D03-000001' },
    { model: 'Harley Davidson Street 750', year: 2020, color: 'Purple', manufacturer: 'Harley Davidson', chassis: 'MEG1HD48XKR000001', engine: 'HD750-000001' }
];

const insertSampleData = async () => {
    try {
        console.log('🏍️  Adding sample motor data...\n');

        // Find admin user dynamically
        const [users] = await promisePool.query('SELECT id FROM users WHERE email = ?', ['admin@motortrace.com']);

        let adminUserId;
        if (users.length > 0) {
            adminUserId = users[0].id;
        } else {
            console.log('⚠️  Admin user not found, checking for any user...');
            const [anyUser] = await promisePool.query('SELECT id FROM users LIMIT 1');
            if (anyUser.length > 0) {
                adminUserId = anyUser[0].id;
            } else {
                console.error('❌ No users found in database. Please run setup first.');
                process.exit(1);
            }
        }

        // Create uploads directory for QR codes
        const qrDir = path.join(__dirname, 'uploads/qr-codes');
        try {
            await fs.mkdir(qrDir, { recursive: true });
        } catch (err) {
            // Directory already exists
        }

        let count = 0;

        for (const motor of sampleMotors) {
            const motorId = uuidv4();

            // Insert motor
            await promisePool.query(
                'INSERT INTO motors (id, chassis_number, engine_number, color, model, year, manufacturer, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [motorId, motor.chassis, motor.engine, motor.color, motor.model, motor.year, motor.manufacturer, 'in_stock', adminUserId]
            );

            // Generate QR code
            const qrId = uuidv4();
            const qrData = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/scan/${motorId}`;
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

            const qrImagePath = `/uploads/qr-codes/${qrFileName}`;

            await promisePool.query(
                'INSERT INTO qr_codes (id, motor_id, qr_code_data, qr_image_path) VALUES (?, ?, ?, ?)',
                [qrId, motorId, qrData, qrImagePath]
            );

            count++;
            console.log(`✅ ${count}. ${motor.model} (${motor.year}) - ${motor.color}`);
        }

        console.log(`\n🎉 Successfully added ${count} sample motors!\n`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to add sample data:', error);
        process.exit(1);
    }
};

insertSampleData();
