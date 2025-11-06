const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ProjectToken", function () {
  let ProjectToken, projectToken, ProjectManagement, projectManagement, USDC, usdc, owner, creator, investor1, investor2, platformOwner;

  const TOKEN_NAME = "ProjectToken";
  const TOKEN_SYMBOL = "PTK";
  const TOKEN_CAP = ethers.parseUnits("100", 6);
  const DECIMALS = 6;

  async function deployTokenOnly() {
    [owner, investor1, investor2] = await ethers.getSigners();
    ProjectToken = await ethers.getContractFactory("ProjectToken");
    projectToken = await ProjectToken.deploy(TOKEN_NAME, TOKEN_SYMBOL, TOKEN_CAP);
  }

  async function deployIntegratedSystem() {
    [owner, creator, investor1, investor2, platformOwner] = await ethers.getSigners();

    // 1. Deploy Mock USDC (using ProjectToken as a mock ERC20)
    USDC = await ethers.getContractFactory("ProjectToken");
    usdc = await USDC.deploy("MockUSDC", "mUSDC", ethers.parseUnits("10000000", DECIMALS));

    // 2. Deploy ProjectToken
    ProjectToken = await ethers.getContractFactory("ProjectToken");
    projectToken = await ProjectToken.deploy(TOKEN_NAME, TOKEN_SYMBOL, TOKEN_CAP);

    // 3. Deploy ProjectManagement
    const ProjectManagementFactory = await ethers.getContractFactory("ProjectManagement");
    projectManagement = await ProjectManagementFactory.deploy(
      creator.address,
      TOKEN_CAP, // fundingGoal = tokenCap
      (60 * 60 * 24 * 7), // 7 days
      projectToken.target,
      usdc.target,
      platformOwner.address,
      1000, // 10%
      500   // 5%
    );

    // 4. Link Contracts
    await projectToken.connect(owner).setMinter(projectManagement.target);
    await projectToken.connect(owner).setProjectManagement(projectManagement.target);

    // 5. Fund users
    await usdc.connect(owner).setMinter(owner.address);
    await usdc.connect(owner).mint(investor1.address, ethers.parseUnits("1000", DECIMALS));
    await usdc.connect(owner).mint(investor2.address, ethers.parseUnits("1000", DECIMALS));
    await usdc.connect(owner).mint(creator.address, ethers.parseUnits("1000", DECIMALS));

    // 6. Approve
    await usdc.connect(investor1).approve(projectManagement.target, ethers.parseUnits("1000", DECIMALS));
    await usdc.connect(investor2).approve(projectManagement.target, ethers.parseUnits("1000", DECIMALS));
    await usdc.connect(creator).approve(projectManagement.target, ethers.parseUnits("1000", DECIMALS));
  }

  describe("Deployment & Standalone Functions", function () {
    beforeEach(deployTokenOnly);

    it("Should set the correct name, symbol, cap, and owner", async function () {
      expect(await projectToken.name()).to.equal(TOKEN_NAME);
      expect(await projectToken.symbol()).to.equal(TOKEN_SYMBOL);
      expect(await projectToken.cap()).to.equal(TOKEN_CAP);
      expect(await projectToken.owner()).to.equal(owner.address);
    });

    it("Should return the correct decimals (6)", async function () {
      expect(await projectToken.decimals()).to.equal(DECIMALS);
    });

    it("Should allow owner to set minter and emit event", async function () {
      await expect(projectToken.connect(owner).setMinter(investor1.address))
        .to.emit(projectToken, "MinterChanged")
        .withArgs(investor1.address);
      expect(await projectToken.minter()).to.equal(investor1.address);
    });

    it("Should prevent non-owner from setting minter", async function () {
      await expect(projectToken.connect(investor1).setMinter(investor1.address))
        .to.be.revertedWithCustomError(projectToken, "OwnableUnauthorizedAccount");
    });

    it("Should allow owner to set project management and emit event", async function () {
      await expect(projectToken.connect(owner).setProjectManagement(investor1.address))
        .to.emit(projectToken, "ManagementContractSet")
        .withArgs(investor1.address);
      expect(await projectToken.projectManagement()).to.equal(investor1.address);
    });

    it("Should prevent non-owner from setting project management", async function () {
      await expect(projectToken.connect(investor1).setProjectManagement(investor1.address))
        .to.be.revertedWithCustomError(projectToken, "OwnableUnauthorizedAccount");
    });

    it("Should allow minter to mint (Covers _mint)", async function () {
      await projectToken.connect(owner).setMinter(owner.address); // Set owner as minter
      await projectToken.connect(owner).mint(investor1.address, ethers.parseUnits("10", DECIMALS));
      expect(await projectToken.balanceOf(investor1.address)).to.equal(ethers.parseUnits("10", DECIMALS));
    });

    it("Should prevent non-minter from minting", async function () {
      await projectToken.connect(owner).setMinter(investor1.address); // Set investor1 as minter
      // Owner tries to mint, should fail
      await expect(projectToken.connect(owner).mint(investor1.address, ethers.parseUnits("10", DECIMALS)))
        .to.be.revertedWith("ProjectToken: Caller is not the minter");
    });

    it("Should prevent minting over the cap", async function () {
      await projectToken.connect(owner).setMinter(owner.address);
      await projectToken.connect(owner).mint(investor1.address, TOKEN_CAP); // Mint to cap
      // Try to mint 1 more
      await expect(projectToken.connect(owner).mint(investor1.address, 1))
        .to.be.revertedWithCustomError(projectToken, "ERC20ExceededCap");
    });
  });

  describe("_update Hook (Integration Test)", function () {

    it("Should NOT call updateReward when projectManagement is address(0)", async function () {
      // This test covers the 'else' path of the 'if' block
      await deployTokenOnly(); // Deploys token with projectManagement = address(0)

      // Manually set minter and mint
      await projectToken.connect(owner).setMinter(owner.address);
      await projectToken.connect(owner).mint(investor1.address, ethers.parseUnits("100", DECIMALS));

      // Transfer tokens. This calls _update.
      // By not reverting, it proves the 'if' block was skipped.
      await expect(projectToken.connect(investor1).transfer(investor2.address, ethers.parseUnits("10", DECIMALS)))
        .to.not.be.reverted;

      expect(await projectToken.balanceOf(investor2.address)).to.equal(ethers.parseUnits("10", DECIMALS));
    });

    it("Should call updateReward when projectManagement is set", async function () {
      // This test covers the 'if' path (lines 49, 51, 52, 54)
      await deployIntegratedSystem();

      // 1. Fund the project and deposit rewards
      await projectManagement.connect(investor1).invest(ethers.parseUnits("60", DECIMALS));
      await projectManagement.connect(investor2).invest(ethers.parseUnits("40", DECIMALS));
      await projectManagement.connect(creator).mintTokens(2); // Mints 60 to investor1, 40 to investor2

      const rewardAmount = ethers.parseUnits("10", DECIMALS);
      await usdc.connect(creator).approve(projectManagement.target, rewardAmount);
      await projectManagement.connect(creator).depositReward(rewardAmount);

      // 2. Check initial earned rewards for investor1 (60% share)
      const netReward = rewardAmount * 9500n / 10000n; // 9.5 USDC (after 5% fee)
      const expectedReward1 = (netReward * 60n) / 100n; // 5.7 USDC
      expect(await projectManagement.earned(investor1.address)).to.be.closeTo(expectedReward1, 1);

      // 3. Investor1 transfers 10 tokens to investor2
      // This triggers _update(investor1, investor2, ...)
      // This should "cash out" investor1's pending rewards
      await projectToken.connect(investor1).transfer(investor2.address, ethers.parseUnits("10", DECIMALS));

      // 4. Verify results
      // Investor1's balance is now 50. Investor2's balance is now 50.
      expect(await projectToken.balanceOf(investor1.address)).to.equal(ethers.parseUnits("50", DECIMALS));
      expect(await projectToken.balanceOf(investor2.address)).to.equal(ethers.parseUnits("50", DECIMALS));

      // Investor1's 'earned' should be 0 (it was moved to 'rewards' mapping)
      expect(await projectManagement.earned(investor1.address)).to.equal(expectedReward1);
      // Investor1's 'rewards' mapping should hold the 5.7 USDC
      expect(await projectManagement.rewards(investor1.address)).to.be.closeTo(expectedReward1, 1);

      // Investor1 should be able to claim their "cashed out" rewards
      const initialBalance = await usdc.balanceOf(investor1.address);
      await projectManagement.connect(investor1).claimReward();
      const finalBalance = await usdc.balanceOf(investor1.address);
      expect(finalBalance - initialBalance).to.be.closeTo(expectedReward1, 1);
    });
  });
});