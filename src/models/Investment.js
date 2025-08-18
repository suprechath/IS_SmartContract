const db = require('../config/db');

const Investment = {
    async create({ investor_id, project_id, amount, transaction_hash }) {
        const query = `
            INSERT INTO investments (investor_id, project_id, amount, transaction_hash)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const params = [investor_id, project_id, amount, transaction_hash];

        try {
            const { rows } = await db.query(query, params);
            return rows[0];
        } catch (error) {
            // Check for unique constraint violation on transaction_hash to prevent duplicates
            if (error.code === '23505') { // '23505' is the code for unique_violation in PostgreSQL
                console.warn(`Attempted to insert duplicate investment transaction: ${transaction_hash}`);
                return null; // Or handle as you see fit
            }
            throw error;
        }
    }
};

module.exports = Investment;
