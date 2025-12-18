const fs = require('fs');
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

async function exportDatabase() {
    console.log('📦 Veritabanı yedekleniyor...');

    const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'motortrace',
        multipleStatements: true
    };

    try {
        const connection = await mysql.createConnection(config);

        // Tabloları al
        const [tables] = await connection.query('SHOW TABLES');
        let sqlContent = '';

        for (const row of tables) {
            const tableName = Object.values(row)[0];

            // Tablo yapısını al
            const [createTable] = await connection.query(`SHOW CREATE TABLE ${tableName}`);
            sqlContent += `DROP TABLE IF EXISTS \`${tableName}\`;\n`;
            sqlContent += createTable[0]['Create Table'] + ';\n\n';

            // Verileri al
            const [rows] = await connection.query(`SELECT * FROM ${tableName}`);
            if (rows.length > 0) {
                sqlContent += `INSERT INTO \`${tableName}\` VALUES \n`;
                const values = rows.map(r => {
                    return '(' + Object.values(r).map(v => {
                        if (v === null) return 'NULL';
                        if (typeof v === 'string') return connection.escape(v);
                        if (v instanceof Date) return connection.escape(v);
                        return v;
                    }).join(', ') + ')';
                }).join(',\n');
                sqlContent += values + ';\n\n';
            }
        }

        fs.writeFileSync('full_data_backup.sql', sqlContent);
        console.log('✅ Yedek başarıyla oluşturuldu: full_data_backup.sql');
        await connection.end();
    } catch (error) {
        console.error('❌ Hata:', error.message);
    }
}

exportDatabase();
