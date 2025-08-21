import { ethers } from 'ethers';
import ProjectToken from '../artifacts/contracts/ProjectToken.sol/ProjectToken.json' assert { type: "json" };
import ProjectManagement from '../artifacts/contracts/ProjectManagement.sol/ProjectManagement.json' assert { type: "json" };
import dotenv from 'dotenv';
dotenv.config();

export async function deployContracts(project) {
    // const provider = new ethers.JsonRpcProvider(process.env.OPTIMISM_GOERLI_RPC_URL);
    // const provider = new ethers.JsonRpcProvider(process.env.hardhat_rpc_url);
    // const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    console.log(`Deploying contracts with the account: ${signer.address}`);

    // Deploy ProjectToken
    const tokenFactory = new ethers.ContractFactory(ProjectToken.abi, ProjectToken.bytecode, signer);
    const tokenContract = await tokenFactory.deploy(
        project.title,
        project.title.substring(0, 3).toUpperCase(),
        project.funding_goal,
        wallet.address // Platform Owner
    );
    await tokenContract.waitForDeployment();
    const tokenContractAddress = await tokenContract.getAddress();
    console.log(`ProjectToken deployed to: ${tokenContractAddress}`);

    // Deploy ProjectManagement
    const managementFactory = new ethers.ContractFactory(ProjectManagement.abi, ProjectManagement.bytecode, wallet);
    const managementContract = await managementFactory.deploy(
        project.creator_wallet_address,
        project.funding_goal,
        project.funding_duration,
        tokenContractAddress,
        process.env.USDC_CONTRACT_ADDRESS,
        wallet.address, // Platform Owner
        project.platform_fee_percentage,
        project.reward_fee_percentage
    );
    await managementContract.waitForDeployment();
    const managementContractAddress = await managementContract.getAddress();
    console.log(`ProjectManagement deployed to: ${managementContractAddress}`);

    // Set Minter on Token Contract
    const tx = await tokenContract.setMinter(managementContractAddress);
    await tx.wait();
    console.log('Minter has been set on the ProjectToken contract.');

    return { managementContractAddress, tokenContractAddress };
}