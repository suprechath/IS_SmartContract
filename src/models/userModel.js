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

const getUserById = async (id) => {
  const query = `
    SELECT * 
    FROM users 
    WHERE id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const updateKycStatus = async (id, status) => {
  const allowedStatuses = ['Pending', 'Verified', 'Rejected'];
  if (!allowedStatuses.includes(status)) {
    throw new Error('Invalid KYC status');
  }
  const query = `
    UPDATE users 
    SET kyc_status = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING id, wallet_address, kyc_status;
  `;
  const result = await pool.query(query, [status, id]);
  return result.rows[0];
};


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
    SET nonce = $1, updated_at = NOW()
    WHERE wallet_address = $2
  `;
  await pool.query(query, [nonce, wallet_address]);
}

const updateUser = async (id, { name, email }) => {
  const query = `
    UPDATE users
    SET name = $1, email = $2, updated_at = NOW()
    WHERE id = $3
    RETURNING id, wallet_address, name, email, role, kyc_status;
  `;
  const result = await pool.query(query, [name, email, id]);
  return result.rows[0];
};

export default {
  registerUserServices,
  getUserByWalletAddress,
  getUserById,
  updateKycStatus,
  getUserNonce,
  pushUserNonce,
  updateUser
};