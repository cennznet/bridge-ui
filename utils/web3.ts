import ERC20Peg from "../artifacts/ERC20Peg.json";
import TestToken from "../artifacts/TestToken.json";
import { ethers } from "ethers";

const ERC20PegAddress = "0x8E3E3f855d0A287DeF9b75a5a8463a61b720Bc26";
const TokenAddress = "0x9644a0f31489effd3d5dcDb969a3629261662D1F";

function initWeb3() {
  return new Promise(async (resolve, reject) => {
    try {
      const { ethereum }: any = window;

      let chainId = await ethereum.request({ method: "eth_chainId" });
      console.log("Connected to chain " + chainId);

      const ropstenChainId = "0x3";
      if (chainId !== ropstenChainId) {
        alert("Please switch to the Ropsten Test Network!");
      }

      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();

      const peg: ethers.Contract = new ethers.Contract(
        ERC20PegAddress,
        ERC20Peg.abi,
        signer
      );

      const token: ethers.Contract = new ethers.Contract(
        TokenAddress,
        TestToken.abi,
        signer
      );

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      resolve({ peg, token, accounts });
    } catch (err) {
      reject(err);
    }
  });
}

export { initWeb3 };
