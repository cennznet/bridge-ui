import React, { useEffect, useState } from "react";
import { Button, TextField } from "@mui/material";
import { Box } from "@mui/system";
import { initWeb3 } from "../utils/web3";

const Withdraw: React.FC<{}> = () => {
  const [amount, setAmount] = useState("");
  const [CENNZnetAddress, setCENNZnetAddress] = useState("");

  const [contracts, setContracts] = useState({
    peg: {},
    token: {},
  });
  const [account, setAccount] = useState();

  useEffect(() => {
    initWeb3().then((res) => {
      const { peg, token, accounts }: any = res;
      setContracts({ peg, token });
      setAccount(accounts[0]);
    });
    console.log(contracts);
  }, []);

  async function withdraw() {}

  useEffect(() => {
    console.log(amount);
  }, [amount]);

  return (
    <>
      <Box
        component="form"
        sx={{
          margin: "20px auto",
          backgroundColor: "primary.light",
          borderRadius: 5,
          width: "30%",
          height: "auto",
          display: "block",
        }}
      >
        <TextField
          id="amount"
          label="Amount"
          variant="filled"
          sx={{
            display: "flex",
            width: "70%",
            margin: "20px auto",
            borderRadius: 10,
          }}
          onChange={(e) => setAmount(e.target.value)}
        />
        <TextField
          id="cennznet-address"
          label="CENNZnet Address"
          variant="filled"
          sx={{
            display: "flex",
            width: "70%",
            margin: "20px auto",
            borderRadius: 10,
          }}
          onChange={(e) => setCENNZnetAddress(e.target.value)}
        />
        <Button
          sx={{ margin: "15px auto", display: "flex" }}
          variant="contained"
          onClick={withdraw}
        >
          Withdraw
        </Button>
      </Box>
    </>
  );
};

export default Withdraw;
