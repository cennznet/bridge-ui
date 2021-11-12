import React, { useState, useEffect } from "react";
import store from "store";
import { Autocomplete, TextField } from "@mui/material";
import { useWeb3 } from "../context/Web3Context";

const CENNZnetAccountPicker: React.FC<{
  setCENNZnetAccountSelected: Function;
  location: string;
}> = ({ setCENNZnetAccountSelected, location }) => {
  const { accounts, updateSelectedAccount } = useWeb3();
  const [accountNames, setAccountNames] = useState([]);

  useEffect(() => {
    let names = [];
    accounts.map((account: { name: string; address: string }) => {
      names.push(account.name);
    });
    setAccountNames(names);
  }, []);

  function updateAccount(accountName) {
    accounts.forEach((account: { name: string; address: string }) => {
      if (account.name === accountName) {
        switch (location) {
          case "index":
          case "wallet":
            updateSelectedAccount(account);
            break;
          case "deposit":
            store.set("selected-cennz-account", account);
            break;
          default:
            store.set("selected-cennz-account", account);
            break;
        }
        setCENNZnetAccountSelected(true);
      }
    });
  }

  return (
    <Autocomplete
      disablePortal
      options={accountNames}
      onSelect={(e: any) => updateAccount(e.target.value)}
      sx={{
        display: "flex",
        width: "70%",
        margin: "20px auto",
        borderRadius: 10,
      }}
      renderInput={(params) => (
        <TextField {...params} label="CENNZnet Account" required />
      )}
    />
  );
};

export default CENNZnetAccountPicker;
