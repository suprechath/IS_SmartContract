import { handleResponse } from '../utils/responseHandler.js';
import projectModel from '../models/projectModel.js';
import investmentModel from '../models/investmentModel.js';
import { ethers } from 'ethers';
import ProjectManagement from '../../../IS_SmartContract-cfb1447989257827e137bcf9c0e3f1952b02b8d6/artifacts/contracts/ProjectManagement.sol/ProjectManagement.json' assert { type: "json" };

// @desc    Prepare an investment by validating it against the smart contract
// @route   POST /api/investments/prepare
export const prepareInvestment = async (req, res) => {
    const { projectId, amount } = req.body;
    const investorId = req.user.id;

    try {
        const project = await projectModel.getProjectById(projectId);
        if (!project) {
            return handleResponse(res, 404, 'Project not found.');
        }
        if (project.status !== 'Funding') {
            return handleResponse(res, 400, `Project is not in 'Funding' status. Current status: '${project.status}'.`);
        }

        const provider = new ethers.JsonRpcProvider(process.env.network_rpc_url);
        const contract = new ethers.Contract(project.management_contract_address, ProjectManagement.abi, provider);

        const deadline = await contract.deadline();
        if (Date.now() / 1000 > deadline) {
            await projectModel.updateProject(projectId, { status: 'Failed' });
            return handleResponse(res, 400, 'The funding deadline for this project has passed.');
        }

        const totalContributions = await contract.totalContributions();
        const fundingGoal = await contract.fundingGoal();
        const amountInWei = ethers.parseUnits(amount.toString(), 18);
        const remainingGoal = fundingGoal - totalContributions;
        if (amountInWei + totalContributions > fundingGoal) {
            return handleResponse(res, 400, 'Investment amount exceeds the remaining funding goal., The maximum you can invest is ' + ethers.formatUnits(remainingGoal, 18) + ' tokens.');
        }

        handleResponse(res, 200, 'Investment is valid.', {
            management_contract_address: project.management_contract_address,
            usdc_address: process.env.USDC_CONTRACT_ADDRESS,
            amount: amount.toString()
        });

    } catch (error) {
        console.error('Prepare Investment Error:', error);
        handleResponse(res, 500, 'Server error during investment preparation.', error.message);
    }
};

// @desc    Record a successful investment in the database
// @route   POST /api/investments/record
export const recordInvestment = async (req, res) => {
    const { project_id, amount, transaction_hash } = req.body;
    const investor_id = req.user.id;

    try {
        const existingInvestment = await investmentModel.getInvestmentByTxHash(transaction_hash);
        if (existingInvestment) {
            return handleResponse(res, 409, 'This transaction has already been recorded.');
        }

        const newInvestment = await investmentModel.createInvestment({ project_id, amount, transaction_hash }, investor_id);
        handleResponse(res, 201, 'Investment recorded successfully.', newInvestment);

    } catch (error) {
        console.error('Record Investment Error:', error);
        handleResponse(res, 500, 'Server error while recording investment.', error.message);
    }
};