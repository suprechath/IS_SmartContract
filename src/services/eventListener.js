import { ethers } from 'ethers';
import dotenv from 'dotenv';
import investmentModel from '../models/investmentModel.js';
import projectModel from '../models/projectModel.js';
import userModel from '../models/userModel.js';

// import ProjectManagement from '../../artifacts/contracts/ProjectManagement.sol/ProjectManagement.json' assert { type: "json" };
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectManagementArtifactPath = path.resolve(__dirname, '../../artifacts/contracts/ProjectManagement.sol/ProjectManagement.json');
const ProjectManagement = JSON.parse(fs.readFileSync(projectManagementArtifactPath, 'utf8'));

dotenv.config();

const WSS_URL = process.env.network_wss_url;
const RECONNECT_DELAY = 5000; // 5 seconds
const POLLING_INTERVAL = 30000; // 30 seconds
const HEALTH_CHECK_INTERVAL = 15000; // 15 seconds

let provider;
const monitoredContracts = new Set();
let projectPollingIntervalId;
let healthCheckIntervalId;

const stopServices = () => {
    console.log('Stopping all services...');
    if (projectPollingIntervalId) clearInterval(projectPollingIntervalId);
    if (healthCheckIntervalId) clearInterval(healthCheckIntervalId);
    if (provider) {
        provider.removeAllListeners();
    }
};

const findAndAttachToNewProjects = async () => {
    console.log('🔍 Checking for new projects to monitor...');
    try {
        const fundingProjects = await projectModel.getProjectsByStatus(['Funding']);

        fundingProjects.forEach(project => {
            const contractAddress = project.management_contract_address;
            if (contractAddress && !monitoredContracts.has(contractAddress)) {
                monitoredContracts.add(contractAddress);
                const contract = new ethers.Contract(contractAddress, ProjectManagement.abi, provider);
                console.log(`➕ Adding new listener for project: ${project.title} (${contractAddress})`);

                contract.on('Invested', async (investor, amount, event) => {
                    const transaction_hash = event.log.transactionHash;
                    console.log(`
                    ✅ ---- Event Received: Invested ----
                       - Project: ${project.title}
                       - Investor: ${investor}
                       - Amount: ${ethers.formatEther(amount)} USDC
                       - Tx Hash: ${transaction_hash}
                    `);
                    try {
                        const existing = await investmentModel.getInvestmentByTxHash(transaction_hash);
                        if (existing) {
                            console.log(`[INFO] Tx ${transaction_hash} already recorded. Skipping.`);
                            return;
                        }
                        const user = await userModel.getUserByWalletAddress(investor);
                        if (!user) {
                            console.error(`[ERROR] Investor ${investor} not found in DB.`);
                            return;
                        }
                        const investmentData = {
                            project_id: project.id,
                            amount: amount.toString(),
                            transaction_hash
                        };
                        await investmentModel.createInvestment(investmentData, user.id);
                        console.log(`[SUCCESS] Investment for ${investor} recorded in DB.`);
                    } catch (dbError) {
                        console.error(`[DB_ERROR] Failed to record tx ${transaction_hash}:`, dbError);
                    }
                });
            }
        });
    } catch (error) {
        console.error('Error during project polling:', error.message);
    }
};

const start = () => {
    console.log('Attempting to connect and start services...');
    provider = new ethers.WebSocketProvider(WSS_URL);
    monitoredContracts.clear();

    findAndAttachToNewProjects();
    projectPollingIntervalId = setInterval(findAndAttachToNewProjects, POLLING_INTERVAL);

    healthCheckIntervalId = setInterval(async () => {
        try {
            const blockNumber = await provider.getBlockNumber();
            console.log(`💓 Health check OK. Current block: ${blockNumber}`);
        } catch (error) {
            console.error('❗️ Health check failed. Reconnecting...');
            stopServices();
            setTimeout(start, RECONNECT_DELAY);
        }
    }, HEALTH_CHECK_INTERVAL);

    provider.on('error', (err) => {
        console.error('A low-level provider error occurred:', err.message);
    });
};

start();
