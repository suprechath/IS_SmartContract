import pool from '../config/db.js';

const registerUserServices = async (wallet_address, name, email, nonce, role) => {
    const newUser = await pool.query(
      'INSERT INTO users (wallet_address, name, email, nonce, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [wallet_address, name, email, nonce, role]
    );
    return newUser.rows[0];
};

export default {
  registerUserServices
};