import React, { useState, useEffect } from "react";
import { Autocomplete, TextField } from "@mui/material";
import ERC20Tokens from "../artifacts/erc20tokens.json";
const { NEXT_PUBLIC_TOKEN_CHAIN_ID } = process.env;

const TokenPicker: React.FC<{ setToken: Function }> = ({ setToken }) => {
  const [tokens, setTokens] = useState([]);
  const [selectedToken, setSelectedToken] = useState("");

  useEffect(() => {
    let tokes: any = ["ETH"];
    ERC20Tokens.tokens.map((token) => {
      if (String(token.chainId) === NEXT_PUBLIC_TOKEN_CHAIN_ID) {
        tokes.push(token.symbol);
      }
    });
    setTokens(tokes);
  }, []);

  useEffect(() => {
    ERC20Tokens.tokens.map((token) => {
      if (
        (token.symbol === selectedToken &&
          String(token.chainId) === NEXT_PUBLIC_TOKEN_CHAIN_ID) ||
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
