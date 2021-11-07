import CENNZnetBridge from "../artifacts/CENNZnetBridge.json";
import ERC20Peg from "../artifacts/ERC20Peg.json";
import TestToken from "../artifacts/TestToken.json";
import { ethers } from "ethers";

const BridgeAddress = "0x534e73B3dA8459d4f1519820DE67E5aBcf3F622F";
const ERC20PegAddress = "0x1b54B0b559a1eDd89CBE77e0939f8D89E32A4904";
const TokenAddress = "0xeDd17d870b7b02B2f2D59B17644eDF03ad72c41e";

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

      const bridge: ethers.Contract = new ethers.Contract(
        BridgeAddress,
        CENNZnetBridge.abi,
        signer
      );

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

      resolve({ bridge, peg, token, accounts });
    } catch (err) {
      reject(err);
    }
  });
}

export { initWeb3 };
