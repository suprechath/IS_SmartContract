// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ProjectToken.sol";

contract ProjectManagement is ReentrancyGuard, Ownable {
    
    enum State { Funding, Succeeded, Failed, Active }

    // --- State Variables ---
    State public currentState;
    IERC20 public usdcToken;
    ProjectToken public projectToken;
    
    address public creator;
    uint256 public fundingGoal;
    uint256 public deadline;
    uint256 public totalContributions;
    uint256 public mintedContributorCount = 0;
    uint256 public totalMintedToken = 0;

    mapping(address => uint256) public contributions;
    address[] public contributors;
    
    bool public areTokensMinted;
    
    uint256 public rewardPerTokenStored;
    mapping(address => uint256) public rewards;
    mapping(address => uint256) public userRewardPerTokenPaid;

    // --- Events ---
    event Invested(address indexed investor, uint256 amount);
    event TokensMinted(uint256 totalAmount);
    event FundsWithdrawn(uint256 amount);
    event RewardDeposited(uint256 totalAmount);
    event RewardClaimed(address indexed investor, uint256 amount);
    event Refunded(address indexed investor, uint256 amount);

    constructor(
        address _creator,
        uint256 _fundingGoal,
        uint256 _fundingDuration,
        address _projectTokenAddress,
        address _usdcTokenAddress,
        address _platformOwner
    ) 
        Ownable(_platformOwner)
    {
        creator = _creator;
        fundingGoal = _fundingGoal;
        deadline = block.timestamp + _fundingDuration;
        projectToken = ProjectToken(_projectTokenAddress);
        usdcToken = IERC20(_usdcTokenAddress);
        currentState = State.Funding;
    }
    
    // --- Modifiers ---
    modifier inState(State _state) {
        require(currentState == _state, "Invalid state");
        _;
    }

    modifier onlyCreator() {
        require(msg.sender == creator, "Not the creator");
        _;
    }

    function invest(uint256 usdcAmount) public inState(State.Funding) nonReentrant {
        require(block.timestamp < deadline, "Fundraising has ended");
        uint256 remainingAmount = fundingGoal - totalContributions;
        require(usdcAmount <= remainingAmount, "Investment amount exceeds funding goal");
        
        usdcToken.transferFrom(msg.sender, address(this), usdcAmount);// Pull the USDC from the investor

        if (contributions[msg.sender] == 0) {
            contributors.push(msg.sender);
        }
        contributions[msg.sender] += usdcAmount;
        totalContributions += usdcAmount;
        emit Invested(msg.sender, usdcAmount);

        if (totalContributions == fundingGoal) {
            currentState = State.Succeeded;
        }
    } 

    // mintTokens() Function with Batching
    function mintTokens(uint256 _limit) public onlyCreator inState(State.Succeeded) {
        require(!areTokensMinted, "All tokens have already been minted");

        uint256 totalContributors = contributors.length;
        uint256 offset = mintedContributorCount; 

        uint256 end = offset + _limit;
        if (end > totalContributors) {
            end = totalContributors;
        }

        for (uint256 i = offset; i < end; i++) {
            address investor = contributors[i];
            if (projectToken.balanceOf(investor) == 0) {
                uint256 amountToMint = contributions[investor];
                projectToken.mint(investor, amountToMint);
                totalMintedToken += amountToMint;
            }
        }

        mintedContributorCount = end;

        if (mintedContributorCount == totalContributors && totalMintedToken == totalContributions) {
            areTokensMinted = true;
            currentState = State.Active; // This unlocks the withdrawFunds() function.
            emit TokensMinted(totalMintedToken);
        }
    }

    function withdrawFunds() public onlyCreator inState(State.Active) nonReentrant {
        uint256 amount = usdcToken.balanceOf(address(this));
        require(amount > 0, "No funds to withdraw");
        
        usdcToken.transfer(creator, amount);
        emit FundsWithdrawn(amount);
    }

    function depositReward(uint256 usdcAmount) public onlyCreator inState(State.Active) {
        uint256 totalSupply = projectToken.totalSupply();
        require(totalSupply > 0, "Cannot deposit with zero supply");
        usdcToken.transferFrom(msg.sender, address(this), usdcAmount);
        rewardPerTokenStored += (usdcAmount * 1e18) / totalSupply;
        emit RewardDeposited(usdcAmount);
    }
    
    function earned(address _account) public view returns (uint256) {
        uint256 newEarnings = (projectToken.balanceOf(_account) * (rewardPerTokenStored - userRewardPerTokenPaid[_account])) / 1e18;
        return rewards[_account] + newEarnings;
    }

    function updateReward(address _account) public {
        // A modifier could be added to ensure only the token contract can call this.
        rewards[_account] = earned(_account);
        userRewardPerTokenPaid[_account] = rewardPerTokenStored;
    }

    function claimReward() public nonReentrant {
        // First, update the user's reward balance to capture any earnings since their last action.
        updateReward(msg.sender);
        
        uint256 claimableAmount = rewards[msg.sender];
        require(claimableAmount > 0, "No rewards to claim");

        // Reset their reward balance to 0 before the transfer to prevent re-entrancy issues.
        rewards[msg.sender] = 0;
        usdcToken.transfer(msg.sender, claimableAmount);
        emit RewardClaimed(msg.sender, claimableAmount);
    }

    function checkCampaignFailed() public inState(State.Funding) {
        require(block.timestamp >= deadline, "Campaign deadline has not passed yet");
        require(totalContributions < fundingGoal, "Campaign succeeded, not failed");
        currentState = State.Failed;
    }

    function claimRefund() public inState(State.Failed) nonReentrant {
        uint256 refundAmount = contributions[msg.sender];
        require(refundAmount > 0, "No contribution to refund");

        // To prevent re-entrancy attacks.
        contributions[msg.sender] = 0;

        // Transfer the exact USDC amount back to the investor.
        usdcToken.transfer(msg.sender, refundAmount);
        emit Refunded(msg.sender, refundAmount);
    }
}