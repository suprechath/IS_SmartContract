import pool from '../config/db.js';

const createProject = async (projectData, creator_id) => {
    const {
        title,
        description,
        funding_goal,
        funding_duration,
        projected_roi,
        projected_payback_period_months,
        project_plan_url
    } = projectData;

    const newProject = await pool.query(`
        INSERT INTO projects (
            creator_id,
            title,
            description,
            funding_goal,
            funding_duration,
            projected_roi,
            projected_payback_period_months,
            project_plan_url
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
    `, [creator_id, title, description, funding_goal, funding_duration, projected_roi, projected_payback_period_months, project_plan_url]);

    return newProject.rows[0];
};

const getProjectsByStatus = async (statuses) => {
    const query = `
        SELECT *
        FROM projects
        WHERE status = ANY($1::project_status[])
    `;
    const result = await pool.query(query, [statuses]);
    return result.rows;
};

const getProjectById = async (projectId) => {
    const query = `
        SELECT *
        FROM projects
        WHERE id = $1
    `;
    const result = await pool.query(query, [projectId]);
    return result.rows[0];
};

const getProjectsByCreatorId = async (creatorId) => {
    const query = `
        SELECT *
        FROM projects
        WHERE creator_id = $1
    `;
    const result = await pool.query(query, [creatorId]);
    return result.rows;
};

const updateProject = async (projectId, fieldToUpdate) => {
    const setClause = Object.keys(fieldToUpdate)
        .map((key, index) => `${key} = $${index + 1}`)
        .join(', ');
    const finalSetClause = `${setClause}, updated_at = NOW()`;
    const query = `
        UPDATE projects
        SET ${finalSetClause}
        WHERE id = $${Object.keys(fieldToUpdate).length + 1}
        RETURNING *
    `;
    const values = [...Object.values(fieldToUpdate), projectId];
    const result = await pool.query(query, values);
    return result.rows[0];
};

export default {
    createProject,
    getProjectsByStatus,
    getProjectById,
    getProjectsByCreatorId,
    updateProject
};