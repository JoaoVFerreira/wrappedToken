// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

interface IOracle {
  event Subscribed(address indexed subscriber);
  event Unsubscribed(address indexed subscriber);
  event AllUpdated(address[] subscribers);

  function setEthPrice(uint weisPerPenny) external;
  function getWeiRation() external view returns (uint);
  function subscribe(address subscriber) external; 
  function unsubscribe(address subscriber) external; 
}