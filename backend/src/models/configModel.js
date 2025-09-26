import pool from '../config/db.js';

const setConfigValue = async (key, value) => {
    const query = `
        INSERT INTO platform_config (config_key, config_value)
        VALUES ($1, $2)
        ON CONFLICT (config_key) DO UPDATE
        SET config_value = EXCLUDED.config_value, updated_at = NOW()
        RETURNING *;
    `;
    const result = await pool.query(query, [key, value]);
    return result.rows[0];
};

const getConfigValue = async (key) => {
    const query = `SELECT config_value FROM platform_config WHERE config_key = $1;`;
    const result = await pool.query(query, [key]);
    if (result.rows.length > 0) {
        return result.rows[0].config_value;
    }
    return null;
};

const getAllConfigValue = async () => {
    const query = `SELECT * FROM platform_config;`;
    const result = await pool.query(query);
    if (result.rows.length > 0) {
        // console.log('All Config Values:', result.rows);
        return result.rows;
    }
    return null;
};

const updateConfigValue = async (key) => {
    console.log('Deleting config with key:', key);
    const query = `UPDATE platform_config SET config_value = NULL, updated_at = NOW() WHERE config_key = $1 RETURNING *;`;
    const result = await pool.query(query, [key]);
    return result.rows[0];
};

export default {
    setConfigValue,
    getConfigValue,
    getAllConfigValue,
    updateConfigValue
};