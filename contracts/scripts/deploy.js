import { ethers } from 'ethers';
import ProjectToken from '../artifacts/contracts/ProjectToken.sol/ProjectToken.json' assert { type: "json" };
import ProjectManagement from '../artifacts/contracts/ProjectManagement.sol/ProjectManagement.json' assert { type: "json" };
import dotenv from 'dotenv';
import { network } from 'hardhat';
dotenv.config();

network = process.env.hardhat_rpc_url;
/**
 * Deploys the ProjectToken and ProjectManagement contracts for a given project.
 * @param {object} project - The project data from the database.
 * @param {string} creatorWalletAddress - The wallet address of the project creator.
 * @returns {Promise<{managementContractAddress: string, tokenContractAddress: string}>} - The addresses of the deployed contracts.
 */
export async function deployContracts(project, creatorWalletAddress) {
    //Setup Provider and Wallet
    const provider = new ethers.JsonRpcProvider(network);    
    // The wallet of the platform owner, who pays for the deployment.
    // Ensure you have PRIVATE_KEY in your .env file.
    const platformOwnerWallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    console.log(`Deploying contracts with the account: ${platformOwnerWallet.address}`);

    try {
        // 2. Deploy ProjectToken Contract
        const tokenFactory = new ethers.ContractFactory(ProjectToken.abi, ProjectToken.bytecode, platformOwnerWallet);
        const tokenContract = await tokenFactory.deploy(
            project.title,
            project.title.substring(0, 3).toUpperCase(),
            project.funding_goal,
            platformOwnerWallet.address // The platform owner is the owner of the token contract
        );
        await tokenContract.waitForDeployment();
        const tokenContractAddress = await tokenContract.getAddress();
        console.log(`ProjectToken deployed to: ${tokenContractAddress}`);

        // 3. Deploy ProjectManagement Contract
        const managementFactory = new ethers.ContractFactory(ProjectManagement.abi, ProjectManagement.bytecode, platformOwnerWallet);
        const managementContract = await managementFactory.deploy(
            creatorWalletAddress,
            project.funding_goal,
            project.funding_duration,
            tokenContractAddress,
            process.env.USDC_CONTRACT_ADDRESS, // Ensure you have USDC_CONTRACT_ADDRESS in your .env file.
            platformOwnerWallet.address,
            project.platform_fee_percentage,
            project.reward_fee_percentage
        );
        await managementContract.waitForDeployment();
        const managementContractAddress = await managementContract.getAddress();
        console.log(`ProjectManagement deployed to: ${managementContractAddress}`);

        // 4. Set Minter on the Token Contract
        // This gives the ProjectManagement contract the authority to mint new tokens.
        const tx = await tokenContract.setMinter(managementContractAddress);
        await tx.wait();
        console.log('Minter has been set on the ProjectToken contract.');
        
        // Link the ProjectToken to the ProjectManagement contract for reward updates
        const tx2 = await tokenContract.setProjectManagement(managementContractAddress);
        await tx2.wait();
        console.log('ProjectManagement contract has been set on the ProjectToken contract.');


        return { managementContractAddress, tokenContractAddress };

    } catch (error) {
        console.error("Smart contract deployment failed:", error);
        throw new Error("Deployment failed. Please check the logs for more details.");
    }
}