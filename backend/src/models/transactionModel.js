// src/models/transactionModel.js
import pool from '../config/db.js';

const createTransaction = async (txData, userId) => {
    const {
        project_onchain_id,
        USDC_amount,
        transaction_type,
        transaction_hash,
        related_transaction_hash,
        platform_fee
    } = txData;

    const newTransaction = await pool.query(`
        INSERT INTO transactions (
            user_onchain_id,
            project_onchain_id,
            USDC_amount,
            transaction_type,
            transaction_hash,
            related_transaction_hash,
            platform_fee
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
    `, [userId, project_onchain_id, USDC_amount, transaction_type, transaction_hash, related_transaction_hash, platform_fee]);

    return newTransaction.rows[0];
};

const getTransactionByTxHash = async (transaction_hash) => {
    const query = `
        SELECT *
        FROM transactions
        WHERE transaction_hash = $1
    `;
    const result = await pool.query(query, [transaction_hash]);
    return result.rows[0];
};

const getTransactionsByProjectId = async (project_onchain_id) => {
    const query = `
        SELECT *
        FROM transactions
        WHERE project_onchain_id = $1
        ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [project_onchain_id]);
    return result.rows;
};

const getTransactionsByUserId = async (user_onchain_id) => {
    const query = `
        SELECT *
        FROM transactions
        WHERE user_onchain_id = $1
        ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [user_onchain_id]);
    return result.rows;
};

const getTransactionsByType = async (transaction_type) => {
    const query = `
        SELECT *
        FROM transactions
        WHERE transaction_type = $1
        ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [transaction_type]);
    return result.rows;
};


export default {
    createTransaction,
    getTransactionByTxHash,
    getTransactionsByProjectId,
    getTransactionsByUserId,
    getTransactionsByType
};