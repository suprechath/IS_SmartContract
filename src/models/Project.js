const db = require('../config/db');

const Project = {
    async create({ creator_id, title, description, funding_goal, funding_duration, platform_fee_percentage, reward_fee_percentage }) {
        const query = `
            INSERT INTO projects (creator_id, title, description, funding_goal, funding_duration, platform_fee_percentage, reward_fee_percentage, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'Pending')
            RETURNING *;
        `;
        const params = [creator_id, title, description, funding_goal, funding_duration, platform_fee_percentage, reward_fee_percentage];

        try {
            const { rows } = await db.query(query, params);
            return rows[0];
        } catch (error) {
            throw error;
        }
    },

    async findById(id) {
        const query = 'SELECT * FROM projects WHERE id = $1;';
        try {
            const { rows } = await db.query(query, [id]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    },

    async findByIdWithCreator(id) {
        const query = `
            SELECT p.*, u.wallet_address as creator_wallet_address
            FROM projects p
            JOIN users u ON p.creator_id = u.id
            WHERE p.id = $1;
        `;
        try {
            const { rows } = await db.query(query, [id]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    },

    async updateStatus(id, status) {
        const query = `
            UPDATE projects
            SET status = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *;
        `;
        try {
            const { rows } = await db.query(query, [status, id]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    },

    async addContractAddresses(id, tokenAddress, managementAddress) {
        const query = `
            UPDATE projects
            SET project_token_address = $1, project_management_address = $2, updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
            RETURNING *;
        `;
        try {
            const { rows } = await db.query(query, [tokenAddress, managementAddress, id]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    },

    async getAllByStatus(status) {
        let query = 'SELECT * FROM projects';
        const params = [];
        if (status) {
            query += ' WHERE status = $1';
            params.push(status);
        }
        query += ' ORDER BY created_at DESC;';

        try {
            const { rows } = await db.query(query, params);
            return rows;
        } catch (error) {
            throw error;
        }
    },

    async getLive() {
        const query = `
            SELECT * FROM projects
            WHERE status = 'Funding' OR status = 'Active'
            ORDER BY created_at DESC;
        `;
        try {
            const { rows } = await db.query(query);
            return rows;
        } catch (error) {
            throw error;
        }
    },

    async findByInvestorId(investorId) {
        const query = `
            SELECT DISTINCT p.*, i.amount as investment_amount
            FROM projects p
            JOIN investments i ON p.id = i.project_id
            WHERE i.investor_id = $1
            ORDER BY p.created_at DESC;
        `;
        try {
            const { rows } = await db.query(query, [investorId]);
            return rows;
        } catch (error) {
            throw error;
        }
    }
};

module.exports = Project;
