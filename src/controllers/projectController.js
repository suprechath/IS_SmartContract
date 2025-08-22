import projectModel from '../models/projectModel.js';
import userModel from '../models/userModel.js';
import { handleResponse } from '../utils/responseHandler.js';
import { ethers } from 'ethers';
import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectTokenArtifactPath = path.resolve(__dirname, '../../artifacts/contracts/ProjectToken.sol/ProjectToken.json');
const projectManagementArtifactPath = path.resolve(__dirname, '../../artifacts/contracts/ProjectManagement.sol/ProjectManagement.json');
const ProjectToken = JSON.parse(fs.readFileSync(projectTokenArtifactPath, 'utf8'));
const ProjectManagement = JSON.parse(fs.readFileSync(projectManagementArtifactPath, 'utf8'));




// @desc    Create a new project
// @route   POST /api/projects
export const createProject = async (req, res) => {
    try {
        const newProject = await projectModel.createProject(req.body, req.user.id);
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
    let requestedStatuses = req.query.status; //http://localhost:5001/api/projects?status=Succeeded || http://localhost:5001/api/projects?status=Funding&status=Active
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
        // Here you would add the logic to fetch on-chain data and combine it
        handleResponse(res, 200, 'Projects retrieved successfully', projects);
    } catch (error) {
        console.error('Get Projects Error:', error);
        handleResponse(res, 500, 'Server error while retrieving projects.', error.message);
    }
};

// @desc    Get a single project by ID
// @route   GET /api/projects/:projectId
export const getProjectById = async (req, res) => {
    try {
        const project = await projectModel.getProjectById(req.params.projectId);
        if (!project) {
            return handleResponse(res, 404, 'Project not found.');
        }
        // Here you would also add on-chain data fetching
        handleResponse(res, 200, 'Project retrieved successfully', project);
    } catch (error) {
        console.error('Get Project By ID Error:', error);
        handleResponse(res, 500, 'Server error while retrieving the project.', error.message);
    }
};

// @desc    Get projects for the logged-in user
// @route   GET /api/users/me/projects
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
// @route   PATCH /api/projects/:projectId
export const updateProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const project = await projectModel.getProjectById(projectId);

        if (!project) {
            return handleResponse(res, 404, 'Project not found.');
        }

        if (project.creator_id !== req.user.id) {
            return handleResponse(res, 403, 'Not authorized to update this project.');
        }

        if (project.status !== 'Pending') {
            return handleResponse(res, 400, `Project cannot be updated. It is in '${project.status}' status.`);
        }
        
        const updatedProject = await projectModel.updateProject(projectId, req.body);
        handleResponse(res, 200, 'Project updated successfully', updatedProject);

    } catch (error) {
        console.error('Update Project Error:', error);
        handleResponse(res, 500, 'Server error during project update.', error.message);
    }
};

// GET /api/projects/deploy/projectTokenPrep
export const prepareProjectTokenDeployment  = async (req, res) => {
    const { projectId } = req.body;
    try {
        const project = await projectModel.getProjectById(projectId);

        if (!project) {
            return handleResponse(res, 404, 'Project not found.');
        }
        if (project.creator_id !== req.user.id) {
            return handleResponse(res, 403, 'Not authorized to deploy this project.');
        }
        if (project.status !== 'Approved') {
            return handleResponse(res, 400, `Project must be in 'Approved' status to be deployed.`);
        }
        if (project.management_contract_address || project.token_contract_address) {
            return handleResponse(res, 400, 'Project contracts have already been deployed.');
        }

        const tokenFactory = new ethers.ContractFactory(ProjectToken.abi, ProjectToken.bytecode);
        const tokenUnsignedTx = await tokenFactory.getDeployTransaction(
            project.title,
            project.id.substring(0, 4).toUpperCase(),// can get from payload
            project.funding_goal,
        );

        handleResponse(res, 200, 'Deployment transaction prepared successfully.', {
            tokenDeployment: tokenUnsignedTx
        });

    } catch (error) {
        console.error('Project Deployment Preparation Error:', error);
        handleResponse(res, 500, 'Server error during deployment preparation.', error.message);
    }
/**
Use ethers.js to send this transaction:
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const tx = await signer.sendTransaction(response.data.tokenDeployment);
const receipt = await tx.wait();
const tokenContractAddress = receipt.contractAddress;
*/
};

//GET /api/projects/deploy/projectMgmtPrep
export const prepareProjectMgmtDeployment = async (req, res) => {
    const { projectId } = req.body;
    const { tokenContractAddress } = req.body;

    try {
        const project = await projectModel.getProjectById(projectId);
        const creator = await userModel.getUserById(project.creator_id);

        if (!project || !creator) {
            return handleResponse(res, 404, 'Project or creator not found.');
        }
        if (project.creator_id !== req.user.id) {
            return handleResponse(res, 403, 'You are not the creator of this project.');
        }
        if (project.status !== 'Approved') {
            return handleResponse(res, 400, `Project must be in 'Approved' status to be deployed.`);
        }

        const platformOwner = process.env.platformOperatorAddress;
        
        const managementFactory = new ethers.ContractFactory(ProjectManagement.abi, ProjectManagement.bytecode);
        const managementUnsignedTx = await managementFactory.getDeployTransaction(
            creator.wallet_address,
            project.funding_goal,
            project.funding_duration*24*60, //day to seconds
            tokenContractAddress,
            process.env.USDC_CONTRACT_ADDRESS, // Make sure this is in your .env file
            platformOwner,
            project.platform_fee_percentage,
            project.reward_fee_percentage
        );

        handleResponse(res, 200, 'Management contract deployment prepared successfully.', {
            managementDeployment: managementUnsignedTx
        });

    } catch (error) {
        console.error('Prepare Management Deployment Error:', error);
        handleResponse(res, 500, 'Server error during management deployment preparation.', error.message);
    }
};

//GET /api/projects/deploy/onboard
export const onboard = async (req, res) => {
    const { projectId } = req.body;
    const { tokenContractAddress, managementContractAddress } = req.body;

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

        const updatedProject = await projectModel.updateProject(projectId, {
            token_contract_address: tokenContractAddress,
            management_contract_address: managementContractAddress,
            status: 'Funding'
        });

        handleResponse(res, 200, 'Project deployment finalized and status updated to Funding.', updatedProject);

    } catch (error) {
        console.error('Finalize Deployment Error:', error);
        handleResponse(res, 500, 'Server error during deployment finalization.', error.message);
    }
};
