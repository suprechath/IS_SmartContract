// backend/src/tests/setup.js

import pool from '../config/db.js'; // Make sure this path is correct

const tablesToClear = [
  'users_offchain',
  'users_onchain',
  'project_offchain',
  'project_onchain',
  'transactions',
  'platform_config'
];

beforeAll(async () => {
  try {
    await pool.query(`TRUNCATE TABLE ${tablesToClear.join(', ')} RESTART IDENTITY CASCADE`);
  } catch (error) {
    console.error('Error clearing database before test file:', error);
  }
});

afterAll(async () => {
  await pool.end();
});