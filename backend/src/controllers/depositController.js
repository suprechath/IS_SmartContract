import { handleResponse } from '../utils/responseHandler.js';
import projectModel from '../models/projectModel.js';
import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectManagementArtifactPath = path.resolve(__dirname, '../../../contracts/artifacts/contracts/ProjectManagement.sol/ProjectManagement.json');
const ProjectManagement = JSON.parse(fs.readFileSync(projectManagementArtifactPath, 'utf8'));

// @desc    Prepare a reward deposit by validating project status and ownership
// @route   POST /api/deposits/
export const prepareDeposit = async (req, res) => {
    const { projectId, amount } = req.body;
    const creatorId = req.user.id;
    try {
        const project = await projectModel.getOnchainProjectById(projectId);
        if (!project) {
            return handleResponse(res, 404, 'Project not found.');
        }
        if (project.user_onchain_id !== creatorId) {
            return handleResponse(res, 403, 'You are not authorized to deposit rewards for this project.');
        }
        if (project.project_status !== 'Active') {
            return handleResponse(res, 400, `Project is not in 'Active' status. Current status: '${project.project_status}'.`);
        }

        const provider = new ethers.JsonRpcProvider(process.env.network_rpc_url);
        const contract = new ethers.Contract(project.management_contract_address, ProjectManagement.abi, provider);
        const amountInWei = ethers.parseUnits(amount.toString(), 'ether');
        const unsignedTx = await contract.depositReward.populateTransaction(amountInWei);
        handleResponse(res, 200, 'Reward deposit transaction prepared successfully.', {
            unsignedTx,
            usdcContractAddress: project.usdc_contract_address,
            managementContractAddress: project.management_contract_address,
            amountToApprove: amountInWei.toString()
        });

    } catch (error) {
        console.error('Prepare Deposit Error:', error);
        handleResponse(res, 500, 'Server error during deposit preparation.', { error: error.message });
    }
};