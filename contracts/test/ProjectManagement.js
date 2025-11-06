const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("ProjectManagement", function () {
    let ProjectManagement, projectManagement, ProjectToken, projectToken, USDC, usdc, owner, creator, investor1, investor2, platformOwner;
    
    // Using 6 decimals as per your contract
    const fundingGoal = ethers.parseUnits("100", 6); 
    const fundingDuration = 60 * 60 * 24 * 7; // 7 days
    const platformFeePercentage = 1000; // 10%
    const rewardFeePercentage = 500; // 5%

    beforeEach(async function () {
        [owner, creator, investor1, investor2, platformOwner] = await ethers.getSigners();

        // Deploy a mock USDC token (using ProjectToken contract as it's a standard ERC20 with 6 decimals)
        USDC = await ethers.getContractFactory("ProjectToken");
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
        await projectToken.connect(owner).setMinter(projectManagement.target);
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
            await projectManagement.connect(investor1).invest(ethers.parseUnits("60", 6));
            await projectManagement.connect(investor2).invest(ethers.parseUnits("40", 6));
        });

        it("Should only be callable by the creator", async function () {
            await expect(projectManagement.connect(investor1).mintTokens(2)).to.be.revertedWith("Not the creator");
        });

        it("Should only be callable in the 'Succeeded' state", async function () {
            const newPM = await (await ethers.getContractFactory("ProjectManagement")).deploy(
                creator.address, fundingGoal, fundingDuration, projectToken.target, 
                usdc.target, platformOwner.address, platformFeePercentage, rewardFeePercentage
            );
            await expect(newPM.connect(creator).mintTokens(1)).to.be.revertedWith("Invalid state");
        });
        
        it("Should mint tokens in batches and skip already minted contributors", async function () {
            await projectManagement.connect(creator).mintTokens(1);
            expect(await projectToken.balanceOf(investor1.address)).to.equal(ethers.parseUnits("60", 6));
            expect(await projectToken.balanceOf(investor2.address)).to.equal(0);
            expect(await projectManagement.mintedContributorCount()).to.equal(1);
            expect(await projectManagement.areTokensMinted()).to.be.false;

            // Mint again. It should skip investor1 (index 0) and mint for investor2 (index 1)
            await projectManagement.connect(creator).mintTokens(2); 
            expect(await projectToken.balanceOf(investor1.address)).to.equal(ethers.parseUnits("60", 6)); // Unchanged
            expect(await projectToken.balanceOf(investor2.address)).to.equal(ethers.parseUnits("40", 6)); // Newly minted
            expect(await projectManagement.mintedContributorCount()).to.equal(2);
            expect(await projectManagement.areTokensMinted()).to.be.true; 
        });

        it("Should transition to 'Active' state and handle limit > contributors", async function () {
            await projectManagement.connect(creator).mintTokens(5); // Limit 5 > 2 contributors
            expect(await projectManagement.currentState()).to.equal(3); // State.Active
            expect(await projectManagement.areTokensMinted()).to.be.true;
            expect(await projectToken.balanceOf(investor1.address)).to.equal(ethers.parseUnits("60", 6));
            expect(await projectToken.balanceOf(investor2.address)).to.equal(ethers.parseUnits("40", 6));
        });

        it("Should fail to mint tokens if already minted", async function () {
            await projectManagement.connect(creator).mintTokens(2); // Mint all
            expect(await projectManagement.areTokensMinted()).to.be.true;
            // Try to mint again
            await expect(projectManagement.connect(creator).mintTokens(1))
                .to.be.revertedWith("Invalid state");
        });

        it("Should emit TokensMinted event when all tokens are minted", async function () {
             await expect(projectManagement.connect(creator).mintTokens(2))
                .to.emit(projectManagement, "TokensMinted")
                .withArgs(fundingGoal);
        });

        it("Should fail to deposit rewards if tokens not minted yet (totalSupply is 0)", async function () {
            // State is 'Succeeded', but mintTokens has not been called
            expect(await projectManagement.currentState()).to.equal(1); // State.Succeeded
            expect(await projectToken.totalSupply()).to.equal(0);           
            const rewardAmount = ethers.parseUnits("10", 6);
            await usdc.connect(creator).approve(projectManagement.target, rewardAmount);

            await expect(projectManagement.connect(creator).depositReward(rewardAmount))
                .to.be.revertedWith("Invalid state");
        });

        it("Should fail to withdraw fund if tokens not minted yet", async function () {
            // State is 'Succeeded', but mintTokens has not been called
            expect(await projectManagement.currentState()).to.equal(1);
            await expect(projectManagement.connect(creator).withdrawFunds())
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
            await projectManagement.connect(creator).withdrawFunds();
            expect(await usdc.balanceOf(projectManagement.target)).to.equal(0);
            
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
        
        it("Should prevent non-creators from depositing rewards", async function () {
            const rewardAmount = ethers.parseUnits("10", 6);
            await usdc.connect(investor1).approve(projectManagement.target, rewardAmount); // Investor approves
            await expect(projectManagement.connect(investor1).depositReward(rewardAmount)) // Investor calls
                .to.be.revertedWith("Not the creator");
        });

        it("Should calculate and allow claiming of rewards", async function () {
            const rewardAmount = ethers.parseUnits("10", 6);
            await usdc.connect(creator).approve(projectManagement.target, rewardAmount);
            await projectManagement.connect(creator).depositReward(rewardAmount);

            const expectedReward1 = (ethers.parseUnits("60", 6) * (await projectManagement.rewardPerTokenStored())) / BigInt(1e18);
            expect(await projectManagement.earned(investor1.address)).to.be.closeTo(expectedReward1, 1);

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
            
            const rewardPerTokenAfter = await projectManagement.rewardPerTokenStored();
            expect(rewardPerTokenAfter).to.equal(rewardPerTokenBefore);
        });

        it("Should fail to claim rewards if there are no rewards", async function () {
            await expect(projectManagement.connect(investor1).claimReward())
                .to.be.revertedWith("No rewards to claim");

            const rewardAmount = ethers.parseUnits("10", 6);
            await usdc.connect(creator).approve(projectManagement.target, rewardAmount);
            await projectManagement.connect(creator).depositReward(rewardAmount);
            await projectManagement.connect(investor1).claimReward();

            await expect(projectManagement.connect(investor1).claimReward())
                .to.be.revertedWith("No rewards to claim");
        });
    });

    describe("Failed Phase: checkCampaignFailed() & claimRefund()", function () {
        beforeEach(async function () {
            await projectManagement.connect(investor1).invest(ethers.parseUnits("10", 6));
        });

        it("Should not allow checking for failure before the deadline", async function () {
            await expect(projectManagement.checkCampaignFailed()).to.be.revertedWith("Campaign deadline has not passed yet");
        });

        it("Should not transition to Failed if goal was met", async function () {
            await projectManagement.connect(investor2).invest(fundingGoal - (ethers.parseUnits("10", 6)));
            await time.increase(fundingDuration + 1);
            // State is 'Succeeded', so checkCampaignFailed (which requires 'Funding') will fail
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
            await projectManagement.connect(investor1).claimRefund();
            await expect(projectManagement.connect(investor1).claimRefund())
                .to.be.revertedWith("No contribution to refund");
        });
    });

    describe("Zero Fee Scenarios", function () {
        
        beforeEach(async function () {
            // Deploy a new contract with 0% fees
            const ProjectManagementFactory = await ethers.getContractFactory("ProjectManagement");
            projectManagement = await ProjectManagementFactory.deploy(
                creator.address,
                fundingGoal,
                fundingDuration,
                projectToken.target,
                usdc.target,
                platformOwner.address,
                0, // 0% platform fee
                0  // 0% reward fee
            );

            // Re-link tokens
            await projectToken.connect(owner).setMinter(projectManagement.target);
            await projectToken.connect(owner).setProjectManagement(projectManagement.target);

            // Re-approve
            await usdc.connect(investor1).approve(projectManagement.target, ethers.parseUnits("1000", 6));
            await usdc.connect(creator).approve(projectManagement.target, ethers.parseUnits("1000", 6));
        });

        it("Should transfer 100% of funds to creator when platformFee is 0", async function () {
            await projectManagement.connect(investor1).invest(fundingGoal);
            await projectManagement.connect(creator).mintTokens(1);
            
            const creatorInitialBalance = await usdc.balanceOf(creator.address);
            const platformOwnerInitialBalance = await usdc.balanceOf(platformOwner.address);

            await projectManagement.connect(creator).withdrawFunds();

            // Creator gets 100%
            expect(await usdc.balanceOf(creator.address)).to.equal(creatorInitialBalance + fundingGoal);
            // Platform owner gets 0
            expect(await usdc.balanceOf(platformOwner.address)).to.equal(platformOwnerInitialBalance);
        });

        it("Should use 100% of deposited reward when rewardFee is 0", async function () {
            await projectManagement.connect(investor1).invest(fundingGoal);
            await projectManagement.connect(creator).mintTokens(1);

            const rewardAmount = ethers.parseUnits("10", 6);
            await usdc.connect(creator).approve(projectManagement.target, rewardAmount);
            
            await projectManagement.connect(creator).depositReward(rewardAmount);

            // rewardPerTokenStored should be calculated based on the full rewardAmount
            const expectedRewardPerToken = (rewardAmount * BigInt(1e18)) / fundingGoal;
            expect(await projectManagement.rewardPerTokenStored()).to.equal(expectedRewardPerToken);
        });
    });

    // describe("Re-entrancy Protection", function () {
    //     let attacker;

    //     beforeEach(async function () {
    //         // Deploy an attacker contract
    //         const AttackerFactory = await ethers.getContractFactory("MockReentrancyAttacker");
    //         attacker = await AttackerFactory.deploy(projectManagement.target);

    //         // Fund the attacker contract with USDC
    //         await usdc.connect(owner).transfer(attacker.target, ethers.parseUnits("50", 6));
    //         await attacker.approveUSDCTransfer();

    //         // Attacker invests to become a contributor
    //         await attacker.invest(ethers.parseUnits("50", 6));
    //     });

    //     it("Should prevent re-entrancy in invest()", async function () {
    //         // This is hard to test without a re-entrant token, but we can test other functions.
    //     });

    //     it("Should prevent re-entrancy in withdrawFunds()", async function () {
    //         // This function is not re-entrant by default as it's not called by investors.
    //         // But we test claimReward and claimRefund.
    //     });

    //     it("Should prevent re-entrancy in claimReward()", async function () {
    //         // Fund the project fully
    //         await projectManagement.connect(investor1).invest(ethers.parseUnits("50", 6));
    //         await projectManagement.connect(creator).mintTokens(2);
            
    //         // Deposit rewards
    //         const rewardAmount = ethers.parseUnits("10", 6);
    //         await usdc.connect(creator).approve(projectManagement.target, rewardAmount);
    //         await projectManagement.connect(creator).depositReward(rewardAmount);

    //         // Attacker tries to claim and re-enter
    //         await expect(attacker.attackClaimReward()).to.be.revertedWith("ReentrancyGuard: reentrant call");
    //     });

    //     it("Should prevent re-entrancy in claimRefund()", async function () {
    //         // Fail the campaign
    //         await time.increase(fundingDuration + 1);
    //         await projectManagement.checkCampaignFailed();

    //         // Attacker tries to claim refund and re-enter
    //         await expect(attacker.attackClaimRefund()).to.be.revertedWith("ReentrancyGuard: reentrant call");
    //     });
    // });
});