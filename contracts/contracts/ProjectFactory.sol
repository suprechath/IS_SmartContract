// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./ProjectToken.sol";
import "./ProjectManagement.sol";

contract ProjectFactory {
    address public immutable platformOwner;

    event ProjectDeployed(
        address indexed creator,
        bytes32 indexed projectId,
        address tokenContract,
        address managementContract
    );

    constructor() {
        platformOwner = msg.sender;
    }

    function createProject(
        bytes32 projectId,
        address creator,
        string memory tokenName,
        string memory tokenSymbol,
        uint256 fundingGoal,
        uint256 fundingDuration,
        address usdcTokenAddress,
        uint256 platformFee,
        uint256 rewardFee
    ) external {
        // Step 1: Deploy ProjectToken
        ProjectToken token = new ProjectToken(
            tokenName,
            tokenSymbol,
            fundingGoal
        );
        address tokenContractAddress = address(token);

        // Step 2: Deploy ProjectManagement
        ProjectManagement management = new ProjectManagement(
            creator,
            fundingGoal,
            fundingDuration,
            tokenContractAddress,
            usdcTokenAddress,
            platformOwner,
            platformFee,
            rewardFee
        );
        address managementContractAddress = address(management);

        // Step 3 & 4: Link the contracts by transferring ownership and setting minter
        token.setProjectManagement(managementContractAddress);
        token.setMinter(managementContractAddress);
        token.transferOwnership(managementContractAddress);

        emit ProjectDeployed(
            creator,
            projectId,
            tokenContractAddress,
            managementContractAddress
        );
    }
}