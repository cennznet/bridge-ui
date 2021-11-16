// Need to create the context in a separate file as the Web3 component imports @polkadot/extension-dapp package which doesn't work during SSR
import React, { useContext } from "react";

const Web3Context = React.createContext({
  hasWeb3injected: false,
  connectWallet: () => {},
  updateSelectedAccount: (account) => {},
  selectedAccount: null,
  extension: null,
  balances: null,
  signer: null,
  accounts: null,
  api: null,
  decodeAddress: (address: string) => {},
  setBalances: (balances: any) => {},
});

export function useWeb3() {
  return useContext(Web3Context);
}

export default Web3Context;
