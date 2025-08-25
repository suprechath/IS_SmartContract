import { handleResponse } from '../utils/responseHandler.js';
import projectModel from '../models/projectModel.js';
import investmentModel from '../models/investmentModel.js';
import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectManagementArtifactPath = path.resolve(__dirname, '../../artifacts/contracts/ProjectManagement.sol/ProjectManagement.json');
const ProjectManagement = JSON.parse(fs.readFileSync(projectManagementArtifactPath, 'utf8'));

// @desc    Prepare for a refund by checking project status and contribution
// @route   GET /api/refunds/
export const getRefund = async (req, res) => {
    const { projectId } = req.query;
    const { wallet_address } = req.user;

    try {
        const project = await projectModel.getProjectById(projectId);
        if (!project) {
            return handleResponse(res, 404, 'Project not found.');
        }

        const provider = new ethers.JsonRpcProvider(process.env.network_rpc_url);
        const contract = new ethers.Contract(project.management_contract_address, ProjectManagement.abi, provider);

        const currentState = await contract.currentState();
        const contribution = await contract.contributions(wallet_address);

        // Note: The enum State { Funding, Succeeded, Failed, Active } means Failed is state 2
        if (currentState.toString() !== '2') {
            return handleResponse(res, 400, 'Project is not in a failed state.');
        }

        if (contribution.isZero()) {
            return handleResponse(res, 400, 'You have no contribution to refund for this project.');
        }

        handleResponse(res, 200, 'Refund can be claimed.', {
            refundableAmount: ethers.formatUnits(contribution, 18)
        });

    } catch (error) {
        console.error('Prepare Refund Error:', error);
        handleResponse(res, 500, 'Server error during refund preparation.', error.message);
    }
};

// @desc    Record a successful refund
// @route   POST /api/refunds/record
export const recordRefund = async (req, res) => {
    const { projectId, amount, transactionHash } = req.body;
    const investorId = req.user.id;

    try {
        const existingInvestment = await investmentModel.getInvestmentByTxHash(transaction_hash);
            if (existingInvestment) {
                return handleResponse(res, 409, 'This transaction has already been recorded.');
            }

        // Record the refund as a negative investment
        const recordedRefund = await investmentModel.createInvestment({
            project_id: projectId,
            amount: amount,
            transaction_hash: transactionHash
        }, investorId);

        handleResponse(res, 201, 'Refund recorded successfully.', recordedRefund);
    } catch (error) {
        console.error('Record Refund Error:', error);
        handleResponse(res, 500, 'Server error while recording refund.', error.message);
    }
};