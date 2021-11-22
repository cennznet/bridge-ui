import React, {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from "react";
import { ethers } from "ethers";
import CENNZnetBridge from "../artifacts/CENNZnetBridge.json";
import ERC20Peg from "../artifacts/ERC20Peg.json";
const { NEXT_PUBLIC_ETHEREUM_NETWORK } = process.env;
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

  const init = async (ethereum: any, ethereumNetwork: string) => {
    return new Promise(async (resolve, reject) => {
      try {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        store.set("ethereum-network", ethereumNetwork);
        let BridgeAddress: string, ERC20PegAddress: string;

        switch (ethereumNetwork) {
          case "Mainnet":
            BridgeAddress = "";
            ERC20PegAddress = "";
            store.set("eth-chain-id", "0x1");
            store.set("token-chain-id", 1);
            store.set("CENNZnet-network", "Azalea");
            updateApi("wss://cennznet.unfrastructure.io/public/ws");
            break;
          case "Kovan":
            BridgeAddress = "0x9AFe4E42d8ab681d402e8548Ee860635BaA952C5";
            ERC20PegAddress = "0x5Ff2f9582FcA1e11d47e4e623BEf4594EB12b30d";
            store.set("eth-chain-id", "0x2a");
            store.set("token-chain-id", 42);
            store.set("CENNZnet-network", "Nikau");
            updateApi("wss://nikau.centrality.me/public/ws");
            break;
          case "Ropsten":
            BridgeAddress = "0x25b53B1bDc5F03e982c383865889A4B3c6cB98AA";
            ERC20PegAddress = "0x927a710681B63b0899E28480114Bf50c899a5c27";
            store.set("eth-chain-id", "0x3");
            store.set("token-chain-id", 3);
            store.set("CENNZnet-network", "Rata");
            updateApi("wss://kong2.centrality.me/public/rata/ws");
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
      <BlockchainContext.Provider value={{ ...value, updateNetwork: init }}>
        {children}
      </BlockchainContext.Provider>
    </>
  );
};

export default BlockchainProvider;
