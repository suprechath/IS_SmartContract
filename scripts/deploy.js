const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  // This script is designed to be called from the backend, which will pass arguments.
  // For standalone testing, we can use placeholder values.
  const creatorAddress = process.env.CREATOR_ADDRESS || "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; // Default to Hardhat account 0
  const fundingGoal = process.env.FUNDING_GOAL || "1000000000000000000"; // 1 USDC (assuming 18 decimals for USDC mock)
  const fundingDuration = process.env.FUNDING_DURATION || 3600; // 1 hour
  const platformFee = process.env.PLATFORM_FEE || 250; // 2.5%
  const rewardFee = process.env.REWARD_FEE || 250; // 2.5%
  const projectName = process.env.PROJECT_NAME || "Test Project";
  const projectSymbol = process.env.PROJECT_SYMBOL || "TEST";

  console.log("Starting deployment with the following parameters:");
  console.log(`Creator Address: ${creatorAddress}`);
  console.log(`Funding Goal: ${fundingGoal}`);
  console.log(`Funding Duration: ${fundingDuration}`);
  console.log(`Platform Fee: ${platformFee} bps`);
  console.log(`Reward Fee: ${rewardFee} bps`);
  console.log("----------------------------------------------------");

  const [deployer] = await hre.ethers.getSigners();
  const platformOwner = deployer.address; // The deployer is the platform owner

  // We need a mock USDC token for testing on local hardhat network.
  // On a real testnet, you would use the actual USDC address.
  let usdcTokenAddress;
  if (hre.network.name === "localhost" || hre.network.name === "hardhat") {
      console.log("Deploying MockUSDC token...");
      const MockUSDC = await hre.ethers.getContractFactory("ERC20"); // Using a standard ERC20 as mock
      const usdcToken = await MockUSDC.deploy("Mock USDC", "mUSDC");
      await usdcToken.waitForDeployment();
      usdcTokenAddress = await usdcToken.getAddress();
      console.log("MockUSDC deployed to:", usdcTokenAddress);
  } else {
      // Replace with the actual USDC address on Optimism Sepolia
      usdcTokenAddress = "0x..."; // TODO: Add real USDC address for Optimism Sepolia
      console.log("Using existing USDC token at:", usdcTokenAddress);
  }


  // 1. Deploy ProjectToken
  console.log("Deploying ProjectToken...");
  const ProjectToken = await hre.ethers.getContractFactory("ProjectToken");
  const projectToken = await ProjectToken.deploy(
    projectName,
    projectSymbol,
    fundingGoal, // The cap for the token is the funding goal
    platformOwner
  );
  await projectToken.waitForDeployment();
  const projectTokenAddress = await projectToken.getAddress();
  console.log("ProjectToken deployed to:", projectTokenAddress);

  // 2. Deploy ProjectManagement
  console.log("Deploying ProjectManagement...");
  const ProjectManagement = await hre.ethers.getContractFactory("ProjectManagement");
  const projectManagement = await ProjectManagement.deploy(
    creatorAddress,
    fundingGoal,
    fundingDuration,
    projectTokenAddress,
    usdcTokenAddress,
    platformOwner,
    platformFee,
    rewardFee
  );
  await projectManagement.waitForDeployment();
  const projectManagementAddress = await projectManagement.getAddress();
  console.log("ProjectManagement deployed to:", projectManagementAddress);

  // 3. Set the minter on the ProjectToken to be the ProjectManagement contract
  console.log("Setting minter on ProjectToken...");
  const tx = await projectToken.setMinter(projectManagementAddress);
  await tx.wait();
  console.log("Minter set successfully.");

  // 4. Set the projectManagement on the ProjectToken
  console.log("Setting projectManagement on ProjectToken...");
  const tx2 = await projectToken.setProjectManagement(projectManagementAddress);
  await tx2.wait();
  console.log("ProjectManagement set successfully.");

  console.log("----------------------------------------------------");
  console.log("Deployment complete!");
  console.log(`ProjectToken Address: ${projectTokenAddress}`);
  console.log(`ProjectManagement Address: ${projectManagementAddress}`);

  // Output the addresses in a format that can be easily parsed by the backend
  console.log(`DEPLOYED_ADDRESSES: {"token": "${projectTokenAddress}", "management": "${projectManagementAddress}"}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
