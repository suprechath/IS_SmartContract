const db = require('../config/db');
const bcrypt = require('bcryptjs');

const User = {
    async create({ username, email, password, wallet_address, role }) {
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const query = `
            INSERT INTO users (username, email, password_hash, wallet_address, role)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, username, email, wallet_address, role, kyc_status, created_at;
        `;
        const params = [username, email, password_hash, wallet_address, role];

        try {
            const { rows } = await db.query(query, params);
            return rows[0];
        } catch (error) {
            // Handle potential unique constraint errors (e.g., username or email already exists)
            throw error;
        }
    },

    async findByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = $1;';
        try {
            const { rows } = await db.query(query, [email]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    },

    async findByUsername(username) {
        const query = 'SELECT * FROM users WHERE username = $1;';
        try {
            const { rows } = await db.query(query, [username]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    },

    async findById(id) {
        const query = 'SELECT * FROM users WHERE id = $1;';
        try {
            const { rows } = await db.query(query, [id]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    },

    async findByWalletAddress(walletAddress) {
        const query = 'SELECT * FROM users WHERE wallet_address = $1;';
        try {
            const { rows } = await db.query(query, [walletAddress]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    }
};

module.exports = User;
