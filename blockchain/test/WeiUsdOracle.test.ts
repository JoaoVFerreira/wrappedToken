import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Oracle Tests", function () {
  const USDA_2K = 200000;

  async function deployOneYearLockFixture() {
    const WeiUsdOracle = await ethers.getContractFactory("WeiUsdOracle");
    const oracle = await WeiUsdOracle.deploy(USDA_2K);

    const Rebase = await ethers.getContractFactory("Rebase");
    const rebase = await Rebase.deploy();

    return { oracle, rebase };
  }

  it('Should get wei Ratio', async () => {
    // ARRANGE
    const { oracle } = await loadFixture(deployOneYearLockFixture)

    // ACT
    const weiRatio = await oracle.getWeiRatio()

    // ASSERT
    expect(weiRatio).to.equal("5000000000000") // 1 * 10 ** 18 wei = 2k * 100 cents
  })

  it('Should set ETH price', async () => {
    // ARRANGE
    const { oracle } = await loadFixture(deployOneYearLockFixture)

    // ACT
    await oracle.setEthPrice(400000)
    const newPrice = await oracle.getWeiRatio()

    // ASSERT
    expect(newPrice).to.equal("2500000000000")
  })

  it('Should emit event AllUpdated when setting ETH price', async () => {
    // ARRANGE
    const { oracle, rebase } = await loadFixture(deployOneYearLockFixture)

    // ACT 
    await oracle.subscribe(rebase.target)

    // ASSERT
    await expect(oracle.setEthPrice(400000))
      .to.emit(oracle, 'AllUpdated')
      .withArgs([rebase.target])
  })

  it('Should subscribe', async () => {
    // ARRANGE
    const { oracle, rebase } = await loadFixture(deployOneYearLockFixture)

    // ACT && ASSERT
    await expect(oracle.subscribe(rebase.target))
      .to.emit(oracle, 'Subscribed')
      .withArgs(rebase.target)
  })

  it('Should unsubscribe', async () => {
    // ARRANGE
    const { oracle, rebase } = await loadFixture(deployOneYearLockFixture)

    // ACT
    await oracle.subscribe(rebase.target)

    // ASSERT
    await expect(oracle.unsubscribe(rebase.target))
      .to.emit(oracle, 'Unsubscribed')
      .withArgs(rebase.target)
  })

  it('Should throw when trying to subscribe an empty address', async () => {
    // ARRANGE
    const { oracle } = await loadFixture(deployOneYearLockFixture)

    // ACT && ASSERT
    await expect(oracle.subscribe(ethers.ZeroAddress))
      .to.be.revertedWith('Subscriber cannot be zero.')
  })

  it('Should throw when trying to unsubscribe an empty address', async () => {
    // ARRANGE
    const { oracle } = await loadFixture(deployOneYearLockFixture)

    // ACT && ASSERT
    await expect(oracle.unsubscribe(ethers.ZeroAddress))
      .to.be.revertedWith('Subscriber cannot be zero.')
  })
});
