import userModel from '../models/userModel.js';
import projectModel from '../models/projectModel.js';
import { handleResponse } from '../utils/responseHandler.js';
// import { deployContracts } from '../../scripts/deploy.js';

// @route   POST /api/admin/verify-user
export const verifyUser = async (req, res) => {
    const { id, kyc_status } = req.body; // status should be 'Verified' or 'Rejected'

    if (!id || !kyc_status) {
        return handleResponse(res, 400, 'User ID and status are required.');
    }

    try {
        const user = await userModel.getUserById(id);
        if (!user) {
            return handleResponse(res, 404, 'User not found.');
        }

        const updatedUser = await userModel.updateSanctionStatus(id, kyc_status);

        // This is where you would trigger a "hook" in a real system
        // For now, we just return a success message.
        console.log(`Hook simulation: User ${updatedUser.wallet_address} status updated to ${updatedUser.kyc_status}`);
        
        handleResponse(res, 200, `User status successfully updated to ${kyc_status}`, updatedUser);

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
        const project = await projectModel.getProjectById(projectId);
        if (!project) {
            return handleResponse(res, 404, 'Project not found.');
        }
        if (project.status !== 'Pending') {
            return handleResponse(res, 400, `Project is not in 'Pending' status and cannot be reviewed.`);
        }

        const updatedProject = await projectModel.updateProject(projectId, { status });
        handleResponse(res, 200, `Project status updated to ${status}`, updatedProject);
    } catch (error) {
        console.error('Project Review Error:', error);
        handleResponse(res, 500, 'Server error during project review.', error.message);
    }
};

// // @desc    Deploy smart contracts for an approved project
// // @route   POST /api/admin/projects/deploy
// export const deployProject = async (req, res) => {
//     const { projectId } = req.body;
//     try {
//         const project = await projectModel.getProjectById(projectId);
//         if (!project) {
//             return handleResponse(res, 404, 'Project not found.');
//         }
//         if (project.status !== 'Approved') {
//             return handleResponse(res, 400, `Project must be in 'Approved' status to be deployed.`);
//         }
//         if (project.management_contract_address || project.token_contract_address) {
//             return handleResponse(res, 400, 'Project contracts have already been deployed.');
//         }

//         // Trigger the deployment script
//         // const { managementContractAddress, tokenContractAddress } = await deployContracts(project);

//         // const updatedProject = await projectModel.updateProject(projectId, {
//         //     management_contract_address: managementContractAddress,
//         //     token_contract_address: tokenContractAddress,
//         //     status: 'Funding'
//         // });
//         // handleResponse(res, 200, 'Project deployed successfully and status updated to Funding.', updatedProject);
//         handleResponse(res, 200, 'Project deployed successfully and status updated to Funding.', project);
        
//     } catch (error) {
//         console.error('Project Deployment Error:', error);
//         await projectModel.updateProject(projectId, { status: 'Failed' });
//         handleResponse(res, 500, 'Server error during project deployment. Project status has been set to Failed.', error.message);
//     }
// };
