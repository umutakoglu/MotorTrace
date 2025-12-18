const { testConnection } = require('./backend/config/database');

async function run() {
    const success = await testConnection();
    if (success) {
        console.log('Database connection SUCCESS');
        process.exit(0);
    } else {
        console.log('Database connection FAILED');
        process.exit(1);
    }
}

run();
