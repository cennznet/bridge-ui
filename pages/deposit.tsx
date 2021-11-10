import React, { useEffect, useState, useContext } from "react";
import { ethers } from "ethers";
import { decodeAddress } from "@polkadot/keyring";
import { Box, Button, TextField } from "@mui/material";
import TxModal from "../components/TxModal";
import TokenPicker from "../components/TokenPicker";
import { defineModal } from "../utils/modal";
import { useBlockchain } from "../context/blockchainContext";
import GenericERC20TokenAbi from "../artifacts/GenericERC20Token.json";

const Deposit: React.FC<{}> = () => {
  const [customToken, setCustomToken] = useState(false);
  const [token, setToken] = useState("");
  const [amount, setAmount] = useState("");
  const [CENNZnetAddress, setCENNZnetAddress] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modal, setModal] = useState({
    state: "",
    text: "",
    hash: "",
  });
  const { Contracts, Signer }: any = useBlockchain();

  const deposit = async () => {
    setModalOpen(false);

    if (token) {
      const tokenContract = new ethers.Contract(
        token,
        GenericERC20TokenAbi,
        Signer
      );

      let tx: any = await tokenContract.approve(
        Contracts.peg.address,
        ethers.utils.parseEther(amount)
      );
      setModal(defineModal("approve", tx.hash, setModalOpen));
      await tx.wait();
      tx = await Contracts.peg.deposit(
        token,
        ethers.utils.parseUnits(amount),
        decodeAddress(CENNZnetAddress)
      );
      setModal(defineModal("deposit", tx.hash, setModalOpen));
      await tx.wait();
      setModal(defineModal("relayer", "", setModalOpen));
    } else {
      setModal(defineModal("error", "noTokenSelected", setModalOpen));
    }
  };

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
        <TextField
          id="cennznet-address"
          label="CENNZnet Address"
          variant="filled"
          required
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
          onClick={deposit}
        >
          Deposit
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

export default Deposit;
