const db = require('../src/config/db');

const cleanDb = async () => {
    const tables = ['investments', 'projects', 'users'];
    for (const table of tables) {
        await db.query(`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE;`);
    }
};

module.exports = {
    cleanDb
};
