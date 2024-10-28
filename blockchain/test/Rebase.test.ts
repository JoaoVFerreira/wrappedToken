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

  it('Should throw when calling the function that only oracle can do it', async () => {
    // ARRANGE
    const { rebase, otherAccount } = await loadFixture(deployFixture);
    const instance = rebase.connect(otherAccount);

    // ACT && ASSERT
    await expect(instance.update(USDA_2K))
      .to.be.revertedWith('Only the oracle can make this call.')
  })

  it('Should get parity', async () => {
    // ARRANGE
    const { rebase, otherAccount } = await loadFixture(deployFixture);
    const instance = rebase.connect(otherAccount);

    // ACT
    await instance.deposit({ value: ONE_ETH })
    const parity = await instance.getParity(0);
    
    // ASSERT
    expect(parity).to.equal('100')
  })

  it('Should throw when setting new tolerance with zero', async () => {
    // ARRANGE
    const { rebase, otherAccount } = await loadFixture(deployFixture);
    const instance = rebase.connect(otherAccount);

    // ACT && ASSERT
    await expect(instance.setUpdateTolerance(0))
      .to.be.revertedWithCustomError(rebase, 'OwnableUnauthorizedAccount')
  })

  it('Should throw when setting new tolerance with zero but with owner contract', async () => {
    // ARRANGE
    const { rebase } = await loadFixture(deployFixture);

    // ACT && ASSERT
    await expect(rebase.setUpdateTolerance(0))
      .to.be.revertedWith('Tolerance in seconds cannot be zero.')
  })

  it('Should throw when setting a address zero to the new oracle', async () => {
    // ARRANGE
    const { rebase } = await loadFixture(deployFixture);

    // ACT && ASSERT
    await expect(rebase.setOracle(ethers.ZeroAddress))
      .to.be.revertedWith('Oracle address cannot be zero')
  })

  it('Should adjust supply down', async () => {
    // ARRANGE
    const { rebase, otherAccount, oracle, algoDollar } = await loadFixture(deployFixture);
    await oracle.subscribe(rebase.target);
    const instance = rebase.connect(otherAccount);
    await instance.deposit({ value: ONE_ETH });

    // ACT
    const oldSupply = await algoDollar.totalSupply();
    await oracle.setEthPrice(USDA_2K * 0.95)
    const newSupply = await algoDollar.totalSupply();
    const parity = await rebase.getParity(0);

    // ASSERT
    expect(newSupply).to.be.equal(Number(oldSupply) * 0.95);
    expect(parity).to.equal('100');
  })

  it('Should adjust supply up', async () => {
    // ARRANGE
    const { rebase, otherAccount, oracle, algoDollar } = await loadFixture(deployFixture);
    await oracle.subscribe(rebase.target);
    const instance = rebase.connect(otherAccount);
    await instance.deposit({ value: ONE_ETH });

    // ACT
    const oldSupply = await algoDollar.totalSupply();
    await oracle.setEthPrice(USDA_2K * 1.05)
    const newSupply = await algoDollar.totalSupply();
    const parity = await rebase.getParity(0);

    // ASSERT
    expect(newSupply).to.be.equal(Number(oldSupply) * 1.05);
    expect(parity).to.equal('100');
  })
});