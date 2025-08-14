import { expect } from "chai";
import pkg from "hardhat";
const { ethers } = pkg;

describe("ProjectToken", function () {
  let ProjectToken;
  let projectToken;
  let owner;
  let add1;
  let add2;
  let addrs;

  const TOKEN_NAME = "ProjectToken";
  const TOKEN_SYMBOL = "PTK";
  const TOKEN_CAP = ethers.parseUnits("1000000",18); // Use ethers.parseUnits to handle large numbers and decimals correctly

  beforeEach(async function () {
    [owner, add1, add2, ...addrs] = await ethers.getSigners();
    ProjectToken = await ethers.getContractFactory("ProjectToken");

    projectToken = await ProjectToken.deploy(
      TOKEN_NAME,
      TOKEN_SYMBOL,
      TOKEN_CAP,
      owner.address
    );
    // await projectToken.deployed() is no longer needed with recent ethers.js versions
  });

  describe("Deployment", function () {
    it("Should set the right name and symbol", async function () {
      expect(await projectToken.name()).to.equal(TOKEN_NAME);
      expect(await projectToken.symbol()).to.equal(TOKEN_SYMBOL);
    });

    it("Should set the correct cap", async function () {
      expect(await projectToken.cap()).to.equal(TOKEN_CAP);
    });

    it("Should assign the deployer as the initial owner", async function () {
      expect(await projectToken.owner()).to.equal(owner.address);
    });

    it("Should have an initial total supply of 0", async function () {
      expect(await projectToken.totalSupply()).to.equal(0);
    });

    it("Should have the minter address initialized to the zero address", async function () {
      expect(await projectToken.minter()).to.equal(ethers.ZeroAddress);
    });
  });

  describe("setMinter", function () {
    it("Should allow the owner to set a new minter", async function () {
      // The owner sets addr1 as the new minter
      await projectToken.connect(owner).setMinter(add1.address);
      // Verify that the minter address has been updated
      expect(await projectToken.minter()).to.equal(add1.address);
    });

    it("Should emit a MinterChanged event when a new minter is set", async function () {
      await expect(projectToken.connect(owner).setMinter(add1.address))
        .to.emit(projectToken, "MinterChanged")
        .withArgs(add1.address);
    });

    it("Should prevent non-owners from setting a new minter", async function () {
      await expect(
        projectToken.connect(add1).setMinter(add2.address)
      ).to.be.revertedWithCustomError(projectToken, "OwnableUnauthorizedAccount")
       .withArgs(add1.address);
    });
  });

  describe("mint", function () {
    // Set addr1 as the minter before running tests in this block
    beforeEach(async function () {
      await projectToken.connect(owner).setMinter(add1.address);
    });

    it("Should allow the minter to mint tokens", async function () {
      const amountToMint = ethers.parseUnits("100", 18);
      // The minter (add1) mints tokens to addr2
      await projectToken.connect(add1).mint(add2.address, amountToMint);
      // Verify the recipient's balance and the total supply
      expect(await projectToken.balanceOf(add2.address)).to.equal(amountToMint);
      expect(await projectToken.totalSupply()).to.equal(amountToMint);
    });

    it("Should prevent non-minters from minting tokens", async function () {
      const amountToMint = ethers.parseUnits("100", 18);
      // The owner is not the minter, so this should fail
      await expect(
        projectToken.connect(owner).mint(add2.address, amountToMint)
      ).to.be.revertedWith("ProjectToken: Caller is not the minter");

      // addr2 is also not the minter, so this should also fail
      await expect(
        projectToken.connect(add2).mint(owner.address, amountToMint)
      ).to.be.revertedWith("ProjectToken: Caller is not the minter");
    });

    
    it("Should emit a Transfer event on successful mint", async function () {
        const amountToMint = ethers.parseUnits("50", 18);
        await expect(projectToken.connect(add1).mint(add2.address, amountToMint))
            .to.emit(projectToken, "Transfer")
            .withArgs(ethers.ZeroAddress, add2.address, amountToMint);
    });

    it("Should prevent minting beyond the cap", async function () {
      const amountToMint = TOKEN_CAP;
      await projectToken.connect(add1).mint(add2.address, amountToMint);
      const smallAmount = ethers.parseUnits("1", 18);
      const currentSupply = amountToMint + smallAmount;
      await expect(
        projectToken.connect(add1).mint(add2.address, smallAmount)
      ).to.be.revertedWithCustomError(projectToken, "ERC20ExceededCap")
        .withArgs(currentSupply,TOKEN_CAP);
    });

    it("Should prevent minting to the zero address", async function () {
        const amountToMint = ethers.parseUnits("100", 18);
        await expect(
            projectToken.connect(add1).mint(ethers.ZeroAddress, amountToMint)
        ).to.be.revertedWithCustomError(projectToken,"ERC20InvalidReceiver");
    });
  });

  describe("Inherited Functionality", function() {
    it("Should allow token transfers between accounts", async function() {
        const mintAmount = ethers.parseUnits("200", 18);
        await projectToken.connect(owner).setMinter(owner.address);
        await projectToken.connect(owner).mint(add1.address, mintAmount);
        const transferAmount = ethers.parseUnits("50", 18);
        // Test: add1 transfers tokens to addr2
        await projectToken.connect(add1).transfer(add2.address, transferAmount);
        // Verify balances
        expect(await projectToken.balanceOf(add1.address)).to.equal(mintAmount - (transferAmount));
        expect(await projectToken.balanceOf(add2.address)).to.equal(transferAmount);
    });

    it("Should allow owner to transfer ownership", async function() {
        await projectToken.connect(owner).transferOwnership(add1.address);
        expect(await projectToken.owner()).to.equal(add1.address);
    });
  });

  describe("Integration with ProjectManagement", function() {
    let projectManagement, usdc;

    beforeEach(async function() {
        // We already have projectToken deployed from the outer beforeEach

        // Deploy a mock USDC token
        const USDC = await ethers.getContractFactory("ProjectToken"); // Using ProjectToken as a mock ERC20
        usdc = await USDC.deploy("Mock USDC", "mUSDC", ethers.parseUnits("1000000", 18), owner.address);

        // Deploy ProjectManagement
        const ProjectManagement = await ethers.getContractFactory("ProjectManagement");
        projectManagement = await ProjectManagement.deploy(
            owner.address, // creator
            ethers.parseEther("100"), // fundingGoal
            60 * 60 * 24 * 7, // fundingDuration
            projectToken.target,
            usdc.target,
            owner.address // platformOwner
        );

        // Link contracts
        await projectToken.connect(owner).setMinter(projectManagement.target);
        await projectToken.connect(owner).setProjectManagement(projectManagement.target);

        // Mint some mock USDC to the owner so they can distribute it
        await usdc.connect(owner).setMinter(owner.address);
        await usdc.connect(owner).mint(owner.address, ethers.parseEther("1000"));

        // Setup for test: fund the project to 'Succeeded' state
        await usdc.connect(owner).transfer(add1.address, ethers.parseEther("100"));
        await usdc.connect(add1).approve(projectManagement.target, ethers.parseEther("100"));
        await projectManagement.connect(add1).invest(ethers.parseEther("100"));

        // Mint tokens to enter 'Active' state
        await projectManagement.connect(owner).mintTokens(1); // Mint for the single contributor (add1)
    });

    it("Should call updateReward on token transfer", async function() {
        // Deposit a reward
        const rewardAmount = ethers.parseEther("10");
        await usdc.connect(owner).approve(projectManagement.target, rewardAmount);
        await projectManagement.connect(owner).depositReward(rewardAmount);

        // Before transfer, check initial earned amount for add1
        const initialEarned = await projectManagement.earned(add1.address);
        expect(initialEarned).to.be.gt(0); // Should have earned something

        // Transfer some tokens from add1 to add2
        const transferAmount = ethers.parseUnits("25", 18);
        await projectToken.connect(add1).transfer(add2.address, transferAmount);

        // Verify that rewards for add1 were updated (and thus claimed) during the transfer
        // The `earned` function should now calculate rewards based on the new balance,
        // and since `updateReward` was called, the previously earned amount is now in `rewards`.
        // A direct check of `rewards` mapping is a good way to test this.
        const add1Rewards = await projectManagement.rewards(add1.address);
        expect(add1Rewards).to.equal(initialEarned);

        // After the transfer, the `updateReward` hook for add1 has been called.
        // Let's capture the new state.
        const add1RewardsAfterTransfer = await projectManagement.rewards(add1.address);
        const add1EarnedAfterTransfer = await projectManagement.earned(add1.address);

        // The rewards should be updated, and the new earned amount should be based on the updated state.
        expect(add1RewardsAfterTransfer).to.equal(initialEarned);

        // Add2 should have no rewards initially, as they just received tokens.
        expect(await projectManagement.rewards(add2.address)).to.equal(0);

        // Deposit another reward to see new earnings accrue
        await usdc.connect(owner).approve(projectManagement.target, rewardAmount);
        await projectManagement.connect(owner).depositReward(rewardAmount);

        // Now both add1 and add2 should have new earned rewards, proportional to their new balances.
        expect(await projectManagement.earned(add1.address)).to.be.gt(0);
        expect(await projectManagement.earned(add2.address)).to.be.gt(0);
    });
  });
});
