import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Box, Button, TextField } from "@mui/material";
import TxModal from "../components/TxModal";
import { useBlockchain } from "../context/blockchainContext";
import { defineModal } from "../utils/modal";
import { withdrawCENNZside } from "../utils/cennznet";
import TokenPicker from "../components/TokenPicker";

const Withdraw: React.FC<{}> = () => {
  const [customToken, setCustomToken] = useState(false);
  const [token, setToken] = useState("");
  const [amount, setAmount] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modal, setModal] = useState({
    state: "",
    text: "",
    hash: "",
  });
  const { Contracts, Account }: any = useBlockchain();

  async function withdraw() {
    setModalOpen(false);
    if (token !== "") {
      setModal(defineModal("withdrawCENNZside", "", setModalOpen));
      let withdrawAmount = ethers.utils.parseUnits(amount).toString();

      const eventProof = await withdrawCENNZside(
        withdrawAmount,
        Account,
        token,
        Contracts.bridge
      );
      await withdrawEthSide(withdrawAmount, eventProof, Account, token);
      console.log("eventProof", eventProof);
    } else {
      setModal(defineModal("error", "noTokenSelected", setModalOpen));
    }
  }

  async function withdrawEthSide(
    withdrawAmount: any,
    eventProof: any,
    ethAddress: string,
    tokenAddress: string
  ) {
    setModalOpen(false);

    let verificationFee = await Contracts.bridge.verificationFee();
    // Make  withdraw for beneficiary1
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

    let tx: any = await Contracts.peg.withdraw(
      tokenAddress,
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

    setModal(defineModal("withdrawETHside", tx.hash, setModalOpen));
    await tx.wait();
    setModal(defineModal("finished", "", setModalOpen));
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
      <Box
        component="form"
        sx={{
          margin: "0 auto",
          borderRadius: 10,
          width: "30%",
          height: "auto",
          display: "block",
          border: "3px outset #cfcfcf",
        }}
      >
        {!customToken && <TokenPicker setToken={setToken} />}
        {customToken && (
          <TextField
            id="amount"
            label="Token Address"
            variant="filled"
            required
            sx={{
              display: "flex",
              width: "70%",
              margin: "20px auto",
              borderRadius: 10,
            }}
            onChange={(e) => setToken(e.target.value)}
          />
        )}

        <TextField
          id="amount"
          label="Amount"
          variant="filled"
          required
          sx={{
            display: "flex",
            width: "70%",
            margin: "20px auto",
            borderRadius: 10,
          }}
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
      {!customToken && (
        <Button
          size="small"
          variant="outlined"
          onClick={() => setCustomToken(true)}
          sx={{
            margin: "15px auto",
            width: "25%",
            display: "flex",
            color: "secondary.dark",
          }}
        >
          use token address instead
        </Button>
      )}
    </>
  );
};

export default Withdraw;
