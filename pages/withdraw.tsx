import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Button, TextField } from "@mui/material";
import { Box } from "@mui/system";
import { initWeb3 } from "../utils/web3";
import TxModal from "../components/TxModal";

const Withdraw: React.FC<{}> = () => {
  const [amount, setAmount] = useState("");
  const [CENNZnetAddress, setCENNZnetAddress] = useState("");
  const [modal, setModal] = useState({
    state: "",
    text: "",
    hash: "",
  });

  const [contracts, setContracts] = useState({
    bridge: {},
    peg: {},
    token: {},
  });

  const [account, setAccount] = useState();

  useEffect(() => {
    initWeb3().then((res) => {
      const { bridge, peg, token, accounts }: any = res;
      setContracts({ bridge, peg, token });
      setAccount(accounts[0]);
    });
    console.log(contracts);
  }, []);

  async function withdraw() {
    let signature = ethers.utils.hexlify(
      "0x12ff73ebe5afa9f631a7134f5973015544fef30416ce046a7958d8818da1cc175227e6183e9751f1b0dd98a768ac7d3ab40cb5a7ff30c669895077bab687003d01"
    );
    let sig = ethers.utils.splitSignature(signature);

    let activeValidatorSetId = await contracts.bridge.activeValidatorSetId();

    let verificationFee = await contracts.bridge.verificationFee();

    let tx = await contracts.peg.withdraw(
      contracts.token.address,
      amount,
      account,
      {
        eventId: 1,
        validatorSetId: activeValidatorSetId,
        v: [sig.v],
        r: [sig.r],
        s: [sig.s],
      },
      {
        gasLimit: 500000,
        value: verificationFee,
      }
    );

    setModal({
      state: "withdraw",
      text: "Withdrawing your tokens...",
      hash: tx.hash,
    });

    console.log(await tx.wait());
  }

  return (
    <>
      {modal.state === "withdraw" && (
        <TxModal modalText={modal.text} etherscanHash={modal.hash} />
      )}
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
