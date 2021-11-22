import React, { useState, useEffect } from "react";
import {
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
} from "@mui/material";
import ERC20Tokens from "../artifacts/erc20tokens.json";
import store from "store";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const TokenPicker: React.FC<{ setToken: Function }> = ({ setToken }) => {
  const [tokens, setTokens] = useState<Object[]>([{}]);
  const [selectedToken, setSelectedToken] = useState("");

  useEffect(() => {
    let tokes: Object[] = [
      {
        symbol: "ETH",
        logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
      },
    ];
    const chainId = store.get("token-chain-id");

    ERC20Tokens.tokens.map((token) => {
      if (token.chainId === chainId) {
        tokes.push({ symbol: token.symbol, logo: token.logoURI });
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
  }, [selectedToken, setToken]);

  return (
    <FormControl sx={{ width: "80%", mt: "50px" }} required>
      <InputLabel id="demo-multiple-name-label">Token</InputLabel>
      <Select
        required
        value={selectedToken}
        onChange={(e) => setSelectedToken(e.target.value)}
        input={<OutlinedInput label="Token" />}
        MenuProps={MenuProps}
        sx={{ fontSize: "18px" }}
      >
        {tokens.map((token: any) => (
          <MenuItem
            key={token.symbol}
            value={token.symbol}
            sx={{
              fontSize: "18px",
            }}
          >
            <img
              key={`img ${token.logo}`}
              alt="token logo"
              src={token.logo}
              style={{ marginRight: "12px", width: "20px" }}
            />
            {token.symbol}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default TokenPicker;
