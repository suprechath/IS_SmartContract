const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("ProjectManagement", function () {
    let ProjectManagement, projectManagement, ProjectToken, projectToken, USDC, usdc, owner, creator, investor1, investor2, platformOwner;
    
    const fundingGoal = ethers.parseUnits("100", 6);
    const fundingDuration = 60 * 60 * 24 * 7; // 7 days
    const platformFeePercentage = 1000; // 10%
    const rewardFeePercentage = 500; // 5%

    beforeEach(async function () {
        [owner, creator, investor1, investor2, platformOwner] = await ethers.getSigners();

        // Deploy a mock USDC token (using ProjectToken contract as it's a standard ERC20 with 6 decimals)
        USDC = await ethers.getContractFactory("ProjectToken");
        // Deploy with a large cap for a mock token
        usdc = await USDC.deploy("MockUSDC", "mUSDC", ethers.parseUnits("10000000", 6)); 

        // Deploy the ProjectToken
        ProjectToken = await ethers.getContractFactory("ProjectToken");
        projectToken = await ProjectToken.deploy("ProjectToken", "PT", fundingGoal);

        // Deploy the ProjectManagement contract
        const ProjectManagementFactory = await ethers.getContractFactory("ProjectManagement");
        projectManagement = await ProjectManagementFactory.deploy(
            creator.address,
            fundingGoal,
            fundingDuration,
            projectToken.target,
            usdc.target,
            platformOwner.address,
            platformFeePercentage,
            rewardFeePercentage
        );

        // --- Setup ---
        // Set the ProjectManagement contract as the minter for the ProjectToken
        await projectToken.connect(owner).setMinter(projectManagement.target);
        // Link the ProjectToken to the ProjectManagement contract for reward updates
        await projectToken.connect(owner).setProjectManagement(projectManagement.target);

        // Mint and distribute mock USDC
        await usdc.connect(owner).setMinter(owner.address);
        await usdc.connect(owner).mint(owner.address, ethers.parseUnits("4000", 6));
        await usdc.connect(owner).transfer(investor1.address, ethers.parseUnits("1000", 6));
        await usdc.connect(owner).transfer(investor2.address, ethers.parseUnits("1000", 6));
        await usdc.connect(owner).transfer(creator.address, ethers.parseUnits("1000", 6));

        // Investors approve the ProjectManagement contract to spend their USDC
        await usdc.connect(investor1).approve(projectManagement.target, ethers.parseUnits("1000", 6));
        await usdc.connect(investor2).approve(projectManagement.target, ethers.parseUnits("1000", 6));
        await usdc.connect(creator).approve(projectManagement.target, ethers.parseUnits("1000", 6));
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

        it("Should fail deployment if platform fee exceeds 100%", async function () {
            const ProjectManagementFactory = await ethers.getContractFactory("ProjectManagement");
            const invalidFee = 10001; // > 10000 (100%)
            await expect(ProjectManagementFactory.deploy(
                creator.address, fundingGoal, fundingDuration, projectToken.target,
                usdc.target, platformOwner.address, invalidFee, rewardFeePercentage
            )).to.be.revertedWith("Platform fee cannot exceed 100%");
        });

        it("Should fail deployment if reward fee exceeds 100%", async function () {
            const ProjectManagementFactory = await ethers.getContractFactory("ProjectManagement");
            const invalidFee = 10001; // > 10000 (100%)
            await expect(ProjectManagementFactory.deploy(
                creator.address, fundingGoal, fundingDuration, projectToken.target,
                usdc.target, platformOwner.address, platformFeePercentage, invalidFee
            )).to.be.revertedWith("Reward fee cannot exceed 100%");
        });
    });

    describe("Funding Phase: invest()", function () {
        it("Should allow an investor to contribute funds", async function () {
            const investmentAmount = ethers.parseUnits("10", 6);
            await expect(projectManagement.connect(investor1).invest(investmentAmount))
                .to.emit(projectManagement, "Invested")
                .withArgs(investor1.address, investmentAmount);

            expect(await projectManagement.contributions(investor1.address)).to.equal(investmentAmount);
            expect(await projectManagement.totalContributions()).to.equal(investmentAmount);
            expect(await usdc.balanceOf(projectManagement.target)).to.equal(investmentAmount);
        });

        it("Should add a new contributor to the contributors array", async function () {
            await projectManagement.connect(investor1).invest(ethers.parseUnits("10", 6));
            expect(await projectManagement.contributors(0)).to.equal(investor1.address);
        });

        it("Should not add an existing contributor to the array again", async function () {
            await projectManagement.connect(investor1).invest(ethers.parseUnits("10", 6));
            await projectManagement.connect(investor1).invest(ethers.parseUnits("5", 6));
            await expect(projectManagement.contributors(1)).to.be.reverted;
        });

        it("Should fail if investment exceeds the remaining amount to reach the goal", async function () {
            await expect(projectManagement.connect(investor1).invest(fundingGoal + ethers.parseUnits("1", 6))).to.be.revertedWith("Investment amount exceeds funding goal");
        });

        it("Should fail if the fundraising deadline has passed", async function () {
            await time.increase(fundingDuration + 1);
            await expect(projectManagement.connect(investor1).invest(ethers.parseUnits("10", 6))).to.be.revertedWith("Fundraising has ended");
        });

        it("Should fail if trying to invest when not in 'Funding' state", async function () {
            // Meet goal to change state to Succeeded
            await projectManagement.connect(investor1).invest(fundingGoal);
            expect(await projectManagement.currentState()).to.equal(1); // State.Succeeded
            await expect(projectManagement.connect(investor2).invest(ethers.parseUnits("1", 6)))
                .to.be.revertedWith("Invalid state");
        });

        it("Should transition state to 'Succeeded' when the funding goal is met exactly", async function () {
            await projectManagement.connect(investor1).invest(fundingGoal);
            expect(await projectManagement.currentState()).to.equal(1); // State.Succeeded
        });
    });

    describe("Succeeded Phase: mintTokens()", function () {
        beforeEach(async function () {
            // Reach the funding goal to enter the Succeeded state
            await projectManagement.connect(investor1).invest(ethers.parseUnits("60", 6));
            await projectManagement.connect(investor2).invest(ethers.parseUnits("40", 6));
        });

        it("Should only be callable by the creator", async function () {
            await expect(projectManagement.connect(investor1).mintTokens(2)).to.be.revertedWith("Not the creator");
        });

        it("Should only be callable in the 'Succeeded' state", async function () {
            // Create a new instance that is still in Funding state
            const newPM = await (await ethers.getContractFactory("ProjectManagement")).deploy(
                creator.address, fundingGoal, fundingDuration, projectToken.target, 
                usdc.target, platformOwner.address, platformFeePercentage, rewardFeePercentage
            );
            await expect(newPM.connect(creator).mintTokens(1)).to.be.revertedWith("Invalid state");
        });
        
        it("Should mint tokens in batches and skip already minted contributors", async function () {
            // Mint for the first contributor
            await projectManagement.connect(creator).mintTokens(1);
            expect(await projectToken.balanceOf(investor1.address)).to.equal(ethers.parseUnits("60", 6));
            expect(await projectToken.balanceOf(investor2.address)).to.equal(0);
            expect(await projectManagement.mintedContributorCount()).to.equal(1);
            expect(await projectManagement.areTokensMinted()).to.be.false;

            // Mint again with a limit of 2. It should skip investor1 (index 0) and mint for investor2 (index 1)
            await projectManagement.connect(creator).mintTokens(2); // This will process i=1 (investor2)
            expect(await projectToken.balanceOf(investor1.address)).to.equal(ethers.parseUnits("60", 6)); // Unchanged
            expect(await projectToken.balanceOf(investor2.address)).to.equal(ethers.parseUnits("40", 6)); // Newly minted
            expect(await projectManagement.mintedContributorCount()).to.equal(2);
            expect(await projectManagement.areTokensMinted()).to.be.true; // Now true
        });

        it("Should transition to 'Active' state and handle limit > contributors", async function () {
            // Mint for all contributors with a limit (5) larger than total contributors (2)
            // This forces the `if (end > totalContributors)` branch (line 108-109) to execute
            await projectManagement.connect(creator).mintTokens(5); 
            expect(await projectManagement.currentState()).to.equal(3); // State.Active
            expect(await projectManagement.areTokensMinted()).to.be.true;
            
            // Check balances
            expect(await projectToken.balanceOf(investor1.address)).to.equal(ethers.parseUnits("60", 6));
            expect(await projectToken.balanceOf(investor2.address)).to.equal(ethers.parseUnits("40", 6));

            // Now that the state is Active, calling mintTokens again should fail with 'Invalid state'
            await expect(projectManagement.connect(creator).mintTokens(1)).to.be.revertedWith("Invalid state");
        });

        it("Should emit TokensMinted event when all tokens are minted", async function () {
             await expect(projectManagement.connect(creator).mintTokens(2))
                .to.emit(projectManagement, "TokensMinted")
                .withArgs(fundingGoal);
        });

        it("Should fail to deposit rewards if tokens have not been minted", async function () {
            // We are in 'Succeeded' state, but tokens are not minted yet
            expect(await projectToken.totalSupply()).to.equal(0);
            const rewardAmount = ethers.parseUnits("10", 6);
            await usdc.connect(creator).approve(projectManagement.target, rewardAmount);

            await expect(projectManagement.connect(creator).depositReward(rewardAmount))
                .to.be.revertedWith("Invalid state");
        });
    });

    describe("Active Phase: withdrawFunds() & Rewards", function () {
        beforeEach(async function () {
            await projectManagement.connect(investor1).invest(ethers.parseUnits("60", 6));
            await projectManagement.connect(investor2).invest(ethers.parseUnits("40", 6));
            await projectManagement.connect(creator).mintTokens(2);
        });

        it("Should allow creator to withdraw all contributed funds", async function () {
            const contractBalance = await usdc.balanceOf(projectManagement.target);
            const creatorInitialBalance = await usdc.balanceOf(creator.address);
            const platformOwnerInitialBalance = await usdc.balanceOf(platformOwner.address);
            expect(contractBalance).to.equal(fundingGoal);

            const platformFee = (fundingGoal * BigInt(platformFeePercentage)) / 10000n;
            const creatorAmount = fundingGoal - platformFee;

            await expect(projectManagement.connect(creator).withdrawFunds())
                .to.emit(projectManagement, "FundsWithdrawn")
                .withArgs(creatorAmount, platformFee);
            
            expect(await usdc.balanceOf(projectManagement.target)).to.equal(0);
            expect(await usdc.balanceOf(creator.address)).to.equal(creatorInitialBalance + creatorAmount);
            expect(await usdc.balanceOf(platformOwner.address)).to.equal(platformOwnerInitialBalance + platformFee);
        });

        it("Should fail to withdraw funds if balance is zero", async function () {
            // Withdraw first time
            await projectManagement.connect(creator).withdrawFunds();
            expect(await usdc.balanceOf(projectManagement.target)).to.equal(0);
            
            // Attempt to withdraw again
            await expect(projectManagement.connect(creator).withdrawFunds())
                .to.be.revertedWith("No funds to withdraw");
        });

        it("Should prevent non-creators from withdrawing funds", async function () {
            await expect(projectManagement.connect(investor1).withdrawFunds()).to.be.revertedWith("Not the creator");
        });

        it("Should allow creator to deposit rewards", async function () {
            const rewardAmount = ethers.parseUnits("10", 6);
            await usdc.connect(creator).approve(projectManagement.target, rewardAmount);
            const platformFee = (rewardAmount * BigInt(rewardFeePercentage)) / 10000n;
            const netRewardAmount = rewardAmount - platformFee;
            
            await expect(projectManagement.connect(creator).depositReward(rewardAmount))
                .to.emit(projectManagement, "RewardDeposited")
                .withArgs(netRewardAmount, platformFee);
            
            const expectedRewardPerToken = (netRewardAmount * BigInt(1e18)) / fundingGoal;
            expect(await projectManagement.rewardPerTokenStored()).to.equal(expectedRewardPerToken);
        });

        it("Should calculate and allow claiming of rewards", async function () {
            // Deposit rewards
            const rewardAmount = ethers.parseUnits("10", 6);
            await usdc.connect(creator).approve(projectManagement.target, rewardAmount);
            await projectManagement.connect(creator).depositReward(rewardAmount);

            // Check earned amount for investor1 (60% contribution)
            const expectedReward1 = (ethers.parseUnits("60", 6) * (await projectManagement.rewardPerTokenStored())) / BigInt(1e18);
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
            const rewardPerTokenBefore = await projectManagement.rewardPerTokenStored();
            await expect(projectManagement.connect(creator).depositReward(0))
                .to.emit(projectManagement, "RewardDeposited")
                .withArgs(0, 0);
            
            // Reward per token should not change
            const rewardPerTokenAfter = await projectManagement.rewardPerTokenStored();
            expect(rewardPerTokenAfter).to.equal(rewardPerTokenBefore);
        });

        it("Should fail to claim rewards if there are no rewards", async function () {
            // No rewards have been deposited
            await expect(projectManagement.connect(investor1).claimReward())
                .to.be.revertedWith("No rewards to claim");

            // Deposit and claim once
            const rewardAmount = ethers.parseUnits("10", 6);
            await usdc.connect(creator).approve(projectManagement.target, rewardAmount);
            await projectManagement.connect(creator).depositReward(rewardAmount);
            await projectManagement.connect(investor1).claimReward();

            // Try to claim a second time
            await expect(projectManagement.connect(investor1).claimReward())
                .to.be.revertedWith("No rewards to claim");
        });
    });

    describe("Failed Phase: checkCampaignFailed() & claimRefund()", function () {
        beforeEach(async function () {
            // Investor contributes, but not enough to meet the goal
            await projectManagement.connect(investor1).invest(ethers.parseUnits("10", 6));
        });

        it("Should not allow checking for failure before the deadline", async function () {
            await expect(projectManagement.checkCampaignFailed()).to.be.revertedWith("Campaign deadline has not passed yet");
        });

        it("Should not transition to Failed if goal was met", async function () {
            await projectManagement.connect(investor2).invest(fundingGoal - (ethers.parseUnits("10", 6)));
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

            const contributionAmount = ethers.parseUnits("10", 6);
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