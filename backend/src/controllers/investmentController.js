import { handleResponse } from '../utils/responseHandler.js';
import projectModel from '../models/projectModel.js';
import { ethers } from 'ethers';
import configModel from '../models/configModel.js';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectManagementArtifactPath = path.resolve(__dirname, '../../../contracts/artifacts/contracts/ProjectManagement.sol/ProjectManagement.json');
const ProjectManagement = JSON.parse(fs.readFileSync(projectManagementArtifactPath, 'utf8'));

// @desc    Prepare an investment by validating it against the smart contract
// @route   POST /api/investments/check
export const investmentCheck = async (req, res) => {
    const { projectId, amount } = req.body;
    const investorId = req.user.id;

    try {
        const project = await projectModel.getOnchainProjectById(projectId);
        if (!project) {
            return handleResponse(res, 404, 'Project not found.');
        }
        if (project.project_status !== 'Funding') {
            return handleResponse(res, 400, `Project is not in 'Funding' status. Current status: '${project.project_status}'.`);
        }

        const provider = new ethers.JsonRpcProvider(process.env.network_rpc_url);
        const contract = new ethers.Contract(project.management_contract_address, ProjectManagement.abi, provider);

        const deadline = await contract.deadline();
        if (Date.now() / 1000 > deadline) {
            await projectModel.updateProject(projectId, { project_status: 'Failed' },{});
            return handleResponse(res, 400, 'The funding deadline for this project has passed.');
        }

        const totalContributions = await contract.totalContributions();
        const fundingGoal = await contract.fundingGoal();
        const amountInWei = ethers.parseUnits(amount.toString(), 6);
        const remainingGoal = fundingGoal - totalContributions;
        // console.log('remainingGoal:', ethers.formatUnits(remainingGoal, 6));
        if (amountInWei + totalContributions > fundingGoal) {
            return handleResponse(res, 400, 'Investment amount exceeds the remaining funding goal., The maximum you can invest is ' + ethers.formatUnits(remainingGoal, 6) + ' tokens.');
        }
        const USDC_CONTRACT_ADDRESS  = await configModel.getConfigValue('MOCK_USDC_CONTRACT_ADDRESS');
        // console.log('USDC_CONTRACT_ADDRESS:', USDC_CONTRACT_ADDRESS);
        // console.log('amount', amountInWei);

        const unsignedTx = await contract.invest.populateTransaction(amountInWei);
        handleResponse(res, 200, 'Investment is valid and unsigned transaction is provided.', {
            unsignedTx,
            management_contract_address: project.management_contract_address,
            usdc_address: USDC_CONTRACT_ADDRESS,
            amount: amount.toString()
        });

        // handleResponse(res, 200, 'Investment is valid.', {
        //     management_contract_address: project.management_contract_address,
        //     usdc_address: USDC_CONTRACT_ADDRESS,
        //     amount: amount.toString()
        // });

    } catch (error) {
        console.error('Prepare Investment Error:', error);
        handleResponse(res, 500, 'Server error during investment preparation.', error.message);
    }
};