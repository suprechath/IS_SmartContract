import pool from '../config/db.js';

const createInvestment = async (investmentData, investor_id) => {
    const {
        project_id,
        amount,
        transaction_hash
    } = investmentData;

    const newInvestment = await pool.query(`
        INSERT INTO investments (
            investor_id,
            project_id,
            amount,
            transaction_hash
        )
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `, [investor_id, project_id, amount, transaction_hash]);
    return newInvestment.rows[0];
};

const getInvestmentByTxHash = async (transaction_hash) => {
    const query = `
        SELECT *
        FROM investments
        WHERE transaction_hash = $1
    `;
    const result = await pool.query(query, [transaction_hash]);
    return result.rows[0];
};


export default {
    createInvestment,
    getInvestmentByTxHash
};