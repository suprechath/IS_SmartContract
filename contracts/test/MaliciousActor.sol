// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../ProjectManagement.sol";

contract MaliciousActor {
    ProjectManagement public projectManagement;

    constructor(address _projectManagementAddress) {
        projectManagement = ProjectManagement(_projectManagementAddress);
    }

    function attack() public {
        projectManagement.claimReward();
    }

    // The fallback function will be called when ProjectManagement sends USDC to this contract.
    // It will then try to call claimReward() again, triggering the re-entrancy guard.
    receive() external payable {
        projectManagement.claimReward();
    }
}
