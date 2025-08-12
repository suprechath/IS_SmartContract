const { expect } = require("chai");
const { ethers } = require("hardhat");

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
            .to.emit(projectToken, "Minted")
            .withArgs(add1.address, add2.address, amountToMint);
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
        expect(await projectToken.balanceOf(add1.address)).to.equal(mintAmount - transferAmount);
        expect(await projectToken.balanceOf(add2.address)).to.equal(transferAmount);
    });

    it("Should allow owner to transfer ownership", async function() {
        await projectToken.connect(owner).transferOwnership(add1.address);
        expect(await projectToken.owner()).to.equal(add1.address);
    });
  });
});
