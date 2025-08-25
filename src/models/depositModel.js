import pool from '../config/db.js';

const createDeposit = async (depositData, creator_id) => {
    const {
        project_id,
        amount,
        transaction_hash
    } = depositData;

    const newDeposit = await pool.query(`
        INSERT INTO reward_deposits (
            creator_id,
            project_id,
            amount,
            transaction_hash
        )
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `, [creator_id, project_id, amount, transaction_hash]);

    return newDeposit.rows[0];
};

const getDepositByTxHash = async (transaction_hash) => {
    const query = `
        SELECT *
        FROM reward_deposits
        WHERE transaction_hash = $1
    `;
    const result = await pool.query(query, [transaction_hash]);
    return result.rows[0];
};

export default {
    createDeposit,
    getDepositByTxHash
};