import pool from '../config/db.js';

const createRewardClaim = async (claimData) => {
    const {
        investor_id,
        project_id,
        amount,
        transaction_hash
    } = claimData;

    const newClaim = await pool.query(`
        INSERT INTO reward_claims (
            investor_id,
            project_id,
            amount,
            transaction_hash
        )
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `, [investor_id, project_id, amount, transaction_hash]);
    return newClaim.rows[0];
};

const getRewardsByTxHash = async (transaction_hash) => {
    const query = `
        SELECT *
        FROM reward_claims
        WHERE transaction_hash = $1
    `;
    const result = await pool.query(query, [transaction_hash]);
    return result.rows[0];
};

export default {
    createRewardClaim,
    getRewardsByTxHash
};