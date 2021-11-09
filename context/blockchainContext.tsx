import React, {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from "react";
import CENNZnetBridge from "../artifacts/CENNZnetBridge.json";
import ERC20Peg from "../artifacts/ERC20Peg.json";
import TestToken from "../artifacts/TestToken.json";
import TestToken2 from "../artifacts/TestToken2.json";
import { ethers } from "ethers";

const BridgeAddress = "0x25b53B1bDc5F03e982c383865889A4B3c6cB98AA";
const ERC20PegAddress = "0x927a710681B63b0899E28480114Bf50c899a5c27";
const TestTokenAddress = "0x536F78E33E42641fAE8085361F43Af98FC37E847";
const TestToken2Address = "0x74Cf9C5d185de38285a914A711BEE072029E05A6";

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

interface Token {
  address: "";
  approve: (pegAddress: string, amount: any) => {};
}

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

export function BlockchainProvider({ children }: Props) {
  const [value, setValue] = useState({
    Contracts: {
      bridge: {} as Bridge,
      peg: {} as Peg,
      testToken: {} as Token,
      testToken2: {} as Token,
    },
    Account: "",
  });

  async function init(ethereum: {
    request: (arg0: { method: string }) => any;
  }) {
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

  useEffect(() => {
    const { ethereum } = window as any;
    init(ethereum).then((eth) => {
      const { bridge, peg, testToken, testToken2, accounts }: any = eth;
      setValue({
        Contracts: {
          bridge,
          peg,
          testToken,
          testToken2,
        },
        Account: accounts[0],
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
}
