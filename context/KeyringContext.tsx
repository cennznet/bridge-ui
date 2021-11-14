// Need to create the context in a separate file as the Web3 component imports @polkadot/extension-dapp package which doesn't work during SSR
import React, { useContext } from "react";

const KeyringContext = React.createContext({
  decodeAddress: (address: string) => {},
});

export function useKeyring() {
  return useContext(KeyringContext);
}

export default KeyringContext;
