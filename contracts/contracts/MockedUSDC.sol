// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract MockedUSCD is ERC20, Ownable, ERC20Permit {
    constructor(address recipient, address initialOwner)
        ERC20("Mocked USCD", "USCD")
        Ownable(initialOwner)
        ERC20Permit("Mocked USCD")
    {
        _mint(recipient, 100000 * 6 ** decimals());
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}