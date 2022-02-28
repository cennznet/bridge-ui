import React, { createContext, useContext, ReactNode, useState } from "react";
import { ethers } from "ethers";
import CENNZnetBridge from "../artifacts/CENNZnetBridge.json";
import ERC20Peg from "../artifacts/ERC20Peg.json";
import store from "store";
import { useWeb3 } from "./Web3Context";

type blockchainContextType = {
  Contracts: object;
  Account: string;
  updateNetwork: Function;
};

const blockchainContextDefaultValues: blockchainContextType = {
  Contracts: {},
  Account: "",
  updateNetwork: (ethereum: any, ethereumNetwork: string) => {},
};

const BlockchainContext = createContext<blockchainContextType>(
  blockchainContextDefaultValues
);

export function useBlockchain() {
  return useContext(BlockchainContext);
}

type Props = {
  children?: ReactNode;
};

const BlockchainProvider: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}: Props) => {
  const { updateApi } = useWeb3();
  const [value, setValue] = useState({
    Contracts: {
      bridge: {} as ethers.Contract,
      peg: {} as ethers.Contract,
    },
    Account: "",
    Signer: {} as ethers.providers.JsonRpcSigner,
  });

  const updateNetwork = (ethereum: any, ethereumNetwork: string) => {
    return new Promise(async (resolve, reject) => {
      try {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        window.localStorage.setItem("ethereum-network", ethereumNetwork);
        let BridgeAddress: string,
          ERC20PegAddress: string,
          tokenChainId: number,
          apiUrl: string;

        switch (ethereumNetwork) {
          case "Mainnet":
            BridgeAddress = "0x369e2285CCf43483e76746cebbf3d1d6060913EC";
            ERC20PegAddress = "0x76BAc85e1E82cd677faa2b3f00C4a2626C4c6E32";
            tokenChainId = 1;
            apiUrl = "wss://cennznet.unfrastructure.io/public/ws";
            break;
          case "Kovan":
            BridgeAddress = "0x9AFe4E42d8ab681d402e8548Ee860635BaA952C5";
            ERC20PegAddress = "0xa39E871e6e24f2d1Dd6AdA830538aBBE7b30F78F";
            tokenChainId = 42;
            apiUrl = "wss://nikau.centrality.me/public/ws";
            break;
          case "Ropsten":
            BridgeAddress = "0x25b53B1bDc5F03e982c383865889A4B3c6cB98AA";
            ERC20PegAddress = "0x927a710681B63b0899E28480114Bf50c899a5c27";
            tokenChainId = 3;
            apiUrl = "wss://kong2.centrality.me/public/rata/ws";
            break;
          default:
            reject();
            break;
        }

        store.set("token-chain-id", tokenChainId);
        updateApi(apiUrl);

        const bridge: ethers.Contract = new ethers.Contract(
          BridgeAddress,
          CENNZnetBridge,
          signer
        );

        const peg: ethers.Contract = new ethers.Contract(
          ERC20PegAddress,
          ERC20Peg,
          signer
        );

        const accounts = await ethereum.request({
          method: "eth_requestAccounts",
        });

        setValue({
          Contracts: {
            bridge,
            peg,
          },
          Account: accounts[0],
          Signer: signer,
        });

        resolve({ bridge, peg, accounts, signer });
      } catch (err) {
        reject(err);
      }
    });
  };

  return (
    <>
      <BlockchainContext.Provider value={{ ...value, updateNetwork }}>
        {children}
      </BlockchainContext.Provider>
    </>
  );
};

export default BlockchainProvider;
