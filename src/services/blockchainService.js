const { ethers } = require('ethers');
const projectManagementAbi = require('../abis/ProjectManagement.json');
const projectTokenAbi = require('../abis/ProjectToken.json');

const provider = new ethers.JsonRpcProvider(process.env.OPTIMISM_TESTNET_RPC_URL);

const getProjectState = async (managementAddress, tokenAddress) => {
    try {
        const managementContract = new ethers.Contract(managementAddress, projectManagementAbi, provider);
        const tokenContract = new ethers.Contract(tokenAddress, projectTokenAbi, provider);

        const [
            totalContributions,
            fundingGoal,
            deadline,
            currentState,
            areTokensMinted,
            totalSupply
        ] = await Promise.all([
            managementContract.totalContributions(),
            managementContract.fundingGoal(),
            managementContract.deadline(),
            managementContract.currentState(),
            managementContract.areTokensMinted(),
            tokenContract.totalSupply()
        ]);

        return {
            totalContributions: totalContributions.toString(),
            fundingGoal: fundingGoal.toString(),
            deadline: Number(deadline),
            currentState: Number(currentState), // 0: Funding, 1: Succeeded, 2: Failed, 3: Active
            areTokensMinted,
            totalSupply: totalSupply.toString()
        };
    } catch (error) {
        console.error(`Error fetching project state for ${managementAddress}:`, error);
        throw new Error('Failed to fetch project state from blockchain.');
    }
};

const getInvestorInfo = async (managementAddress, tokenAddress, investorAddress) => {
    try {
        const managementContract = new ethers.Contract(managementAddress, projectManagementAbi, provider);
        const tokenContract = new ethers.Contract(tokenAddress, projectTokenAbi, provider);

        const [
            tokenBalance,
            earnedRewards
        ] = await Promise.all([
            tokenContract.balanceOf(investorAddress),
            managementContract.earned(investorAddress)
        ]);

        return {
            tokenBalance: tokenBalance.toString(),
            earnedRewards: earnedRewards.toString()
        };
    } catch (error) {
        console.error(`Error fetching investor info for ${investorAddress} on project ${managementAddress}:`, error);
        throw new Error('Failed to fetch investor info from blockchain.');
    }
};


module.exports = {
    getProjectState,
    getInvestorInfo
};
