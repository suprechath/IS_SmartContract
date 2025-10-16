// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "./IProjectManagement.sol"; //Import the interface

contract ProjectToken is ERC20, Ownable, ERC20Capped {
    address public minter;
    // The management contract that handles reward distribution
    IProjectManagement public projectManagement;

    event MinterChanged(address indexed newMinter);
    event ManagementContractSet(address indexed managementContract);

    constructor(
        string memory name,
        string memory symbol,
        uint256 cap
    ) 
        ERC20(name, symbol) 
        ERC20Capped(cap) 
        Ownable(msg.sender) 
    {
    }

    function decimals() public view virtual override returns (uint8) {
        return 6;
    }

    function setProjectManagement(address _managementAddress) public onlyOwner {
        projectManagement = IProjectManagement(_managementAddress);
        emit ManagementContractSet(_managementAddress);
    }

    function setMinter(address _minter) public onlyOwner {
        minter = _minter;
        emit MinterChanged(_minter);
    }

    function mint(address to, uint256 amount) public {
        require(msg.sender == minter, "ProjectToken: Caller is not the minter");
        _mint(to, amount);
    }

    //This hook is called before any token transfer, mint, or burn.
    function _update(address from, address to, uint256 value) internal override(ERC20, ERC20Capped) {
        if (address(projectManagement) != address(0)) {
            // projectManagement.updateReward(from);
            projectManagement.updateReward(from);
            projectManagement.updateReward(to);
        }
        super._update(from, to, value);
    }
}