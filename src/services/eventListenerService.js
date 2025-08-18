const { ethers } = require('ethers');
const projectManagementAbi = require('../abis/ProjectManagement.json');
const Project = require('../models/Project');
const Investment = require('../models/Investment');
const User = require('../models/User');

const provider = new ethers.JsonRpcProvider(process.env.OPTIMISM_TESTNET_RPC_URL);

// A map to keep track of which contracts we are already listening to
const listeningContracts = new Map();

const listenToProjectEvents = (project) => {
    if (!project || !project.project_management_address || listeningContracts.has(project.project_management_address)) {
        return;
    }

    console.log(`[EventListener] Setting up listener for project: ${project.id} at ${project.project_management_address}`);
    const contract = new ethers.Contract(project.project_management_address, projectManagementAbi, provider);
    listeningContracts.set(project.project_management_address, contract);

    // --- Event Handlers ---

    // Handle Invested Event
    contract.on('Invested', async (investor, amount, event) => {
        console.log(`[EventListener] Invested event caught for project ${project.id}:`);
        console.log(`  Investor: ${investor}`);
        console.log(`  Amount: ${amount.toString()}`);
        console.log(`  Tx Hash: ${event.log.transactionHash}`);

        try {
            // Find the user in our DB by their wallet address
            const user = await User.findByWalletAddress(investor);
            if (!user) {
                console.warn(`[EventListener] Investment from an unknown user wallet: ${investor}`);
                return;
            }

            // Create a record of the investment
            await Investment.create({
                investor_id: user.id,
                project_id: project.id,
                amount: amount.toString(),
                transaction_hash: event.log.transactionHash
            });
            console.log(`[EventListener] Successfully recorded investment for user ${user.id} in project ${project.id}.`);

        } catch (error) {
            console.error(`[EventListener] Error processing Invested event for project ${project.id}:`, error);
        }
    });

    // Handle TokensMinted Event
    contract.on('TokensMinted', async (totalAmount, event) => {
        console.log(`[EventListener] TokensMinted event caught for project ${project.id}. Total: ${totalAmount}`);
        // Optionally, update project state or log this event
    });

    // Handle FundsWithdrawn Event
    contract.on('FundsWithdrawn', async (creatorAmount, platformFee, event) => {
        console.log(`[EventListener] FundsWithdrawn event caught for project ${project.id}.`);
        // Optionally, log this event
    });
};

const initializeListeners = async () => {
    console.log('[EventListener] Initializing event listeners...');
    try {
        const projects = await Project.getLive(); // Get all funding or active projects
        console.log(`[EventListener] Found ${projects.length} live projects to monitor.`);
        projects.forEach(listenToProjectEvents);
    } catch (error) {
        console.error('[EventListener] Error initializing listeners:', error);
    }
};

// We can also export a function to add a listener for a new project when it gets approved
const addNewProjectListener = (project) => {
    listenToProjectEvents(project);
};

module.exports = {
    initializeListeners,
    addNewProjectListener
};
