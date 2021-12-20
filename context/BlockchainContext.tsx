import React, { createContext, useContext, ReactNode, useState } from "react";
import {ethers, Signer} from "ethers";
import CENNZnetBridge from "../artifacts/CENNZnetBridge.json";
import ERC20Peg from "../artifacts/ERC20Peg.json";
import Timelock from "../artifacts/Timelock.json";
import store from "store";
import { useWeb3 } from "./Web3Context";
import {JsonRpcSigner} from "@ethersproject/providers/src.ts/json-rpc-provider";

type blockchainContextType = {
  Contracts: object;
  Account: string;
  Signer: JsonRpcSigner;
  updateNetwork: Function;
  activateAdmin: Function;
};

const blockchainContextDefaultValues: blockchainContextType = {
  Contracts: {},
  Account: "",
  Signer: {} as JsonRpcSigner,
  activateAdmin: (ethereum: any, ethereumNetwork: string) => {},
  updateNetwork: (ethereum: any, ethereumNetwork: string) => {}
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
            ERC20PegAddress = "0x8F68fe02884b2B05e056aF72E4F2D2313E9900eC";
            tokenChainId = 1;
            apiUrl = "wss://cennznet.unfrastructure.io/public/ws";
            break;
          case "Kovan":
            BridgeAddress = "0x9AFe4E42d8ab681d402e8548Ee860635BaA952C5";
            ERC20PegAddress = "0x5Ff2f9582FcA1e11d47e4e623BEf4594EB12b30d";
            tokenChainId = 42;
            apiUrl = "wss://nikau.centrality.me/public/ws";
            break;
          case "Ropsten":
            BridgeAddress = "0x25b53B1bDc5F03e982c383865889A4B3c6cB98AA";
            ERC20PegAddress = "0x927a710681B63b0899E28480114Bf50c899a5c27";
            tokenChainId = 3;
            apiUrl = "wss://kong2.centrality.me/public/rata/ws";
            break;
          case "Rinkeby":
            BridgeAddress = "0xA4Ce4fDF83CeB84d7a3B71d5c76328b6a375A476";
            ERC20PegAddress = "0xa3205266ebBd74298729e04a28b8Fa53B5319679";
            tokenChainId = 4;
            apiUrl = "wss://nikau.centrality.me/public/ws";
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

  const activateAdmin = async (ethereum: any, ethereumNetwork: string) => {
    return new Promise(async (resolve, reject) => {
      try {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        let BridgeAddress: string,
          ERC20PegAddress: string,
          TimelockAddress: string;

        switch (ethereumNetwork) {
          case "Mainnet":
            BridgeAddress = "";
            ERC20PegAddress = "";
            TimelockAddress = "";
            break;
          case "Rinkeby":
            BridgeAddress = "0xA4Ce4fDF83CeB84d7a3B71d5c76328b6a375A476";
            ERC20PegAddress = "0x8236824EdaE713c9B55Ed7125Ee6103213859Bf8";
            TimelockAddress = "0x239f747454968aE53864D0Ef98c40c977b523cC3";
            break;
          default:
            break;
        }

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

        const timelock: ethers.Contract = new ethers.Contract(
          TimelockAddress,
          Timelock.abi,
          signer
        );

        resolve({ provider, timelock, bridge, peg });
      } catch (err) {
        reject(err);
      }
    });
  };

  return (
    <>
      <BlockchainContext.Provider
        value={{ ...value, updateNetwork, activateAdmin }}
      >
        {children}
      </BlockchainContext.Provider>
    </>
  );
};

export default BlockchainProvider;
