import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Box, Button, TextField } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { initEthers } from "../utils/ethers";
import TxModal from "../components/TxModal";

import { withdrawCENNZside } from "../utils/cennznet";

const useStyles = makeStyles({
  root: {
    margin: "0 auto",
    borderRadius: 20,
    width: "30%",
    height: "auto",
    display: "block",
    border: "3px outset #cfcfcf",
  },
  input: {
    display: "flex",
    width: "70%",
    margin: "20px auto",
    borderRadius: 10,
  },
});

const Withdraw: React.FC<{}> = () => {
  const classes = useStyles();
  const [amount, setAmount] = useState("");
  const [modal, setModal] = useState({
    state: "",
    text: "",
    hash: "",
  });

  const [contracts, setContracts] = useState({
    bridge: {
      activeValidatorSetId: () => {},
      verificationFee: () => {},
    },
    peg: {
      withdraw: (
        tokenAddress: string,
        amount: any,
        recipient: string,
        proof: {},
        gas: {}
      ) => {},
    },
    token: {
      address: "",
      balanceOf: (address: string) => {},
    },
  });

  const [account, setAccount] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    initEthers().then((res) => {
      const { bridge, peg, token, accounts }: any = res;
      setContracts({ bridge, peg, token });
      setAccount(accounts[0]);
    });
    console.log(contracts);
  }, []);

  async function withdraw() {
    const eventProof = await withdrawCENNZside(amount, account);
    setModal({
      state: "withdrawCENNZ",
      text: "Withdrawing your tokens from CENNZnet side...",
      hash: "",
    });
    await withdrawEthSide(amount, eventProof, account);
  }

  async function withdrawEthSide(
    amount: any,
    eventProof: any,
    ethAddress: string
  ) {
    let verificationFee = await contracts.bridge.verificationFee();
    // Make  withdraw for beneficiary1
    let withdrawAmount = amount;
    const signatures = eventProof.signatures;
    let v: any = [],
      r: any = [],
      s: any = []; // signature params
    signatures.forEach((signature: any) => {
      const hexifySignature = ethers.utils.hexlify(signature);
      const sig = ethers.utils.splitSignature(hexifySignature);
      v.push(sig.v);
      r.push(sig.r);
      s.push(sig.s);
    });

    let tx: any = await contracts.peg.withdraw(
      contracts.token.address,
      withdrawAmount,
      ethAddress,
      {
        eventId: eventProof.eventId,
        validatorSetId: eventProof.validatorSetId,
        v,
        r,
        s,
      },
      {
        gasLimit: 500000,
        value: verificationFee,
      }
    );

    setModal({
      state: "withdrawETH",
      text: "Withdrawing your tokens from ETH side...",
      hash: tx.hash,
    });
    await tx.wait();

    // Check beneficiary balance after first withdrawal
    let balanceAfter: any = await contracts.token.balanceOf(ethAddress);
    console.log(
      "Beneficiary ERC20 token balance after withdrawal:",
      balanceAfter.toString()
    );
  }

  return (
    <>
      {modalOpen && (
        <TxModal
          modalState={modal.state}
          modalText={modal.text}
          etherscanHash={modal.hash}
          setModalOpen={setModalOpen}
        />
      )}
      <Box component="form" className={classes.root}>
        <TextField
          id="amount"
          label="Amount"
          variant="filled"
          className={classes.input}
          onChange={(e) => setAmount(e.target.value)}
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
