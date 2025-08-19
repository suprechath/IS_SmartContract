import pool from '../config/db.js';

const registerUserServices = async (wallet_address, name, email, nonce, role) => {
    const newUser = await pool.query(`
        INSERT INTO users (wallet_address, name, email, nonce, role) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING *
      `,[wallet_address, name, email, nonce, role]
    );
    return newUser.rows[0];
};

const getUserByWalletAddress = async (wallet_address) => {
    const query = `
      SELECT * 
      FROM users 
      WHERE wallet_address = $1
    `;
    const result = await pool.query(query, [wallet_address]);
    return result.rows[0];
}

const getUserNonce = async (wallet_address) => {
    const query = `
      SELECT nonce 
      FROM users 
      WHERE wallet_address = $1
    `;
    const result = await pool.query(query, [wallet_address]);
    return result.rows[0];
};

const pushUserNonce = async (wallet_address, nonce) => {
    const query = `
      UPDATE users 
      SET nonce = $1 
      WHERE wallet_address = $2
    `;
    await pool.query(query, [nonce, wallet_address]);
}

export default {
  registerUserServices,
  getUserByWalletAddress,
  getUserNonce,
  pushUserNonce
};