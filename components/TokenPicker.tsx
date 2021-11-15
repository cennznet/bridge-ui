import React, { useState, useEffect } from "react";
import { Autocomplete, TextField } from "@mui/material";
import ERC20Tokens from "../artifacts/erc20tokens.json";
import store from "store";

const TokenPicker: React.FC<{ setToken: Function }> = ({ setToken }) => {
  const [tokens, setTokens] = useState([]);
  const [selectedToken, setSelectedToken] = useState("");

  useEffect(() => {
    let tokes: string[] = ["ETH"];
    const chainId = store.get("token-chain-id");

    ERC20Tokens.tokens.map((token) => {
      if (token.chainId === chainId) {
        tokes.push(token.symbol);
      }
    });
    setTokens(tokes);
  }, []);

  useEffect(() => {
    const chainId = store.get("token-chain-id");

    ERC20Tokens.tokens.map((token) => {
      if (
        (token.symbol === selectedToken && token.chainId === chainId) ||
        selectedToken === "ETH"
      ) {
        selectedToken === "ETH" ? setToken("eth") : setToken(token.address);
      }
    });
  }, [selectedToken]);

  return (
    <Autocomplete
      disablePortal
      options={tokens}
      onSelect={(e: any) => setSelectedToken(e.target.value)}
      sx={{
        display: "flex",
        width: "70%",
        margin: "20px auto",
        borderRadius: 10,
      }}
      renderInput={(params) => <TextField {...params} label="Token" required />}
    />
  );
};

export default TokenPicker;
