import CENNZnetBridge from "../artifacts/CENNZnetBridge.json";
import ERC20Peg from "../artifacts/ERC20Peg.json";
import TestToken from "../artifacts/TestToken.json";
import TestToken2 from "../artifacts/TestToken2.json";
import { ethers } from "ethers";

const BridgeAddress = "0xF20edcD48f80AEEA115B291A040d5029343e5Eb6";
const ERC20PegAddress = "0x8E3E3f855d0A287DeF9b75a5a8463a61b720Bc26";
const TestTokenAddress = "0x536F78E33E42641fAE8085361F43Af98FC37E847";
const TestToken2Address = "0x74Cf9C5d185de38285a914A711BEE072029E05A6";

function initEthers() {
  return new Promise(async (resolve, reject) => {
    try {
      const { ethereum } = window as any;

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

      const testToken: ethers.Contract = new ethers.Contract(
        TestTokenAddress,
        TestToken.abi,
        signer
      );

      const testToken2: ethers.Contract = new ethers.Contract(
        TestToken2Address,
        TestToken2.abi,
        signer
      );

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      resolve({ bridge, peg, testToken, testToken2, accounts });
    } catch (err) {
      reject(err);
    }
  });
}

export { initEthers };
