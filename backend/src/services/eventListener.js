import { ethers } from 'ethers';
import dotenv from 'dotenv';
dotenv.config();
import projectModel from '../models/projectModel.js';
import userModel from '../models/userModel.js';
import transactionModel from '../models/transactionModel.js';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectManagementArtifactPath = path.resolve(__dirname, '../../../contracts/artifacts/contracts/ProjectManagement.sol/ProjectManagement.json');
const ProjectManagement = JSON.parse(fs.readFileSync(projectManagementArtifactPath, 'utf8'));
const projectTokenArtifactPath = path.resolve(__dirname, '../../../contracts/artifacts/contracts/ProjectToken.sol/ProjectToken.json');
const ProjectToken = JSON.parse(fs.readFileSync(projectTokenArtifactPath, 'utf8'));

const WSS_URL = process.env.network_wss_url;
const RECONNECT_DELAY = 5000; // 5 seconds
const POLLING_INTERVAL = 15000; // 15 seconds for checking for new projects
const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds for checking websocket health

let provider;
const monitoredContracts = new Map(); 
let pollingIntervalId;
let healthCheckIntervalId;

async function handleInvestment(projectId, investorAddress, amount, event) {
    const transactionHash = event.log.transactionHash;
    console.log(`
    ✅ ---- Event Received: Invested ----
       - Project ID: ${projectId}
       - Investor: ${investorAddress}
       - Amount: ${ethers.formatUnits(amount, 6)} USDC
       - Tx Hash: ${transactionHash}
    `);

    try {
        const existingTx = await transactionModel.getTransactionByTxHash(transactionHash);
        if (existingTx) {
            console.log(`[INFO] Transaction ${transactionHash} already recorded. Skipping.`);
            return;
        }
        const user = await userModel.getUserByWalletAddress(investorAddress);
        if (!user) {
            console.error(`[ERROR] Investor ${investorAddress} not found in the database.`);
            return;
        }
        const txData = {
            project_onchain_id: projectId,
            USDC_amount: amount.toString(),
            transaction_type: 'Investment',
            transaction_hash: transactionHash,
        };

        await transactionModel.createTransaction(txData, user.id);
        console.log(`[SUCCESS] Investment from ${investorAddress} for project ${projectId} recorded.`);

        const project = await projectModel.getOnchainProjectById(projectId);
        const newTotal = BigInt(project.total_contributions || 0) + BigInt(amount);
        // console.log('amount:', amount);
        // console.log('newTotal:', newTotal);
        await projectModel.updateProject(projectId, { total_contributions: newTotal.toString() }, {});
        console.log(`[SUCCESS] Project ${projectId} total contributions updated.`);
        // const mgmtContract = new ethers.Contract(project.management_contract_address, ProjectManagement.abi, provider);
        // console.log(`[INFO] Onchain total contribution: ${await mgmtContract.totalContributions()}`);

        const fundingGoal = BigInt(ethers.parseUnits(project.funding_usdc_goal, 6));
        // console.log('fundingGoal:', fundingGoal);
        if (newTotal >= fundingGoal) {
            console.log(`[INFO] Funding goal for project ${projectId} has been met.`);
            // console.log(`[INFO] Onchain project status: ${await mgmtContract.currentState()}`);
            await projectModel.updateProject(projectId, { project_status: 'Succeeded' }, {});
            console.log(`[SUCCESS] Project ${projectId} status updated to 'Succeeded'.`);
        }
    } catch (dbError) {
        console.error(`[DB_ERROR] Failed to process 'Invested' event for tx ${transactionHash}:`, dbError);
    }
}

async function handleTokenMinted(projectId, from, to, amount, event) {
    if (from !== ethers.ZeroAddress) {
        return; // focus on mint events only
    }

    const transactionHash = event.log.transactionHash;
    console.log(`
    ✅ ---- Event Received: Token Minted (Transfer from 0x0) ----
       - Project ID: ${projectId}
       - Recipient: ${to}
       - Amount: ${ethers.formatUnits(amount, 6)} tokens
       - Tx Hash: ${transactionHash}
    `);

    try {
        const project = await projectModel.getOnchainProjectById(projectId);
        if (!project) {
            console.error(`[ERROR] Project with ID ${projectId} not found for mint event.`);
            return;
        }
        const currentMintedSupply = BigInt(project.token_total_supply || 0);
        const newMintedSupply = currentMintedSupply + BigInt(amount.toString());

        await projectModel.updateProject(projectId, {
            token_total_supply: newMintedSupply.toString()
        }, {});

        console.log(`[SUCCESS] Project ${projectId} total minted supply updated to: ${ethers.formatUnits(newMintedSupply.toString(), 6)}`);
    } catch (dbError) {
        console.error(`[DB_ERROR] Failed to update minted supply for project ${projectId}:`, dbError);
    }
}

async function handleAllTokensMinted(projectId, totalAmount, event) {
    console.log(`
    ✅ ---- Event Received: All TokensMinted ----
       - Project ID: ${projectId}
       - Total Supply: ${ethers.formatUnits(totalAmount, 6)} tokens
       - Tx Hash: ${event.log.transactionHash}
    `);
    try {
        const project = await projectModel.getOnchainProjectById(projectId);
        const mgmtContract = new ethers.Contract(project.management_contract_address, ProjectManagement.abi, provider);
        console.log(`[INFO] Onchain project status: ${await mgmtContract.currentState()}`);

        await projectModel.updateProject(projectId, {
            project_status: 'Active',
            tokens_minted: true,
            token_total_supply: totalAmount.toString()
        }, {});
        console.log(`[SUCCESS] Project ${projectId} status updated to 'Active' and final token supply recorded.`);
    } catch (dbError) {
        console.error(`[DB_ERROR] Failed to update project status for ${projectId}:`, dbError);
    }
}

async function handleFundsWithdrawn(projectId, creatorAmount, platformFee, event) {
    const transactionHash = event.log.transactionHash;
    console.log(`
    ✅ ---- Event Received: FundsWithdrawn ----
       - Project ID: ${projectId}
       - Creator Amount: ${ethers.formatUnits(creatorAmount, 6)} USDC
       - Platform Fee: ${ethers.formatUnits(platformFee, 6)} USDC
       - Tx Hash: ${transactionHash}
    `);
    try {
        const project = await projectModel.getOnchainProjectById(projectId);
        if (!project) {
            console.error(`[ERROR] Project ${projectId} not found for withdrawal event.`);
            return;
        }

        const txData = {
            project_onchain_id: projectId,
            USDC_amount: creatorAmount.toString(),
            transaction_type: 'Withdrawal',
            transaction_hash: transactionHash,
            platform_fee: platformFee.toString()
        };

        await transactionModel.createTransaction(txData, project.user_onchain_id);
        console.log(`[SUCCESS] Withdrawal for project ${projectId} recorded.`);
    } catch (dbError) {
        console.error(`[DB_ERROR] Failed to record 'FundsWithdrawn' event for tx ${transactionHash}:`, dbError);
    }
}

async function handleRewardDeposited(projectId, totalAmount, platformFee, event) {
    const transactionHash = event.log.transactionHash;
    console.log(`
    ✅ ---- Event Received: RewardDeposited ----
       - Project ID: ${projectId}
       - Net Reward Amount: ${ethers.formatUnits(totalAmount, 6)} USDC
       - Platform Fee: ${ethers.formatUnits(platformFee, 6)} USDC
       - Tx Hash: ${transactionHash}
    `);
    try {
        const project = await projectModel.getOnchainProjectById(projectId);
        if (!project) {
            console.error(`[ERROR] Project ${projectId} not found for reward deposit event.`);
            return;
        }
        const txData = {
            project_onchain_id: projectId,
            USDC_amount: totalAmount.toString(),
            transaction_type: 'RewardDeposit',
            transaction_hash: transactionHash,
            platform_fee: platformFee.toString()
        };
        await transactionModel.createTransaction(txData, project.user_onchain_id);
        console.log(`[SUCCESS] Reward deposit for project ${projectId} recorded.`);
    } catch (dbError) {
        console.error(`[DB_ERROR] Failed to record 'RewardDeposited' event for tx ${transactionHash}:`, dbError);
    }
}

async function handleRewardClaimed(projectId, investorAddress, amount, event) {
    const transactionHash = event.log.transactionHash;
    console.log(`
    ✅ ---- Event Received: RewardClaimed ----
       - Project ID: ${projectId}
       - Investor: ${investorAddress}
       - Amount Claimed: ${ethers.formatUnits(amount, 6)} USDC
       - Tx Hash: ${transactionHash}
    `);
    try {
        const user = await userModel.getUserByWalletAddress(investorAddress);
        if (!user) {
            console.error(`[ERROR] Investor ${investorAddress} not found for reward claim.`);
            return;
        }
        const txData = {
            project_onchain_id: projectId,
            USDC_amount: amount.toString(),
            transaction_type: 'RewardClaim',
            transaction_hash: transactionHash,
        };
        await transactionModel.createTransaction(txData, user.id);
        console.log(`[SUCCESS] Reward claim for project ${projectId} by ${investorAddress} recorded.`);
    } catch (dbError) {
        console.error(`[DB_ERROR] Failed to record 'RewardClaimed' event for tx ${transactionHash}:`, dbError);
    }
}

async function handleRefund(projectId, investorAddress, amount, event) {
    const transactionHash = event.log.transactionHash;
    console.log(`
    ✅ ---- Event Received: Refunded ----
       - Project ID: ${projectId}
       - Investor: ${investorAddress}
       - Amount Refunded: ${ethers.formatUnits(amount, 6)} USDC
       - Tx Hash: ${transactionHash}
    `);
    try {
        const user = await userModel.getUserByWalletAddress(investorAddress);
        if (!user) {
            console.error(`[ERROR] Investor ${investorAddress} not found for refund.`);
            return;
        }
        const txData = {
            project_onchain_id: projectId,
            USDC_amount: amount.toString(),
            transaction_type: 'Refund',
            transaction_hash: transactionHash,
        };
        await transactionModel.createTransaction(txData, user.id);
        console.log(`[SUCCESS] Refund for project ${projectId} to ${investorAddress} recorded.`);
    } catch (dbError) {
        console.error(`[DB_ERROR] Failed to record 'Refunded' event for tx ${transactionHash}:`, dbError);
    }
}

// --- Main Service Logic ---

const attachListenersToContract = async (project) => {
    const mgmtContractAddress = project.management_contract_address;
    const tokenContractAddress = project.token_contract_address;

    if (!mgmtContractAddress || !tokenContractAddress) {
        return;
    }

    if (!monitoredContracts.has(mgmtContractAddress)) {
        // backfill
        console.log(`➕ Discovered new project to monitor: ${project.title} (${mgmtContractAddress})`);
        const mgmtContract = new ethers.Contract(mgmtContractAddress, ProjectManagement.abi, provider);
        const currentBlock = await provider.getBlockNumber();
        // A block is ~2 seconds on Optimism, so 43200 blocks is ~24 hours.
        const fromBlock = currentBlock - 43200 > 0 ? currentBlock - 43200 : 0;
        console.log(`[Backfill] Querying past 'Invested' events for ${project.title} from block ${fromBlock} to ${currentBlock}`);
        const pastInvestedEvents = await mgmtContract.queryFilter('Invested', fromBlock, 'latest');
        for (const event of pastInvestedEvents) {
            const [investor, amount] = event.args;
            await handleInvestment(project.id, investor, amount, { log: event });
        }
        console.log(`[Backfill] Finished processing ${pastInvestedEvents.length} past 'Invested' events.`)

        // const mgmtContract = new ethers.Contract(mgmtContractAddress, ProjectManagement.abi, provider);
        monitoredContracts.set(mgmtContractAddress, { contract: mgmtContract, project });
        console.log(`➕ Attaching Management listeners for project: ${project.title} (${mgmtContractAddress})`);
        mgmtContract.on('Invested', (investor, amount, event) => handleInvestment(project.id, investor, amount, event));
        mgmtContract.on('TokensMinted', (totalAmount, event) => handleAllTokensMinted(project.id, totalAmount, event));
        mgmtContract.on('FundsWithdrawn', (creatorAmount, platformFee, event) => handleFundsWithdrawn(project.id, creatorAmount, platformFee, event));
        mgmtContract.on('RewardDeposited', (totalAmount, platformFee, event) => handleRewardDeposited(project.id, totalAmount, platformFee, event));
        mgmtContract.on('RewardClaimed', (investor, amount, event) => handleRewardClaimed(project.id, investor, amount, event));
        mgmtContract.on('Refunded', (investor, amount, event) => handleRefund(project.id, investor, amount, event));
    }

    if (!monitoredContracts.has(tokenContractAddress)) {
        const tokenContract = new ethers.Contract(tokenContractAddress, ProjectToken.abi, provider);
        monitoredContracts.set(tokenContractAddress, { contract: tokenContract, project });
        console.log(`➕ Attaching Token listeners for project: ${project.title} (${tokenContractAddress})`);
        tokenContract.on('Transfer', (from, to, amount, event) => handleTokenMinted(project.id, from, to, amount, event));
    }
};

const findAndAttachToNewProjects = async () => {
    console.log('🔍 Checking for new and active projects to monitor...');
    try {
        const projectsToMonitor = await projectModel.getProjectsByStatus(['Funding', 'Succeeded', 'Active']);
        projectsToMonitor.forEach(attachListenersToContract);
    } catch (error) {
        console.error('Error during project polling:', error.message);
    }
};

const stopServices = () => {
    console.log('Stopping all listeners and intervals...');
    if (pollingIntervalId) clearInterval(pollingIntervalId);
    if (healthCheckIntervalId) clearInterval(healthCheckIntervalId);
    if (provider) {
        provider.removeAllListeners();
        monitoredContracts.forEach(({ contract }) => contract.removeAllListeners());
        monitoredContracts.clear();
        provider.destroy();
    }
};

const start = () => {
    console.log(`Attempting to connect to WebSocket provider at ${WSS_URL}...`);
    try {
        provider = new ethers.WebSocketProvider(WSS_URL);
        console.log('✅ WebSocket connection process initiated.');
        monitoredContracts.clear();

        findAndAttachToNewProjects();
        pollingIntervalId = setInterval(findAndAttachToNewProjects, POLLING_INTERVAL);

        healthCheckIntervalId = setInterval(async () => {
            try {
                const blockNumber = await provider.getBlockNumber();
                console.log(`💓 Health check OK. Current block: ${blockNumber}`);
            } catch (error) {
                console.error('❗️ Health check failed, attempting to reconnect...');
                if (provider.destroy) {
                    provider.destroy();
                }
            }
        }, HEALTH_CHECK_INTERVAL);

        provider.on('error', (err) => {
            console.error('A WebSocket provider error occurred:', err.message);
        });

    } catch (connError) {
        console.error('Initial connection failed:', connError.message);
        console.log(`Retrying in ${RECONNECT_DELAY / 1000}s...`);
        setTimeout(start, RECONNECT_DELAY);
    };
};

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully.');
    stopServices();
    process.exit(0);
});
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully.');
    stopServices();
    process.exit(0);
});

start();