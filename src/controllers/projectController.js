import projectModel from '../models/projectModel.js';
import userModel from '../models/userModel.js';
import { handleResponse } from '../utils/responseHandler.js';
import { separateProjectData } from '../utils/projectUtils.js';
import { ethers } from 'ethers';
import configModel from '../models/configModel.js';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectTokenArtifactPath = path.resolve(__dirname, '../../artifacts/contracts/ProjectToken.sol/ProjectToken.json');
const projectManagementArtifactPath = path.resolve(__dirname, '../../artifacts/contracts/ProjectManagement.sol/ProjectManagement.json');
const ProjectToken = JSON.parse(fs.readFileSync(projectTokenArtifactPath, 'utf8'));
const ProjectManagement = JSON.parse(fs.readFileSync(projectManagementArtifactPath, 'utf8'));
const projectFactoryArtifactPath = path.resolve(__dirname, '../../artifacts/contracts/ProjectFactory.sol/ProjectFactory.json');
const ProjectFactory = JSON.parse(fs.readFileSync(projectFactoryArtifactPath, 'utf8'));

// @desc    Create a new project
// @route   POST /api/projects
export const createProject = async (req, res) => {
    try {
        const { onchainData, offchainData } = separateProjectData(req.body);
        const newProject = await projectModel.createProject(onchainData, offchainData, req.user.id);
        handleResponse(res, 201, 'Project created successfully', newProject);
    } catch (error) {
        console.error('Create Project Error:', error);
        handleResponse(res, 500, 'Server error during project creation.', error.message);
    }
};

// @desc    Get all public projects, optionally filtered by status
// @route   GET /api/projects
export const getProjects = async (req, res) => {
    const publicStatuses = ['Pending', 'Approved', 'Rejected', 'Funding', 'Succeeded', 'Failed', 'Active'];
    let requestedStatuses = req.query.status; 
    //http://localhost:5001/api/projects?status=Succeeded || http://localhost:5001/api/projects?status=Funding&status=Active
    let statusesToQuery = [];

    if (requestedStatuses) {
        if (!Array.isArray(requestedStatuses)) {
            requestedStatuses = [requestedStatuses];
        }
        statusesToQuery = requestedStatuses.filter(status => publicStatuses.includes(status));

    } else {
        // Default to 'Funding' and 'Active' if no status is provided
        statusesToQuery = ['Funding', 'Active'];
    }
    if (statusesToQuery.length === 0) {
        return handleResponse(res, 200, 'No projects found with the specified valid statuses.', []);
    }
    try {
        const projects = await projectModel.getProjectsByStatus(statusesToQuery);
        handleResponse(res, 200, 'Projects retrieved successfully', projects);
    } catch (error) {
        console.error('Get Projects Error:', error);
        handleResponse(res, 500, 'Server error while retrieving projects.', error.message);
    }
};

// @desc    Get a single project by ID
// @route   GET /api/projects/id/:projectId
export const getProjectById = async (req, res) => {
    try {
        const project = await projectModel.getProjectById(req.params.projectId);
        if (!project) {
            return handleResponse(res, 404, 'Project not found.');
        }
        handleResponse(res, 200, 'Project retrieved successfully', project);
    } catch (error) {
        console.error('Get Project By ID Error:', error);
        handleResponse(res, 500, 'Server error while retrieving the project.', error.message);
    }
};

// @desc    Get projects for the logged-in user
// @route   GET /api/projects/my
export const getMyProjects = async (req, res) => {
    try {
        const projects = await projectModel.getProjectsByCreatorId(req.user.id);
        handleResponse(res, 200, 'User projects retrieved successfully', projects);
    } catch (error) {
        console.error('Get My Projects Error:', error);
        handleResponse(res, 500, 'Server error while retrieving user projects.', error.message);
    }
};

// @desc    Update a project
// @route   PATCH /api/projects/id/:projectId
export const updateProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const project = await projectModel.getProjectById(projectId);

        if (!project) {
            return handleResponse(res, 404, 'Project not found.');
        }
        if (project.user_onchain_id !== req.user.id) {
            return handleResponse(res, 403, 'Not authorized to update this project.');
        }
        if (project.project_status !== 'Pending') {
            return handleResponse(res, 400, `Project cannot be updated. It is in '${project.project_status}' status.`);
        }
        
        const { onchainData, offchainData } = separateProjectData(req.body);
        console.log('Onchain Data to update:', onchainData);
        console.log('Offchain Data to update:', offchainData);
        const updatedProject = await projectModel.updateProject(projectId, onchainData, offchainData);
        handleResponse(res, 200, 'Project updated successfully', updatedProject);
    } catch (error) {
        console.error('Update Project Error:', error);
        handleResponse(res, 500, 'Server error during project update.', error.message);
    }
};

// @desc    Prepare a createProject transaction
// @route   POST /api/projects/deploy/onchain
export const prepareCreateProject = async (req, res) => {
    const { projectId } = req.body;
    const creatorId = req.user.id;

    try {
        const factoryAddress = await configModel.getConfigValue('PROJECT_FACTORY_ADDRESS');
        if (!factoryAddress) {
            return handleResponse(res, 503, 'ProjectFactory address is not configured on the platform. Deployment is currently unavailable.');
        }

        const project = await projectModel.getOnchainProjectById(projectId);
        if (!project) {
            return handleResponse(res, 404, 'Project not found.');
        }
        if (project.user_onchain_id !== creatorId) {
            return handleResponse(res, 403, 'Not authorized to prepare this project.');
        }
        if (project.project_status !== 'Approved') {
            return handleResponse(res, 400, `Project must be in 'Approved' status to be deployed.`);
        }
        if (project.management_contract_address || project.token_contract_address) {
            return handleResponse(res, 400, 'Project contracts have already been deployed.');
        }

        const creator = await userModel.getUserById(project.user_onchain_id);
        const creatorWallet = creator.wallet_address;
        const USDC_CONTRACT_ADDRESS  = await configModel.getConfigValue('USDC_CONTRACT_ADDRESS');

        const provider = new ethers.JsonRpcProvider(process.env.network_rpc_url);
        const factoryContract = new ethers.Contract(factoryAddress, ProjectFactory.abi, provider);
        const unsignedTx = await factoryContract.createProject.populateTransaction(
            ethers.encodeBytes32String(project.id.substring(0, 31)),
            creator.wallet_address,
            project.title,
            project.id.substring(0, 4).toUpperCase(),
            project.funding_usdc_goal,
            project.funding_duration_second,
            USDC_CONTRACT_ADDRESS,
            project.platform_fee_percentage,
            project.reward_fee_percentage
        );
        handleResponse(res, 200, 'Create project transaction prepared successfully.', { unsignedTx });

    } catch (error) {
        console.error('Prepare Create Project Error:', error);
        handleResponse(res, 500, 'Server error during transaction preparation.', error.message);
    }
};

//GET /api/projects/deploy/onboard
export const onboard = async (req, res) => {
    const { projectId, tokenContractAddress, managementContractAddress } = req.body;
    try {
        const project = await projectModel.getProjectById(projectId);
        if (!project) {
            return handleResponse(res, 404, 'Project not found.');
        }
        if (project.creator_id !== req.user.id) {
            return handleResponse(res, 403, 'You are not the creator of this project.');
        }
        if (project.status !== 'Approved') {
            return handleResponse(res, 400, `Project must be in 'Approved' status to be finalized.`);
        }
        if (project.management_contract_address || project.token_contract_address) {
            return handleResponse(res, 400, 'Project contracts have already been recorded.');
        }

        const USDC_CONTRACT_ADDRESS  = await configModel.getConfigValue('USDC_CONTRACT_ADDRESS');
        const updatedProject = await projectModel.updateProject(projectId, {
            token_contract_address: tokenContractAddress,
            management_contract_address: managementContractAddress,
            usdc_contract_address: USDC_CONTRACT_ADDRESS,
            project_status: 'Funding'
        });
        handleResponse(res, 200, 'Project deployment finalized and status updated to Funding.', updatedProject);

    } catch (error) {
        console.error('Finalize Deployment Error:', error);
        handleResponse(res, 500, 'Server error during deployment finalization.', error.message);
    }
};
