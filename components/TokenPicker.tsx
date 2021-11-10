import React, { useState, useEffect } from "react";
import { Autocomplete, TextField } from "@mui/material";
import ERC20Tokens from "../utils/erc20tokens.json";

const TokenPicker: React.FC<{ setToken: Function }> = ({ setToken }) => {
  const [tokens, setTokens] = useState([]);
  const [selectedToken, setSelectedToken] = useState("");
  useEffect(() => {
    let tokes: any = [];
    ERC20Tokens.tokens.map((token) => {
      if (token.chainId === 3) {
        tokes.push(token.symbol);
      }
    });
    setTokens(tokes);
  }, []);

  useEffect(() => {
    ERC20Tokens.tokens.map((token) => {
      if (token.symbol === selectedToken && token.chainId === 3) {
        setToken(token.address);
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
