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

const BridgeAddress = "0x25b53B1bDc5F03e982c383865889A4B3c6cB98AA";
const ERC20PegAddress = "0x927a710681B63b0899E28480114Bf50c899a5c27";

type blockchainContextType = {
  Contracts: object;
  Account: string;
};

const blockchainContextDefaultValues: blockchainContextType = {
  Contracts: {},
  Account: "",
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

  async function init(ethereum) {
    return new Promise(async (resolve, reject) => {
      try {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

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
    init(ethereum).then((eth) => {
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
      <BlockchainContext.Provider value={value}>
        {children}
      </BlockchainContext.Provider>
    </>
  );
};

export default BlockchainProvider;
