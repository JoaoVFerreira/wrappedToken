import { ethers } from "ethers";
import oracleArtifacts from "./contracts/WeiUsdOracle.json";
import rebaseArtifacts from "./contracts/Rebase.json";

// const provider = new ethers.AlchemyProvider(`${process.env.NETWORK}`, `${process.env.ALCHEMY_API_KEY}`);
const provider = new ethers.JsonRpcProvider(`https://polygon-amoy.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);

async function getWeiRatio() : Promise<string>{
  const contract = new ethers.Contract(`${process.env.ORACLE_CONTRACT}`, oracleArtifacts.abi, provider);
  return contract.getWeiRatio();
}

async function getParity(weiRatio: string = "0") : Promise<number> {
  const contract = new ethers.Contract(`${process.env.REBASE_CONTRACT}`, rebaseArtifacts.abi, provider);
  return contract.getParity(weiRatio);
}

async function setEthPrice(ethPriceInPenny: number): Promise<string> {
  const wallet = new ethers.Wallet(`${process.env.PRIVATE_KEY}`, provider);
  const contract = new ethers.Contract(`${process.env.ORACLE_CONTRACT}`, oracleArtifacts.abi, wallet);

  const tx = await contract.setEthPrice(ethPriceInPenny);
  await tx.wait();
  console.log(tx.hash);
  return tx.hash;
}

export default {
  getWeiRatio,
  getParity,
  setEthPrice
}