import pool from '../config/db.js';

const registerUserServices = async (
  full_name,
  date_of_birth,
  address,
  identification_number,
  email,
  wallet_address,
  role
) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    let offchainResult = await client.query(
      `SELECT id FROM users_offchain WHERE identification_number = $1 OR email = $2`,
      [identification_number, email]
    );
    let offchainUserId;
    if (offchainResult.rows.length > 0) {
      offchainUserId = offchainResult.rows[0].id;
      console.log(`Found existing off-chain user: ${offchainUserId}`);
    } else {
      const newOffchainQuery = `
        INSERT INTO users_offchain (
          full_name, date_of_birth, address, identification_number, email
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id;
      `;
      const newOffchainValues = [full_name, date_of_birth, address, identification_number, email];
      const newOffchainResult = await client.query(newOffchainQuery, newOffchainValues);
      offchainUserId = newOffchainResult.rows[0].id;
      console.log(`Created new off-chain user: ${offchainUserId}`);
    }

    const onchainQuery = `
      INSERT INTO users_onchain (user_offchain_id, wallet_address, role)
      VALUES ($1, $2, $3)
      RETURNING id, wallet_address, role;
    `;
    const onchainValues = [offchainUserId, wallet_address, role];
    const onchainResult = await client.query(onchainQuery, onchainValues);

    await client.query('COMMIT');
    return onchainResult.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const getUserByWalletAddress = async (wallet_address) => {
  const query = `
    SELECT
      id,
      wallet_address,
      role,
      sanction_status
    FROM users_onchain
    WHERE wallet_address = $1;
  `;
  const result = await pool.query(query, [wallet_address]);
  return result.rows[0];
};

const getUserById = async (id) => {
  const query = `
    SELECT
      id,
      wallet_address,
      role,
      sanction_status 
    FROM users_onchain
    WHERE id = $1;
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const getFullUserProfileById = async (id) => {
  const query = `
    SELECT uoc.*, uoff.*
    FROM users_onchain uoc
    JOIN users_offchain uoff ON uoc.user_offchain_id = uoff.id
    WHERE uoc.id = $1;
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const updateSanctionStatus = async (id, status) => {
  const allowedStatuses = ['Pending', 'Verified', 'Rejected'];
  if (!allowedStatuses.includes(status)) {
    throw new Error('Invalid sanction status');
  }
  const query = `
    UPDATE users_onchain
    SET sanction_status = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING id, sanction_status, wallet_address;
  `;
  const result = await pool.query(query, [status, id]);
  return result.rows[0];
};

const updateUser = async (onchainId, offchainData) => {
  const validFields = Object.keys(offchainData).filter(key => offchainData[key] != null && offchainData[key] !== '');  
  console.log('Valid fields for update:', validFields);
  if (validFields.length === 0) {
    throw new Error("No valid fields provided for update.");
  }
  const setClause = validFields
    .map((key, index) => `"${key}" = $${index + 1}`)
    .join(', ');
  const finalSetClause = `${setClause}, updated_at = NOW()`;
  const query = `
    UPDATE users_offchain
    SET ${finalSetClause}
    WHERE id = (SELECT user_offchain_id FROM users_onchain WHERE id = $${validFields.length + 1})
    RETURNING *;
  `;
  const values = [
    ...validFields.map(key => offchainData[key]),
    onchainId
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
};

export default {
  registerUserServices,
  getUserByWalletAddress,
  getUserById,
  getFullUserProfileById, 
  updateSanctionStatus,
  updateUser 
};