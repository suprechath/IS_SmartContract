import userModel from '../models/userModel.js';
import projectModel from '../models/projectModel.js';
import { handleResponse } from '../utils/responseHandler.js';
import configModel from '../models/configModel.js';
import { ethers } from 'ethers';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectFactoryArtifactPath = path.resolve(__dirname, '../../../contracts/artifacts/contracts/ProjectFactory.sol/ProjectFactory.json');

const ProjectFactory = JSON.parse(fs.readFileSync(projectFactoryArtifactPath, 'utf8'));


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

// @desc    Prepare the unsigned transaction for deploying the ProjectFactory contract
// @route   POST /api/admin/deploy-factory/prepare
export const prepareFactoryDeployment = async (req, res) => {
    const projectFactoryAddress = await configModel.getConfigValue('PROJECT_FACTORY_ADDRESS');
    if (projectFactoryAddress) {
        return handleResponse(res, 400, `A ProjectFactory contract address is already configured at ${projectFactoryAddress}. To deploy a new one, please remove the existing address from the environment configuration.`);
    }

    try {
        const factory = new ethers.ContractFactory(ProjectFactory.abi, ProjectFactory.bytecode);
        const unsignedTx = await factory.getDeployTransaction();
        handleResponse(res, 200, 'Unsigned factory deployment transaction prepared successfully.', {
            unsignedTx
        });
    } catch (error) {
        console.error('Prepare Factory Deployment Error:', error);
        handleResponse(res, 500, 'Server error during factory deployment preparation.', error.message);
    }
};


//@desc    Records the address of the newly deployed ProjectFactory contract
//@route   POST /api/admin/deploy-factory/record
export const recordFactoryDeployment = async (req, res) => {
    const { factoryAddress } = req.body;
    try {
        const updatedConfig = await configModel.setConfigValue('PROJECT_FACTORY_ADDRESS', factoryAddress);
        console.log(`✅ New ProjectFactory address ${factoryAddress} has been saved to the database.`);
        handleResponse(res, 200, 'Factory address has been successfully recorded and is now active.', {
            recordedConfig: updatedConfig
        });
    } catch (error) {
        console.error('Record Factory Deployment Error:', error);
        handleResponse(res, 500, 'Server error while recording factory address.', { error: error.message });
    }
};

//@desc    Records the address of the newly deployed ProjectFactory contract
//@route   POST /api/admin/deploy/record
export const recordDeployment = async (req, res) => {
    const { recordKey,address } = req.body;
    try {
        const updatedConfig = await configModel.setConfigValue(recordKey, address);
        console.log(`✅ New address ${address} has been saved to the database with key ${recordKey}.`);
        handleResponse(res, 200, 'Address has been successfully recorded and is now active.', {
            updatedConfig
        });
    } catch (error) {
        console.error('Record Factory Deployment Error:', error);
        handleResponse(res, 500, 'Server error while recording factory address.', { error: error.message });
    }
};

// @desc    Retrieve all configuration values
// @route   GET /api/admin/configs
export const getAllConfig = async (req, res) => {
    try {
        const allConfig = await configModel.getAllConfigValue();
        handleResponse(res, 200, 'All configuration values retrieved successfully.', allConfig);
    } catch (error) {
        console.error('Get All Config Error:', error);
        handleResponse(res, 500, 'Server error while retrieving all configuration values.', { error: error.message });
    }
};