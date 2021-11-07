import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { initWeb3 } from "../utils/web3";
import { decodeAddress } from "@polkadot/keyring";
import { Box, Button, TextField } from "@mui/material";
import TxModal from "../components/TxModal";
import useStyles from "../utils/styles";

const Deposit: React.FC<{}> = () => {
  const classes = useStyles();
  const [amount, setAmount] = useState("");
  const [CENNZnetAddress, setCENNZnetAddress] = useState("");
  const [contracts, setContracts] = useState({
    peg: {
      address: "",
      deposit: (
        tokenAddress: string,
        amount: any,
        CENNZnetAddress: Uint8Array
      ) => {},
    },
    token: {
      address: "",
      approve: (pegAddress: string, amount: any) => {},
    },
  });
  const [modal, setModal] = useState({
    state: "",
    text: "",
    hash: "",
  });

  useEffect(() => {
    initWeb3().then((res) => {
      const { peg, token, accounts }: any = res;
      setContracts({ peg, token });
    });
  }, []);

  const deposit = async () => {
    var tx: any = await contracts.token.approve(
      contracts.peg.address,
      ethers.utils.parseEther(amount)
    );
    setModal({
      state: "approve",
      text: "Approving your deposit...",
      hash: tx.hash,
    });
    await tx.wait();
    tx = await contracts.peg.deposit(
      contracts.token.address,
      ethers.utils.parseEther(amount),
      decodeAddress(CENNZnetAddress)
    );
    setModal({
      state: "deposit",
      text: "Pegging your tokens...",
      hash: tx.hash,
    });
  };

  return (
    <>
      {modal.state === "approve" && (
        <TxModal modalText={modal.text} etherscanHash={modal.hash} />
      )}
      {modal.state === "deposit" && (
        <TxModal modalText={modal.text} etherscanHash={modal.hash} />
      )}
      <Box component="form" className={classes.box}>
        <TextField
          id="amount"
          label="Amount"
          variant="filled"
          className={classes.input}
          onChange={(e) => setAmount(e.target.value)}
        />
        <TextField
          id="cennznet-address"
          label="CENNZnet Address"
          variant="filled"
          className={classes.input}
          onChange={(e) => setCENNZnetAddress(e.target.value)}
        />
        <Button
          sx={{ margin: "15px auto", display: "flex" }}
          variant="contained"
          onClick={deposit}
        >
          Deposit
        </Button>
      </Box>
    </>
  );
};

export default Deposit;
