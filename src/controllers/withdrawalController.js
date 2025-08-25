import { handleResponse } from '../utils/responseHandler.js';
import projectModel from '../models/projectModel.js';
import withdrawalModel from '../models/withdrawalModel.js';
import { ethers } from 'ethers';
import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectManagementArtifactPath = path.resolve(__dirname, '../../artifacts/contracts/ProjectManagement.sol/ProjectManagement.json');
const ProjectManagement = JSON.parse(fs.readFileSync(projectManagementArtifactPath, 'utf8'));
const erc20ArtifactPath = path.resolve(__dirname, '../../artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json');
const IERC20 = JSON.parse(fs.readFileSync(erc20ArtifactPath, 'utf8'));

// @desc    Prepare for a project fund withdrawal by verifying on-chain conditions.
// @route   GET /api/withdrawals/
export const getWithdrawal = async (req, res) => {
    const { projectId } = req.query;
    const creatorId = req.user.id;

    try {
        const project = await projectModel.getProjectById(projectId);
        if (!project) {
            return handleResponse(res, 404, 'Project not found.');
        }
        if (project.creator_id !== creatorId) {
            return handleResponse(res, 403, 'You are not authorized to withdraw funds for this project.');
        }

        const provider = new ethers.JsonRpcProvider(process.env.network_rpc_url);
        const managementContract = new ethers.Contract(project.management_contract_address, ProjectManagement.abi, provider);
        const usdcContract = new ethers.Contract(process.env.USDC_CONTRACT_ADDRESS, IERC20.abi, provider);

        const currentState = await managementContract.currentState();
        if (currentState !== 3) { // State.Active = 3
            return handleResponse(res, 400, 'Withdrawal is only possible when the project is in the "Active" state.');
        }

        const contractBalance = await usdcContract.balanceOf(project.management_contract_address);
        if (contractBalance === 0n) {
            return handleResponse(res, 400, 'There are no funds available for withdrawal.');
        }

        handleResponse(res, 200, 'Withdrawal conditions verified successfully.', {
            withdrawableAmount: ethers.formatUnits(contractBalance, 18),
            managementContractAddress: project.management_contract_address
        });

    } catch (error) {
        console.error('Prepare Withdrawal Error:', error);
        handleResponse(res, 500, 'Server error during withdrawal preparation.', { error: error.message });
    }
};

// @desc    Record a successful fund withdrawal in the database after on-chain verification.
// @route   POST /api/withdrawals/record
export const recordWithdrawal = async (req, res) => {
    const { projectId, transactionHash } = req.body;
    const creatorId = req.user.id;

    try {
        const existingWithdrawal = await withdrawalModel.getWithdrawalByTxHash(transactionHash);
        if (existingWithdrawal) {
            return handleResponse(res, 409, 'This withdrawal transaction has already been recorded.');
        }

        const project = await projectModel.getProjectById(projectId);
        if (!project) {
            return handleResponse(res, 404, 'Project not found.');
        }
        if (project.creator_id !== creatorId) {
            return handleResponse(res, 403, 'You are not authorized to record a withdrawal for this project.');
        }

        const provider = new ethers.JsonRpcProvider(process.env.network_rpc_url);
        const receipt = await provider.getTransactionReceipt(transactionHash);

        if (!receipt || !receipt.status) {
            return handleResponse(res, 400, 'Transaction failed or is not yet mined.');
        }

        const contractInterface = new ethers.Interface(ProjectManagement.abi);
        let decodedEvent;
        for (const log of receipt.logs) {
            if (log.address.toLowerCase() === project.management_contract_address.toLowerCase()) {
                try {
                    const parsedLog = contractInterface.parseLog(log);
                    if (parsedLog && parsedLog.name === 'FundsWithdrawn') {
                        decodedEvent = parsedLog;
                        break;
                    }
                } catch (e) {
                    // Ignore logs that don't match the ABI
                }
            }
        }
        if (!decodedEvent) {
            return handleResponse(res, 400, 'Could not find the FundsWithdrawn event in the transaction receipt.');
        }

        const { creatorAmount, platformFee } = decodedEvent.args;

        const newWithdrawal = await withdrawalModel.createWithdrawal({
            project_id: projectId,
            creator_id: creatorId,
            amount_withdrawn: creatorAmount.toString(),
            platform_fee: platformFee.toString(),
            transaction_hash: transactionHash
        });

        handleResponse(res, 201, 'Withdrawal recorded successfully.', newWithdrawal);

    } catch (error) {
        console.error('Record Withdrawal Error:', error);
        handleResponse(res, 500, 'Server error while recording withdrawal.', { error: error.message });
    }
};