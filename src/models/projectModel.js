import pool from '../config/db.js';

const createProjectOnoffchain = async (onchainData, offchainData, userOnchainId) => {
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
        SELECT pon.*, poff.title, poff.tags, poff.location, poff.cover_image_url
        FROM project_onchain pon
        JOIN project_offchain poff ON pon.project_offchain_id = poff.id
        WHERE pon.project_status = ANY($1::project_status[])
    `;
    const result = await pool.query(query, [statuses]);
    return result.rows;
};

const getProjectById = async (projectId) => {
    const query = `
        SELECT pon.*, poff.*
        FROM project_onchain pon
        JOIN project_offchain poff ON pon.project_offchain_id = poff.id
        WHERE pon.id = $1
    `;
    const result = await pool.query(query, [projectId]);
    return result.rows[0];
};

const getOnchainProjectById = async (projectId) => {
    const query = `
        SELECT pon.*, poff.*
        FROM project_onchain pon
        JOIN project_offchain poff ON pon.project_offchain_id = poff.id
        WHERE pon.id = $1
    `;
    const result = await pool.query(query, [projectId]);
    return result.rows[0];
};

const getProjectsByCreatorId = async (creatorId) => {
    const query = `
        SELECT pon.*, poff.title, poff.tags, poff.location, poff.cover_image_url
        FROM project_onchain pon
        JOIN project_offchain poff ON pon.project_offchain_id = poff.id
        WHERE pon.user_onchain_id = $1
    `;
    const result = await pool.query(query, [creatorId]);
    return result.rows;
};

const updateProject = async (projectId, onchainData, offchainData) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const getOffchainQuery = 'SELECT project_offchain_id FROM project_onchain WHERE id = $1';
        const offchainResult = await client.query(getOffchainQuery, [projectId]);
        const projectOffchainId = offchainResult.rows[0].project_offchain_id;

        if (offchainData && Object.keys(offchainData).length > 0) {
            const offchainSetClause = Object.keys(offchainData).map((key, index) => `${key} = $${index + 1}`).join(', ');
            const offchainQuery = `
                UPDATE project_offchain
                SET ${offchainSetClause}, updated_at = NOW()
                WHERE id = $${Object.keys(offchainData).length + 1}
            `;
            const offchainValues = [...Object.values(offchainData), projectOffchainId];
            await client.query(offchainQuery, offchainValues);
        }

        if (onchainData && Object.keys(onchainData).length > 0) {
            const onchainSetClause = Object.keys(onchainData).map((key, index) => `${key} = $${index + 1}`).join(', ');
            const onchainQuery = `
                UPDATE project_onchain
                SET ${onchainSetClause}, updated_at = NOW()
                WHERE id = $${Object.keys(onchainData).length + 1}
            `;
            const onchainValues = [...Object.values(onchainData), projectId];
            await client.query(onchainQuery, onchainValues);
        }

        await client.query('COMMIT');

        const query = `
        SELECT pon.*, poff.*
        FROM project_onchain pon
        JOIN project_offchain poff ON pon.project_offchain_id = poff.id
        WHERE pon.id = $1
        `;
        const result = await pool.query(query, [projectId]);
        return result.rows[0];

    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

export default {
    createProjectOnoffchain,
    getProjectsByStatus,
    getProjectById,
    getOnchainProjectById,
    getProjectsByCreatorId,
    updateProject
};