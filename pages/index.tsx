import React, { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { useBlockchain } from "../context/BlockchainContext";
import { useWeb3 } from "../context/Web3Context";
import CENNZnetWallet from "../components/CENNZnetWallet";

const Home: React.FC<{}> = () => {
  const { Account } = useBlockchain();
  const { connectWallet, accounts } = useWeb3();

  async function connectCENNZwallet() {
    await connectWallet();
  }

  return (
    <>
      <Box
        sx={{
          margin: "0 auto",
          borderRadius: 10,
          width: "30%",
          height: "auto",
          display: "block",
          border: "3px outset #cfcfcf",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            textAlign: "center",
            color: "secondary.dark",
            textDecoration: "overline",
            marginBottom: "10px",
          }}
        >
          Wallets
        </Typography>
        <Typography
          variant="h6"
          sx={{
            textAlign: "center",
            color: "secondary.dark",
          }}
        >
          Metamask:{" "}
          {Account.substr(0, 6).concat(
            "...",
            Account.substr(Account.length - 4, 4)
          )}
        </Typography>
        <CENNZnetWallet />
      </Box>
    </>
  );
};

export default Home;
