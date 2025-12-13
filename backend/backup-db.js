const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Configuration
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'motortrace';
const BACKUP_DIR = path.join(__dirname, 'backups');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR);
}

// Generate filename with timestamp
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const filename = `backup-${timestamp}.sql`;
const filePath = path.join(BACKUP_DIR, filename);

// Mysqldump command
// Note: Requires mysqldump to be in system PATH or defined in .env
const dumpCommand = process.env.MYSQL_DUMP_PATH ? `"${process.env.MYSQL_DUMP_PATH}"` : 'mysqldump';
const command = `${dumpCommand} -h ${DB_HOST} -u ${DB_USER} ${DB_PASSWORD ? `-p${DB_PASSWORD}` : ''} ${DB_NAME} > "${filePath}"`;

console.log('📦 Starting database backup...');
console.log(`📂 Target: ${filePath}`);

exec(command, (error, stdout, stderr) => {
    if (error) {
        console.error(`❌ Backup failed: ${error.message}`);
        return;
    }
    if (stderr) {
        // mysqldump writes to stderr even on success sometimes, but we check usually
        // console.log(`stderr: ${stderr}`);
    }
    console.log(`✅ Backup completed successfully!`);
    console.log(`💾 File saved: ${filename}`);
});
