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
  children: ReactNode;
};

interface Peg {
  address: "";
  deposit: (
    tokenAddress: string,
    amount: any,
    CENNZnetAddress: Uint8Array
  ) => {};
}

interface Bridge {
  verificationFee: () => any;
}

const BlockchainProvider: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}: Props) => {
  const [value, setValue] = useState({
    Contracts: {
      bridge: {} as Bridge,
      peg: {} as Peg,
    },
    Account: "",
    Signer: ethers.providers.JsonRpcSigner,
  });

  async function init(ethereum, ethereumNetwork) {
    return new Promise(async (resolve, reject) => {
      try {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        store.set("ethereum-network", ethereumNetwork);
        let BridgeAddress: string, ERC20PegAddress: string;

        switch (ethereumNetwork) {
          case "Mainnet":
            store.set("eth-chain-id", "0x1");
            store.set("token-chain-id", 1);
            break;
          case "Kovan":
            BridgeAddress = "0x9AFe4E42d8ab681d402e8548Ee860635BaA952C5";
            ERC20PegAddress = "0x5Ff2f9582FcA1e11d47e4e623BEf4594EB12b30d";
            store.set("eth-chain-id", "0x2a");
            store.set("token-chain-id", 42);
            break;
          case "Ropsten":
            BridgeAddress = "0x25b53B1bDc5F03e982c383865889A4B3c6cB98AA";
            ERC20PegAddress = "0x927a710681B63b0899E28480114Bf50c899a5c27";
            store.set("eth-chain-id", "0x3");
            store.set("token-chain-id", 3);
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

        resolve({ bridge, peg, accounts, signer });
      } catch (err) {
        reject(err);
      }
    });
  }

  useEffect(() => {
    const { ethereum } = window as any;
    init(ethereum, NEXT_PUBLIC_ETHEREUM_NETWORK).then((eth) => {
      const { bridge, peg, accounts, signer }: any = eth;
      setValue({
        Contracts: {
          bridge,
          peg,
        },
        Account: accounts[0],
        Signer: signer,
      });
    });
  }, []);

  return (
    <>
      <BlockchainContext.Provider value={{ ...value, updateNetwork: init }}>
        {children}
      </BlockchainContext.Provider>
    </>
  );
};

export default BlockchainProvider;
