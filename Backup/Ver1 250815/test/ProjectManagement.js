const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("ProjectManagement", function () {
    let ProjectManagement, projectManagement, ProjectToken, projectToken, USDC, usdc, owner, creator, investor1, investor2, platformOwner;
    
    const fundingGoal = ethers.parseUnits("100",18);//ethers.parseEther("100");
    const fundingDuration = 60 * 60 * 24 * 7; // 7 days

    beforeEach(async function () {
        [owner, creator, investor1, investor2, platformOwner] = await ethers.getSigners();

        // Deploy a mock USDC token (using ProjectToken contract as it's a standard ERC20)
        USDC = await ethers.getContractFactory("ProjectToken");
        usdc = await USDC.deploy("Mock USDC", "mUSDC", ethers.parseUnits("1000000", 18), owner.address);

        // Deploy the ProjectToken
        ProjectToken = await ethers.getContractFactory("ProjectToken");
        projectToken = await ProjectToken.deploy("Project Token", "PT", fundingGoal, platformOwner.address);

        // Deploy the ProjectManagement contract
        const ProjectManagementFactory = await ethers.getContractFactory("ProjectManagement");
        projectManagement = await ProjectManagementFactory.deploy(
            creator.address,
            fundingGoal,
            fundingDuration,
            projectToken.target,
            usdc.target,
            platformOwner.address
        );

        // --- Setup ---
        // Set the ProjectManagement contract as the minter for the ProjectToken
        await projectToken.connect(platformOwner).setMinter(projectManagement.target);
        // Link the ProjectToken to the ProjectManagement contract for reward updates
        await projectToken.connect(platformOwner).setProjectManagement(projectManagement.target);

        // Mint and distribute mock USDC
        await usdc.connect(owner).setMinter(owner.address);
        await usdc.connect(owner).mint(owner.address, ethers.parseEther("4000"));
        await usdc.connect(owner).transfer(investor1.address, ethers.parseEther("1000"));
        await usdc.connect(owner).transfer(investor2.address, ethers.parseEther("1000"));
        await usdc.connect(owner).transfer(creator.address, ethers.parseEther("1000"));

        // Investors approve the ProjectManagement contract to spend their USDC
        await usdc.connect(investor1).approve(projectManagement.target, ethers.parseEther("1000"));
        await usdc.connect(investor2).approve(projectManagement.target, ethers.parseEther("1000"));
        await usdc.connect(creator).approve(projectManagement.target, ethers.parseEther("1000"));
    });

    describe("Deployment", function () {
        it("Should set the correct initial state variables", async function () {
            expect(await projectManagement.creator()).to.equal(creator.address);
            expect(await projectManagement.fundingGoal()).to.equal(fundingGoal);
            expect(await projectManagement.projectToken()).to.equal(projectToken.target);
            expect(await projectManagement.usdcToken()).to.equal(usdc.target);
            expect(await projectManagement.owner()).to.equal(platformOwner.address);
            expect(await projectManagement.currentState()).to.equal(0); // State.Funding
        });

        it("Should set the correct funding duration", async function () {
            expect(await projectManagement.deadline()).to.lt((await time.latest()) + fundingDuration);
        });

    });

    describe("Funding Phase: invest()", function () {
        it("Should allow an investor to contribute funds", async function () {
            const investmentAmount = ethers.parseEther("10");
            await expect(projectManagement.connect(investor1).invest(investmentAmount))
                .to.emit(projectManagement, "Invested")
                .withArgs(investor1.address, investmentAmount);

            expect(await projectManagement.contributions(investor1.address)).to.equal(investmentAmount);
            expect(await projectManagement.totalContributions()).to.equal(investmentAmount);
            expect(await usdc.balanceOf(projectManagement.target)).to.equal(investmentAmount);
        });

        it("Should add a new contributor to the contributors array", async function () {
            await projectManagement.connect(investor1).invest(ethers.parseEther("10"));
            expect(await projectManagement.contributors(0)).to.equal(investor1.address);
        });

        it("Should not add an existing contributor to the array again", async function () {
            await projectManagement.connect(investor1).invest(ethers.parseEther("10"));
            await projectManagement.connect(investor1).invest(ethers.parseEther("5"));
            await expect(projectManagement.contributors(1)).to.be.reverted;
        });

        it("Should fail if investment exceeds the remaining amount to reach the goal", async function () {
            await expect(projectManagement.connect(investor1).invest(fundingGoal + ethers.parseEther("1"))).to.be.revertedWith("Investment amount exceeds funding goal");
        });

        it("Should fail if the fundraising deadline has passed", async function () {
            await time.increase(fundingDuration + 1);
            await expect(projectManagement.connect(investor1).invest(ethers.parseEther("10"))).to.be.revertedWith("Fundraising has ended");
        });

        it("Should transition state to 'Succeeded' when the funding goal is met exactly", async function () {
            await projectManagement.connect(investor1).invest(fundingGoal);
            expect(await projectManagement.currentState()).to.equal(1); // State.Succeeded
        });
    });

    describe("Succeeded Phase: mintTokens()", function () {
        beforeEach(async function () {
            // Reach the funding goal to enter the Succeeded state
            await projectManagement.connect(investor1).invest(ethers.parseEther("60"));
            await projectManagement.connect(investor2).invest(ethers.parseEther("40"));
        });

        it("Should only be callable by the creator", async function () {
            await expect(projectManagement.connect(investor1).mintTokens(2)).to.be.revertedWith("Not the creator");
        });

        it("Should only be callable in the 'Succeeded' state", async function () {
            // Create a new instance that is still in Funding state
            const newPM = await (await ethers.getContractFactory("ProjectManagement")).deploy(creator.address, fundingGoal, fundingDuration, projectToken.target, usdc.target, platformOwner.address);
            await expect(newPM.connect(creator).mintTokens(1)).to.be.revertedWith("Invalid state");
        });

        it("Should mint tokens in batches according to the limit", async function () {
            // Mint for the first contributor
            await projectManagement.connect(creator).mintTokens(1);
            expect(await projectToken.balanceOf(investor1.address)).to.equal(ethers.parseEther("60"));
            expect(await projectToken.balanceOf(investor2.address)).to.equal(0);
            expect(await projectManagement.mintedContributorCount()).to.equal(1);
            expect(await projectManagement.areTokensMinted()).to.be.false;

            // Mint for the second contributor
            await projectManagement.connect(creator).mintTokens(1);
            expect(await projectToken.balanceOf(investor2.address)).to.equal(ethers.parseEther("40"));
            expect(await projectManagement.mintedContributorCount()).to.equal(2);
        });

        it("Should transition to 'Active' state after all tokens are minted", async function () {
            await projectManagement.connect(creator).mintTokens(2); // Mint for all 2 contributors
            expect(await projectManagement.currentState()).to.equal(3); // State.Active
            expect(await projectManagement.areTokensMinted()).to.be.true;
            // Now that the state is Active, calling mintTokens again should fail with 'Invalid state'
            await expect(projectManagement.connect(creator).mintTokens(1)).to.be.revertedWith("Invalid state");
        });

        it("Should emit TokensMinted event when all tokens are minted", async function () {
             await expect(projectManagement.connect(creator).mintTokens(2))
                .to.emit(projectManagement, "TokensMinted")
                .withArgs(fundingGoal);
        });
    });

    describe("Active Phase: withdrawFunds() & Rewards", function () {
        beforeEach(async function () {
            await projectManagement.connect(investor1).invest(ethers.parseEther("60"));
            await projectManagement.connect(investor2).invest(ethers.parseEther("40"));
            await projectManagement.connect(creator).mintTokens(2);
        });

        it("Should allow creator to withdraw all contributed funds", async function () {
            const contractBalance = await usdc.balanceOf(projectManagement.target);
            const creatorInitialBalance = await usdc.balanceOf(creator.address);
            expect(contractBalance).to.equal(fundingGoal);

            await expect(projectManagement.connect(creator).withdrawFunds())
                .to.emit(projectManagement, "FundsWithdrawn")
                .withArgs(fundingGoal);
            
            expect(await usdc.balanceOf(projectManagement.target)).to.equal(0);
            expect(await usdc.balanceOf(creator.address)).to.equal(creatorInitialBalance + fundingGoal);
        });

        it("Should prevent non-creators from withdrawing funds", async function () {
            await expect(projectManagement.connect(investor1).withdrawFunds()).to.be.revertedWith("Not the creator");
        });

        it("Should allow creator to deposit rewards", async function () {
            const rewardAmount = ethers.parseEther("10");
            await usdc.connect(creator).approve(projectManagement.target, rewardAmount);
            
            await expect(projectManagement.connect(creator).depositReward(rewardAmount))
                .to.emit(projectManagement, "RewardDeposited")
                .withArgs(rewardAmount);
            
            const expectedRewardPerToken = (rewardAmount * BigInt(1e18)) / fundingGoal;
            expect(await projectManagement.rewardPerTokenStored()).to.equal(expectedRewardPerToken);
        });

        it("Should calculate and allow claiming of rewards", async function () {
            // Deposit rewards
            const rewardAmount = ethers.parseEther("10");
            await usdc.connect(creator).approve(projectManagement.target, rewardAmount);
            await projectManagement.connect(creator).depositReward(rewardAmount);

            // Check earned amount for investor1 (60% contribution)
            const expectedReward1 = (ethers.parseEther("60") * (await projectManagement.rewardPerTokenStored())) / BigInt(1e18);
            expect(await projectManagement.earned(investor1.address)).to.be.closeTo(expectedReward1, 1);

            // Investor1 claims reward
            const investor1InitialBalance = await usdc.balanceOf(investor1.address);
            await expect(projectManagement.connect(investor1).claimReward())
                .to.emit(projectManagement, "RewardClaimed");
            
            const investor1FinalBalance = await usdc.balanceOf(investor1.address);
            expect(investor1FinalBalance).to.be.closeTo(investor1InitialBalance + expectedReward1, 1);
            expect(await projectManagement.earned(investor1.address)).to.equal(0);
        });

        it("Should handle zero-amount reward deposits gracefully", async function () {
            await expect(projectManagement.connect(creator).depositReward(0))
                .to.not.be.reverted;
        });
    });

    describe("Failed Phase: checkCampaignFailed() & claimRefund()", function () {
        beforeEach(async function () {
            // Investor contributes, but not enough to meet the goal
            await projectManagement.connect(investor1).invest(ethers.parseEther("10"));
        });

        it("Should not allow checking for failure before the deadline", async function () {
            await expect(projectManagement.checkCampaignFailed()).to.be.revertedWith("Campaign deadline has not passed yet");
        });

        it("Should not transition to Failed if goal was met", async function () {
            await projectManagement.connect(investor2).invest(fundingGoal - (ethers.parseEther("10")));
            await time.increase(fundingDuration + 1);
            // The state is now 'Succeeded', so checkCampaignFailed (which requires 'Funding') should fail.
            await expect(projectManagement.checkCampaignFailed()).to.be.revertedWith("Invalid state");
        });

        it("Should transition to 'Failed' state if deadline passed and goal not met", async function () {
            await time.increase(fundingDuration + 1);
            await projectManagement.checkCampaignFailed();
            expect(await projectManagement.currentState()).to.equal(2); // State.Failed
        });

        it("Should allow investors to claim a refund in 'Failed' state", async function () {
            await time.increase(fundingDuration + 1);
            await projectManagement.checkCampaignFailed();

            const contributionAmount = ethers.parseEther("10");
            const investor1InitialBalance = await usdc.balanceOf(investor1.address);

            await expect(projectManagement.connect(investor1).claimRefund())
                .to.emit(projectManagement, "Refunded")
                .withArgs(investor1.address, contributionAmount);

            expect(await usdc.balanceOf(investor1.address)).to.equal(investor1InitialBalance + contributionAmount);
            expect(await projectManagement.contributions(investor1.address)).to.equal(0);
        });

        it("Should prevent claiming refund if not in 'Failed' state", async function () {
            await expect(projectManagement.connect(investor1).claimRefund()).to.be.revertedWith("Invalid state");
        });

        it("Should prevent an investor from claiming a refund twice", async function () {
            await time.increase(fundingDuration + 1);
            await projectManagement.checkCampaignFailed();

            // First claim
            await projectManagement.connect(investor1).claimRefund();

            // Second attempt should fail
            await expect(projectManagement.connect(investor1).claimRefund())
                .to.be.revertedWith("No contribution to refund");
        });
    });
});
