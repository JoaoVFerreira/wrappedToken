// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "./IOracleConsumer.sol";

contract Rebase is IOracleConsumer {
  constructor () {}

  function update(uint weisPerPenny) external override {
    emit Updated(block.timestamp, 1, 1);
  }
}