import { ethers } from 'ethers';
import dotenv from 'dotenv';
import projectModel from '../models/projectModel.js';
dotenv.config();

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectManagementArtifactPath = path.resolve(__dirname, '../../../contracts/artifacts/contracts/ProjectManagement.sol/ProjectManagement.json');
const ProjectManagement = JSON.parse(fs.readFileSync(projectManagementArtifactPath, 'utf8'));

const RPC_URL = process.env.network_rpc_url;
const KEEPER_PRIVATE_KEY = process.env.KEEPER_PRIVATE_KEY;
const POLLING_INTERVAL = 60000; // Check every 60 seconds

if (!KEEPER_PRIVATE_KEY) {
    console.error("❌ KEEPER_PRIVATE_KEY is not set in the .env file. The keeper service cannot start.");
    process.exit(1);
}

const provider = new ethers.JsonRpcProvider(RPC_URL);
const keeperWallet = new ethers.Wallet(KEEPER_PRIVATE_KEY, provider);

console.log(`✅ Keeper service initialized. Using wallet: ${keeperWallet.address}`);

async function checkAndProcessFailedCampaigns() {
    console.log("🔍 Checking for expired funding campaigns...");
    try {
        const projectsInFunding = await projectModel.getProjectsByStatus(['Funding']);
        console.log(`  - Found ${projectsInFunding.length} project(s) in 'Funding' status.`);
        const now = Math.floor(Date.now() / 1000);
        console.log(`  - Current timestamp: ${now} (${new Date(now * 1000).toISOString()})`);

        for (const project of projectsInFunding) {
            if (!project.management_contract_address) {
                console.log(`- Skipping project "${project.title}" (ID: ${project.id}) as it has no contract address.`);
                continue;
            }
            try {
                const contract = new ethers.Contract(project.management_contract_address, ProjectManagement.abi, provider);
                const deadline = await contract.deadline();
                const currentState = await contract.currentState();
                console.log(`- Project "${project.title}" (ID: ${project.id}) has deadline at ${deadline}. Current time is ${now}.`);
                console.log(`  - Current state on-chain: ${currentState}`);
                if (now > deadline && currentState == '0') {
                    console.log(`  - Project "${project.title}" (ID: ${project.id}) has passed its deadline.`);
                    const totalContributions = await contract.totalContributions();
                    // const fundingGoal = BigInt(ethers.parseUnits(project.funding_usdc_goal.tostring(), 18));
                    const fundingGoal = await contract.fundingGoal();
                    if (totalContributions < fundingGoal) {
                        console.log(`  - Funding goal not met (${ethers.formatEther(totalContributions)} / ${ethers.formatEther(fundingGoal)}). Calling checkCampaignFailed()...`);
                        const connectedContract = contract.connect(keeperWallet);
                        const tx = await connectedContract.checkCampaignFailed();
                        console.log(`  - Transaction sent! Hash: ${tx.hash}`);
                        await tx.wait();
                        console.log(`  - Transaction confirmed. Project state is now '${await contract.currentState()}'.`);

                        await projectModel.updateProject(project.id, { project_status: 'Failed' }, {});
                        console.log(`  - Database status updated to 'Failed' for project ID: ${project.id}.`);
                    } else {
                        console.log(`  - Funding goal was met. The event listener will handle the status update to 'Succeeded'.`);
                    }
                }
            } catch (error) {
                console.error(`  - Error processing project ${project.id}:`, error.message);
            }
        }
    } catch (dbError) {
        console.error("Error fetching projects from database:", dbError.message);
    }
}

// Run the check immediately on start, then set an interval
checkAndProcessFailedCampaigns();
setInterval(checkAndProcessFailedCampaigns, POLLING_INTERVAL);