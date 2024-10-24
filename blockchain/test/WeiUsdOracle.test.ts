import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Oracle Tests", function () {
  async function deployOneYearLockFixture() {
    const [owner, otherAccount] = await ethers.getSigners();
    const WeiUsdOracle = await ethers.getContractFactory("WeiUsdOracle");
    const oracle = await WeiUsdOracle.deploy();
    return { oracle, owner, otherAccount };
  }

  it('Should' , async () => {
    const { oracle, owner, otherAccount } = await loadFixture(deployOneYearLockFixture)
  })
});
