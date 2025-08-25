import { handleResponse } from '../utils/responseHandler.js';
import projectModel from '../models/projectModel.js';
import depositModel from '../models/depositModel.js';
import { ethers } from 'ethers';

// @desc    Prepare a reward deposit by validating project status and ownership
// @route   POST /api/deposits/
export const prepareDeposit = async (req, res) => {
    const { projectId, amount } = req.body;
    const creatorId = req.user.id;

    try {
        const project = await projectModel.getProjectById(projectId);

        if (!project) {
            return handleResponse(res, 404, 'Project not found.');
        }
        if (project.creator_id !== creatorId) {
            return handleResponse(res, 403, 'Not authorized to deposit rewards for this project.');
        }
        if (project.status !== 'Active') {
            return handleResponse(res, 400, `Project is not in 'Active' status. Current status: '${project.status}'.`);
        }

        handleResponse(res, 200, 'Reward deposit is valid for preparation.', {
            managementContractAddress: project.management_contract_address,
            usdcContractAddress: process.env.USDC_CONTRACT_ADDRESS,
            amountToDeposit: amount.toString()
        });

    } catch (error) {
        console.error('Prepare Deposit Error:', error);
        handleResponse(res, 500, 'Server error during deposit preparation.', { error: error.message });
    }
};

// @desc    Record a successful reward deposit in the database
// @route   POST /api/deposits/record
export const recordDeposit = async (req, res) => {
    const { projectId, amount, transactionHash } = req.body;
    const creatorId = req.user.id;

    try {
        // Prevent duplicate records
        const existingDeposit = await depositModel.getDepositByTxHash(transactionHash);
        if (existingDeposit) {
            return handleResponse(res, 409, 'This transaction has already been recorded.');
        }

        const newDeposit = await depositModel.createDeposit({
            project_id: projectId,
            amount,
            transaction_hash: transactionHash
        }, creatorId);

        handleResponse(res, 201, 'Reward deposit recorded successfully.', newDeposit);

    } catch (error) {
        console.error('Record Deposit Error:', error);
        handleResponse(res, 500, 'Server error while recording reward deposit.', { error: error.message });
    }
};