// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./IOracle.sol";

contract WeiUsdOracle is IOracle, Ownable {
  uint private lastRatio = 0;
  uint public lastUpdate = 0;

  constructor (uint ethPriceInPenny) Ownable() {
    uint weisPerPenny = calculateWeiRatio(ethPriceInPenny);
    lastRatio = weisPerPenny;
    lastUpdate = block.timestamp;
  }

  function calculateWeiRatio (uint ethPriceInPenny) internal pure returns (uint) {
    return (10 ** 18) / ethPriceInPenny;
  }
 
  function getWeiRatio() external view returns (uint) {
    return lastRatio;
  }

  function setEthPrice(uint ethPriceInPenny) external {
    require(ethPriceInPenny > 0, "ETH price cannot be zero.");
    uint weisPerPenny = calculateWeiRatio(ethPriceInPenny);
    require(weisPerPenny > 0, "Wei Ratio cannot be zero.");

    lastRatio = weisPerPenny;
    lastUpdate = block.timestamp;
  }
}