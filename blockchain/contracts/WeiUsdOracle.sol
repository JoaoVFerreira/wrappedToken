// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./IOracle.sol";
import "./IOracleConsumer.sol";

contract WeiUsdOracle is IOracle, Ownable {
  uint private lastRatio = 0;
  uint public lastUpdate = 0;
  address[] public subscribers;

  constructor (uint ethPriceInPenny) Ownable(msg.sender) {
    uint weisPerPenny = calculateWeiRatio(ethPriceInPenny);
    lastRatio = weisPerPenny;
    lastUpdate = block.timestamp;
  }

  function calculateWeiRatio(uint ethPriceInPenny) internal pure returns (uint) {
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

    for (uint i = 0; i < subscribers.length; ++i) {
      if (subscribers[i] != address(0)) {
        IOracleConsumer(subscribers[i]).update(weisPerPenny);
      }
    }

    if (subscribers.length > 0) {
      emit AllUpdated(subscribers);
    }
  }

  function subscribe(address subscriber) external onlyOwner {
    require(subscriber != address(0), "Subscriber cannot be zero.");
    emit Subscribed(subscriber);
    for (uint i = 0; i < subscribers.length; ++i) {
      if (subscribers[i] == address(0)) {
        subscribers[i] = subscriber;
        return;
      } else if (subscribers[i] == subscriber) {
        return;
      }
    }

    subscribers.push(subscriber);
  }

  function unsubscribe(address subscriber) external onlyOwner {
    require(subscriber != address(0), "Subscriber cannot be zero.");
    for (uint i = 0; i < subscribers.length; ++i) {
      if (subscribers[i] == subscriber) {
        delete subscribers[i];
        emit Unsubscribed(subscriber);
        return;
      }
    }
  }
}