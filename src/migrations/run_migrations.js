const fs = require('fs');
const path = require('path');
const db = require('../config/db');

const runMigrations = async () => {
    try {
        const migrationFilePath = path.join(__dirname, 'initial_migration.sql');
        const migrationSQL = fs.readFileSync(migrationFilePath, 'utf8');

        console.log('Running database migrations...');
        await db.query(migrationSQL);
        console.log('Migrations completed successfully.');
    } catch (error) {
        console.error('Error running migrations:', error);
        process.exit(1);
    } finally {
        // Since the db pool is shared, we don't end it here.
        // In a real application, you might want a separate script that does end the pool.
    }
};

runMigrations();
