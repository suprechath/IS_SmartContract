const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ProjectToken", function () {
  let ProjectToken, projectToken, owner, addr1, addr2, platformOwner, projectManagementMock;
  let fundingGoal = ethers.parseEther("100")

  beforeEach(async function () {
    [owner, addr1, addr2, platformOwner] = await ethers.getSigners();
    
    // For the purpose of testing the _update hook, we need a mock of ProjectManagement.
    const MockProjectManagement = await ethers.getContractFactory("ProjectManagement");
    const MockUSDC = await ethers.getContractFactory("ProjectToken");
    const mockUsdc = await MockUSDC.deploy("Mock USDC", "mUSDC", ethers.parseEther("1000000"), platformOwner.address);
    projectManagementMock = await MockProjectManagement.deploy(
      owner.address, // creator
      fundingGoal, // fundingGoal
      60 * 60 * 24, // 1 day duration
      ethers.ZeroAddress, // placeholder for projectToken address
      mockUsdc.target,
      platformOwner.address
    );

    // Deploy the ProjectToken contract
    ProjectToken = await ethers.getContractFactory("ProjectToken");
    projectToken = await ProjectToken.deploy(
      "Test Token",
      "TT",
      fundingGoal, //ethers.parseEther("1000000"),
      owner.address
    );
  });

  describe("Deployment and Initial State", function () {
    it("Should set the right platform owner", async function () {
      expect(await projectToken.owner()).to.equal(owner.address);
    });

    it("Should have the correct name, symbol, and cap", async function () {
      expect(await projectToken.name()).to.equal("Test Token");
      expect(await projectToken.symbol()).to.equal("TT");
      expect(await projectToken.cap()).to.equal(fundingGoal);
    });

    it("Should have no minter or projectManagement address set initially", async function () {
      expect(await projectToken.minter()).to.equal(ethers.ZeroAddress);
      expect(await projectToken.projectManagement()).to.equal(ethers.ZeroAddress);
    });
  });

  describe("Owner Functions", function () {
    it("Should allow the owner to set the minter", async function () {
      await expect(projectToken.connect(owner).setMinter(addr1.address))
        .to.emit(projectToken, "MinterChanged")
        .withArgs(addr1.address);
      expect(await projectToken.minter()).to.equal(addr1.address);
    });

    it("Should prevent non-owners from setting the minter", async function () {
      await expect(projectToken.connect(addr1).setMinter(addr2.address))
        .to.be.revertedWithCustomError(projectToken, "OwnableUnauthorizedAccount")
        .withArgs(addr1.address);
    });

    it("Should allow the owner to set the project management contract", async function () {
      await expect(projectToken.connect(owner).setProjectManagement(projectManagementMock.target))
        .to.emit(projectToken, "ManagementContractSet")
        .withArgs(projectManagementMock.target);
      expect(await projectToken.projectManagement()).to.equal(projectManagementMock.target);
    });

    it("Should prevent non-owners from setting the project management contract", async function () {
      await expect(projectToken.connect(addr1).setProjectManagement(projectManagementMock.target))
        .to.be.revertedWithCustomError(projectToken, "OwnableUnauthorizedAccount")
        .withArgs(addr1.address);
    });
  });

  describe("Minting", function () {
    beforeEach(async function () {
      await projectToken.connect(owner).setMinter(owner.address);
    });

    it("Should allow the minter to mint tokens", async function () {
      await projectToken.connect(owner).mint(addr1.address, ethers.parseEther("50"));
      await projectToken.connect(owner).mint(addr2.address, ethers.parseEther("50"));
      projectTokenBalance = await projectToken.balanceOf(addr1.address) + await projectToken.balanceOf(addr2.address);
      expect(await projectToken.totalSupply()).to.equal(projectTokenBalance);
      // await projectToken.connect(owner).mint(addr1.address, ethers.parseEther("100"));
      // expect(await projectToken.balanceOf(addr1.address)).to.equal(ethers.parseEther("100"));
    });

    it("Should not allow a non-minter to mint tokens", async function () {
      await expect(projectToken.connect(addr1).mint(addr2.address, ethers.parseEther("100")))
        .to.be.revertedWith("ProjectToken: Caller is not the minter");
    });

    it("Should not allow minting beyond the cap", async function () {
      const cap = await projectToken.cap();
      await projectToken.connect(owner).mint(addr1.address, cap);
      await expect(projectToken.connect(owner).mint(addr2.address, 1))
        .to.be.revertedWithCustomError(projectToken, "ERC20ExceededCap");
    });
  });

  describe("_update Hook", function () {
    it("Should call ", async function () {
      // await projectToken.connect(owner).setMinter(owner.address);
      // expect(await projectToken.minter()).to.equal(owner.address);
      // await projectToken.connect(owner).mint(addr2.address, ethers.parseEther("50"));
      // console.log("totalSupply", await projectToken.totalSupply());
      // expect(await projectToken.balanceOf(addr1.address)).to.equal(projectToken.totalSupply());
      // await projectToken.connect(owner).setProjectManagement(projectManagementMock.target);
      // expect(await projectToken.projectManagement()).to.equal(projectManagementMock.target);

    });
  });
});
