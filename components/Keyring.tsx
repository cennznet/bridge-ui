import React from "react";
import { decodeAddress } from "@polkadot/keyring";
import KeyringContext from "../context/KeyringContext";

const Keyring: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  return (
    <KeyringContext.Provider value={{ decodeAddress }}>
      {children}
    </KeyringContext.Provider>
  );
};

export default Keyring;
