import { handleResponse } from '../utils/responseHandler.js';
import projectModel from '../models/projectModel.js';
import rewardsModel from '../models/rewardsModel.js';
import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectManagementArtifactPath = path.resolve(__dirname, '../../artifacts/contracts/ProjectManagement.sol/ProjectManagement.json');
const ProjectManagement = JSON.parse(fs.readFileSync(projectManagementArtifactPath, 'utf8'));

// @desc    Prepare a reward claim by getting the claimable amount
// @route   GET /api/rewards/
export const getRewards = async (req, res) => {
    const { projectId } = req.query;
    const { wallet_address } = req.user;

    try {
        const project = await projectModel.getProjectById(projectId);
        if (!project) {
            return handleResponse(res, 404, 'Project not found.');
        }
        if (project.status !== 'Active') {
            return handleResponse(res, 400, `Project is not in 'Active' status. Current status: '${project.status}'.`);
        }

        const provider = new ethers.JsonRpcProvider(process.env.network_rpc_url);
        const contract = new ethers.Contract(project.management_contract_address, ProjectManagement.abi, provider);

        const earnedAmount = await contract.earned(wallet_address);
        const claimableAmount = ethers.formatUnits(earnedAmount, 18); // Assuming USDC has 18 decimals

        handleResponse(res, 200, 'Claimable reward amount retrieved successfully.', {
            claimableAmount
        });

    } catch (error) {
        console.error('Prepare Claim Error:', error);
        handleResponse(res, 500, 'Server error during reward claim preparation.', error.message);
    }
};

// @desc    Record a successful reward claim
// @route   POST /api/rewards/record
export const recordRewards = async (req, res) => {
    const { projectId, amount, transactionHash } = req.body;
    const investorId = req.user.id;

    try {
        const existingClaim = await rewardsModel.getRewardsByTxHash(transactionHash);
        if (existingClaim) {
            return handleResponse(res, 409, 'This transaction has already been recorded.');
        }
        const newClaim = await rewardsModel.createRewardClaim({
            investor_id: investorId,
            project_id: projectId,
            amount,
            transaction_hash: transactionHash
        });
        handleResponse(res, 201, 'Reward claim recorded successfully.', newClaim);
    } catch (error) {
        console.error('Record Claim Error:', error);
        handleResponse(res, 500, 'Server error while recording reward claim.', error.message);
    }
};