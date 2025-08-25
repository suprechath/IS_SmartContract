import pool from '../config/db.js';

const getWithdrawalByTxHash = async (transaction_hash) => {
    const query = `
        SELECT *
        FROM withdrawals
        WHERE transaction_hash = $1
    `;
    const result = await pool.query(query, [transaction_hash]);
    return result.rows[0];
};

const createWithdrawal = async (withdrawalData) => {
    const {
        project_id,
        creator_id,
        amount_withdrawn,
        platform_fee,
        transaction_hash
    } = withdrawalData;

    const newWithdrawal = await pool.query(`
        INSERT INTO withdrawals (
            project_id,
            creator_id,
            amount_withdrawn,
            platform_fee,
            transaction_hash
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `, [project_id, creator_id, amount_withdrawn, platform_fee, transaction_hash]);

    return newWithdrawal.rows[0];
};

export default {
    createWithdrawal,
    getWithdrawalByTxHash
};