// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./IOracleConsumer.sol";
import "./IStableCoin.sol";
import "./IOracle.sol";

contract Rebase is IOracleConsumer, Ownable, Pausable {
  address public oracle;
  address public stableCoin;
  mapping (address => uint) public ehtBalance; // customer -> balance(wei)
  uint public lastUpdate; // timestamp in seconds
  uint private updateTolerance = 300; // in seconds

  constructor (address oracleAddress, address stableCoinAddress) Ownable(msg.sender) {
    oracle = oracleAddress;
    stableCoin = stableCoinAddress;
  }

  function initialize(uint weisPerPenny) external payable onlyOwner {
    require(weisPerPenny > 0, "Wei ratio cannot be zero.");
    require(msg.value >= 0, "Value cannot be less than wei ratio.");

    ehtBalance[msg.sender] = msg.value;
    IStableCoin(stableCoin).mint(msg.sender, msg.value / weisPerPenny);
    lastUpdate = block.timestamp;
  }

  function getParity(uint weisPerPenny) public view returns (uint) {
    if (weisPerPenny == 0) {
      weisPerPenny = IOracle(oracle).getWeiRatio();
    }
    uint tokensSupply = (IStableCoin(stableCoin).totalSupply() * 100);
    uint ehtContractBalance = (address(this).balance / weisPerPenny);
    return tokensSupply / ehtContractBalance;
  }

  function setUpdateTolerance(uint newToleranceInSeconds) external onlyOwner {
    require(newToleranceInSeconds > 0, "Tolerance in seconds cannot be zero.");
    updateTolerance = newToleranceInSeconds;
  }

  function setOracle(address newOracle) external onlyOwner {
    require(newOracle != address(0), "Oracle address cannot be zero");
    oracle = newOracle;
  }

  function update(uint weisPerPenny) external {
    require(msg.sender == oracle, "Only the oracle can make this call.");
    uint oldSuppy = IStableCoin(stableCoin).totalSupply();
    uint newSupply = adjustSupply(weisPerPenny);
    
    if (newSupply != 0) {
      lastUpdate = block.timestamp;  
      emit Updated(lastUpdate, oldSuppy, newSupply);
    }
  }

  function adjustSupply(uint weisPerPenny) internal returns (uint) {
    uint parity = getParity(weisPerPenny);
    if (parity == 0) {
      _pause();
      return 0;
    }

    IStableCoin algoDollar = IStableCoin(stableCoin);
    uint totalSupply = algoDollar.totalSupply();

    if (parity == 100) {
      return totalSupply;
    }

    if (parity > 100) {
      uint amounToBurn = (totalSupply * (parity - 100) / 100);
      algoDollar.burn(owner(), amounToBurn);
    } else if (parity < 100) {
      uint amounToMint = (totalSupply * (100 - parity) / 100);
      algoDollar.mint(owner(), amounToMint);
    }
    return algoDollar.totalSupply();
  }

  function pause() public onlyOwner {
    _pause();
  }

  function unpause() public onlyOwner {
    _unpause();
  }

  function deposit() external payable whenNotPaused whenNotOutdated {
    uint weisPerPenny = IOracle(oracle).getWeiRatio();
    require(msg.value >= weisPerPenny, "Insufficient deposit.");

    ehtBalance[msg.sender] = msg.value;
    uint tokens = msg.value / weisPerPenny;
    IStableCoin(stableCoin).mint(msg.sender, tokens);
  }

  function withdrawEth(uint amountEth) external whenNotPaused whenNotOutdated {
    require(ehtBalance[msg.sender] >= amountEth, "Insufficient balance.");
    ehtBalance[msg.sender] -= amountEth;
    uint weisPerPenny = IOracle(oracle).getWeiRatio();
    uint tokens = amountEth / weisPerPenny;
    IStableCoin(stableCoin).burn(msg.sender, tokens);
    payable(msg.sender).transfer(amountEth);
  }

  function withdrawUsda(uint amountUsda) external whenNotPaused whenNotOutdated {
    require(IStableCoin(stableCoin).balanceOf(msg.sender) >= amountUsda, "Insufficient USDA balance.");
    IStableCoin(stableCoin).burn(msg.sender, amountUsda);
    uint weisPerPenny = IOracle(oracle).getWeiRatio();
    uint amountEth = amountUsda * weisPerPenny;
    ehtBalance[msg.sender] -= amountEth;
    payable(msg.sender).transfer(amountEth);
  }

  modifier whenNotOutdated() {
    require(lastUpdate >= (block.timestamp - updateTolerance), "Rebase contract is paused. Try again later or contact the admin.");
    _;
  }
}