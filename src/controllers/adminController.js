import userModel from '../models/userModel.js';
import projectModel from '../models/projectModel.js';
import { handleResponse } from '../utils/responseHandler.js';
// import { deployContracts } from '../../scripts/deploy.js';

// @route   POST /api/admin/verify-user
export const verifyUser = async (req, res) => {
    const { id, sanction_status } = req.body; // status should be 'Verified' or 'Rejected'
    if (!id || !sanction_status) {
        return handleResponse(res, 400, 'User ID and status are required.');
    }

    try {
        const user = await userModel.getUserById(id);
        if (!user) {
            return handleResponse(res, 404, 'User not found.');
        }

        const updatedUser = await userModel.updateSanctionStatus(id, sanction_status);
        // This is where you would trigger a "hook" in a real system
        // For now, we just return a success message.
        console.log(`Hook simulation: User ${updatedUser.wallet_address} status updated to ${updatedUser.sanction_status}`);
        handleResponse(res, 200, `User status successfully updated to ${sanction_status}`, updatedUser);
    } catch (error) {
        console.error('Verification Error:', error);
        handleResponse(res, 500, 'Server error during user verification.', error.message);
    }
};

// @desc    Review a project and set its status
// @route   POST /api/admin/projects/review
export const reviewProject = async (req, res) => {
    const { projectId, status } = req.body;
    try {
        const project = await projectModel.getOnchainProjectById(projectId);
        if (!project) {
            return handleResponse(res, 404, 'Project not found.');
        }
        if (project.project_status !== 'Pending') {
            return handleResponse(res, 400, `Project is not in 'Pending' status and cannot be reviewed.`);
        }
        const updatedProject = await projectModel.updateProject(projectId, { project_status: status }, {});
        handleResponse(res, 200, `Project status updated to ${status}`, updatedProject);
    } catch (error) {
        console.error('Project Review Error:', error);
        handleResponse(res, 500, 'Server error during project review.', error.message);
    }
};
