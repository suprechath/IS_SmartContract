const hre = require("hardhat");

async function main() {
    console.log("Starting deployment...");

    // Get signers
    const [deployer, creator, platformOwner] = await hre.ethers.getSigners();
    console.log("Deployer:", deployer.address);
    console.log("Creator:", creator.address);
    console.log("Platform Owner:", platformOwner.address);

    // --- Parameters ---
    const fundingGoal = hre.ethers.parseEther("100"); // 100 tokens
    const fundingDuration = 60 * 60 * 24 * 30; // 30 days in seconds

    // --- Deploy Mock USDC Token ---
    const USDC = await hre.ethers.getContractFactory("ProjectToken");
    const usdc = await USDC.deploy("Mock USDC", "mUSDC", hre.ethers.parseUnits("10000000", 18), deployer.address);
    await usdc.waitForDeployment();
    console.log("Mock USDC token deployed to:", usdc.target);

    // --- Deploy ProjectToken ---
    const ProjectToken = await hre.ethers.getContractFactory("ProjectToken");
    const projectToken = await ProjectToken.deploy("My Project Token", "MPT", fundingGoal, platformOwner.address);
    await projectToken.waitForDeployment();
    console.log("ProjectToken deployed to:", projectToken.target);

    // --- Deploy ProjectManagement ---
    const ProjectManagement = await hre.ethers.getContractFactory("ProjectManagement");
    const projectManagement = await ProjectManagement.deploy(
        creator.address,
        fundingGoal,
        fundingDuration,
        projectToken.target,
        usdc.target,
        platformOwner.address
    );
    await projectManagement.waitForDeployment();
    console.log("ProjectManagement contract deployed to:", projectManagement.target);

    // --- Post-Deployment Configuration ---
    console.log("Configuring roles...");

    // Set the ProjectManagement contract as the minter for the ProjectToken
    const tx1 = await projectToken.connect(platformOwner).setMinter(projectManagement.target);
    await tx1.wait();
    console.log(`ProjectManagement contract (${projectManagement.target}) is now the minter for ProjectToken.`);

    // Link the ProjectToken to the ProjectManagement contract for reward updates
    const tx2 = await projectToken.connect(platformOwner).setProjectManagement(projectManagement.target);
    await tx2.wait();
    console.log(`ProjectToken (${projectToken.target}) is now linked to ProjectManagement for reward updates.`);

    console.log("\nDeployment and configuration complete! ✅");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
