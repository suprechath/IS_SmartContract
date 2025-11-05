import pool from '../config/db.js';

const createProject = async (onchainData, offchainData, userOnchainId) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const offchainQuery = `
            INSERT INTO project_offchain (
                title, project_overview, proposed_solution, location, 
                cover_image_url, tags, co2_reduction, projected_roi, 
                projected_payback_period_months, project_plan_url, 
                technical_specifications_urls, third_party_verification_urls
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING id;
        `;
        const offchainValues = [
            offchainData.title,
            offchainData.project_overview,
            offchainData.proposed_solution,
            offchainData.location,
            offchainData.cover_image_url,
            offchainData.tags,
            offchainData.co2_reduction,
            offchainData.projected_roi,
            offchainData.projected_payback_period_months,
            offchainData.project_plan_url,
            offchainData.technical_specifications_urls,
            offchainData.third_party_verification_urls
        ];
        const offchainResult = await client.query(offchainQuery, offchainValues);
        const projectOffchainId = offchainResult.rows[0].id;

        const onchainQuery = `
            INSERT INTO project_onchain (
                user_onchain_id, project_offchain_id, funding_usdc_goal, funding_duration_second, 
                usdc_contract_address, platform_fee_percentage, reward_fee_percentage
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
        const onchainValues = [
            userOnchainId,
            projectOffchainId,
            onchainData.funding_USDC_goal,
            onchainData.funding_duration_second,
            onchainData.usdc_contract_address,
            onchainData.platform_fee_percentage,
            onchainData.reward_fee_percentage
        ];
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

const getProjectsByStatus = async (statuses) => {
    const query = `
        SELECT pon.*, poff.title, poff.tags, poff.location, poff.cover_image_url, poff.projected_roi, poff.co2_reduction, poff.projected_payback_period_months
        FROM project_onchain pon
        JOIN project_offchain poff ON pon.project_offchain_id = poff.id
        WHERE pon.project_status = ANY($1::project_status[])
    `;
    const result = await pool.query(query, [statuses]);
    return result.rows;
};

const getProjectById = async (projectId) => {
    const query = `
        SELECT 
            pon.id AS onchain_id,
            poff.id AS offchain_id,
            pon.*,
            poff.*,
            COUNT(DISTINCT tx.user_onchain_id) AS contributor_count
        FROM project_onchain pon
        JOIN project_offchain poff ON pon.project_offchain_id = poff.id
        LEFT JOIN transactions tx ON tx.project_onchain_id = pon.id AND tx.transaction_type = 'Investment'
        WHERE pon.id = $1
        GROUP BY pon.id, poff.id
    `;
    const result = await pool.query(query, [projectId]);
    return result.rows[0];
};

const getOnchainProjectById = async (projectId) => {
    const query = `
        SELECT poff.title, pon.*
        FROM project_onchain pon
        JOIN project_offchain poff ON pon.project_offchain_id = poff.id
        WHERE pon.id = $1
    `;
    const result = await pool.query(query, [projectId]);
    return result.rows[0];
};

const getProjectsByCreatorId = async (creatorId) => {
    const query = `
        SELECT pon.*, poff.title, poff.tags, poff.location, poff.cover_image_url, poff.project_overview, poff.proposed_solution,COUNT(DISTINCT tx.user_onchain_id) AS contributor_count
        FROM project_onchain pon
        JOIN project_offchain poff ON pon.project_offchain_id = poff.id
        LEFT JOIN transactions tx ON tx.project_onchain_id = pon.id AND tx.transaction_type = 'Investment'
        WHERE pon.user_onchain_id = $1
        GROUP BY pon.id, poff.title, poff.tags, poff.location, poff.cover_image_url, poff.project_overview, poff.proposed_solution
    `;
    const result = await pool.query(query, [creatorId]);
    return result.rows;
};

const updateProject = async (projectId, onchainData, offchainData) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const filterInvalidValues = (data) => {
            const filtered = {};
            if (data) {
                for (const key in data) {
                    if (data[key] !== null && data[key] !== '') {
                        filtered[key] = data[key];
                    }
                }
            }
            return filtered;
        };
        const filteredOffchainData = filterInvalidValues(offchainData);
        const filteredOnchainData = filterInvalidValues(onchainData);
        console.log('Filtered Offchain Data:', filteredOffchainData);
        console.log('Filtered Onchain Data:', filteredOnchainData);

        const offchainResult = await client.query('SELECT project_offchain_id FROM project_onchain WHERE id = $1', [projectId]);
        if (offchainResult.rows.length === 0) {
            throw new Error(`Project with ID ${projectId} not found.`);
        }
        const projectOffchainId = offchainResult.rows[0].project_offchain_id;

        if (Object.keys(filteredOffchainData).length > 0) {
            const offchainFields = Object.keys(filteredOffchainData);
            const offchainSetClause = offchainFields.map((key, index) => `${key} = $${index + 1}`).join(', ');
            console.log('Offchain Set Clause:', offchainSetClause);
            const offchainQuery = `
                UPDATE project_offchain
                SET ${offchainSetClause}, updated_at = NOW()
                WHERE id = $${offchainFields.length + 1}
            `;
            const offchainValues = [...Object.values(filteredOffchainData), projectOffchainId];
            await client.query(offchainQuery, offchainValues);
        }

        if (Object.keys(filteredOnchainData).length > 0) {
            const onchainFields = Object.keys(filteredOnchainData);
            const onchainSetClause = onchainFields.map((key, index) => `${key} = $${index + 1}`).join(', ');
            const onchainQuery = `
                UPDATE project_onchain
                SET ${onchainSetClause}, updated_at = NOW()
                WHERE id = $${onchainFields.length + 1}
            `;
            const onchainValues = [...Object.values(filteredOnchainData), projectId];
            await client.query(onchainQuery, onchainValues);
        }

        await client.query('COMMIT');

        const resultQuery = `
            SELECT pon.*, poff.*
            FROM project_onchain pon
            JOIN project_offchain poff ON pon.project_offchain_id = poff.id
            WHERE pon.id = $1
        `;
        const result = await pool.query(resultQuery, [projectId]);
        return result.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error in updateProject model:", error); // Added for better logging
        throw error;
    } finally {
        client.release();
    }
};

const getProjectIdsAndTitles = async () => {
    const query = `
        SELECT pon.id, poff.title, pon.project_status, pon.management_contract_address, pon.token_contract_address
        FROM project_onchain pon
        JOIN project_offchain poff ON pon.project_offchain_id = poff.id
        ORDER BY poff.title;
    `;
    const result = await pool.query(query);
    return result.rows;
};

const getMyInvestments = async (investorOnchainId) => {
    const query = `
        SELECT
            pon.id AS project_onchain_id,
            poff.id AS project_offchain_id,
            poff.title AS project_title,
            pon.project_status,
            pon.token_contract_address,
            pon.management_contract_address,
            pon.usdc_contract_address,
            tx.*
        FROM transactions tx
        JOIN project_onchain pon ON tx.project_onchain_id = pon.id
        JOIN project_offchain poff ON pon.project_offchain_id = poff.id
        WHERE tx.user_onchain_id = $1
        ORDER BY poff.title;
    `;
    const result = await pool.query(query, [investorOnchainId]);
    return result.rows;
};

export default {
    createProject,
    getProjectsByStatus,
    getProjectById,
    getOnchainProjectById,
    getProjectsByCreatorId,
    updateProject,
    getProjectIdsAndTitles,
    getMyInvestments
};