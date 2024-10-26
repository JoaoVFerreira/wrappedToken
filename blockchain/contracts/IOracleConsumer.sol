// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

interface IOracleConsumer {
  event Updated(uint indexed timestamp, uint oldSupply, uint newSupply);

  function update(uint weisPerPenny) external;
}