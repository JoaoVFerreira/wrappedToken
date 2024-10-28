// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IStableCoin.sol";

contract AlgoDollar is ERC20, ERC20Burnable, Ownable, IStableCoin {
  address public rebase;

  constructor() ERC20("AlgoDollar", "USDA") Ownable(msg.sender) {}

  function setRebase(address newRebase) external onlyOwner {
    rebase = newRebase;
  }

  function mint(address to, uint amount) external onlyAdms {
    _mint(to, amount);
  }

  function burn(address from, uint amount) external onlyAdms {
    _burn(from, amount);
  }

  function decimals() public view virtual override returns (uint8) {
    return 2;
  }

  modifier onlyAdms() {
    require(msg.sender == rebase || msg.sender == owner(), "Only rebase contract or contract owner can make this call.");
    _;
  }
}