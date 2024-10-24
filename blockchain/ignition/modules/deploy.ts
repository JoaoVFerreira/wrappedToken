import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { ethers } from "hardhat";

const INITIAL_ETH_PRICE = 67;//$0.67
const INITIAL_ETH_DEPOSIT = ethers.parseEther("1");

const AlgoDollarModule = buildModule("AlgoDollarModule", (m) => {
  const algoDollar = m.contract("AlgoDollar");
  const oracle = m.contract("WeiUsdOracle", [INITIAL_ETH_PRICE]);
  const rebase = m.contract("Rebase", [oracle, algoDollar]);
  m.call(algoDollar, "setRebase", [rebase]);
  const weisPerPenny = m.call(oracle, "getWeiRatio");
  m.call(rebase, "initialize", [`${weisPerPenny}`], { value: INITIAL_ETH_DEPOSIT });
  m.call(rebase, "pause");
  return { algoDollar };
});

export default AlgoDollarModule;