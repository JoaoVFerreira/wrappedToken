import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Rebase Tests", function () {
  const ONE_ETH = ethers.parseEther("1");
  const USDA_2K = 200000;

  async function deployFixture() {
    const [_, otherAccount] = await ethers.getSigners();

    const AlgoDollar = await ethers.getContractFactory("AlgoDollar");
    const algoDollar = await AlgoDollar.deploy();

    const WeiUsdOracle = await ethers.getContractFactory("WeiUsdOracle");
    const oracle = await WeiUsdOracle.deploy(USDA_2K);

    const Rebase = await ethers.getContractFactory("Rebase");
    const rebase = await Rebase.deploy(oracle.target, algoDollar.target);

    await algoDollar.setRebase(rebase.target);
    const weisPerPenny = await oracle.getWeiRatio();
    await rebase.initialize(weisPerPenny, { value: ONE_ETH });

    return { oracle, algoDollar, rebase, otherAccount };
  }

  it('Should throw when passing no value or insuffient value to deposit', async () => {
    // ARRANGE
    const { rebase, otherAccount } = await loadFixture(deployFixture)
    const instance = rebase.connect(otherAccount)

    // ACT && ASSERT
    await expect(instance.deposit())
      .to.be.revertedWith('Insufficient deposit.')
  })

  it('Should deposit', async () => {
    // ARRANGE
    const { rebase, otherAccount } = await loadFixture(deployFixture)
    const instance = rebase.connect(otherAccount)

    // ACT && ASSERT
    expect(await instance.deposit({ value: ONE_ETH }))
      .to.emit(instance, 'Transfer')
      .withArgs(ethers.ZeroAddress, otherAccount.address, USDA_2K)
  })

  it("Should withdraw ETH", async function () {
    // ARRANGE
    const { rebase, otherAccount } = await loadFixture(deployFixture);
    const instance = rebase.connect(otherAccount);

    // ACT
    await instance.deposit({ value: ONE_ETH });

    // ASSERT
    expect(await instance.withdrawEth(ONE_ETH))
      .to.emit(instance, "Transfer")
      .withArgs(otherAccount.address, ethers.ZeroAddress, USDA_2K);
  });

  it("Should throw when passing no value or insufficient value to withdraw ETH", async function () {
    // ARRANGE
    const { rebase, otherAccount } = await loadFixture(deployFixture);
    const instance = rebase.connect(otherAccount);

    // ACT && ASSERT
    await expect(instance.withdrawEth(ONE_ETH))
      .to.be.revertedWith('Insufficient balance.')
  });

  it("Should withdraw USDA", async function () {
    // ARRANGE
    const { rebase, otherAccount } = await loadFixture(deployFixture);
    const instance = rebase.connect(otherAccount);

    // ACT
    await instance.deposit({ value: ONE_ETH });

    // ASSERT
    expect(await instance.withdrawUsda(USDA_2K))
      .to.emit(instance, "Transfer")
      .withArgs(otherAccount.address, ethers.ZeroAddress, USDA_2K);
  });

  it("Should throw when passing no value or insufficient value to withdraw USDA", async function () {
    // ARRANGE
    const { rebase, otherAccount } = await loadFixture(deployFixture);
    const instance = rebase.connect(otherAccount);

    // ACT && ASSERT
    await expect(instance.withdrawUsda(USDA_2K))
      .to.be.rejectedWith('Insufficient USDA balance.')
  });
});