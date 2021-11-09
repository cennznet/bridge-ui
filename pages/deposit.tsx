import React, { useEffect, useState, useContext } from "react";
import { ethers } from "ethers";
// import { depositCENNZside } from "../utils/cennznet";
import { decodeAddress } from "@polkadot/keyring";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import TxModal from "../components/TxModal";
import { defineModal } from "../utils/modal";
import { useBlockchain } from "../context/blockchainContext";
interface Token {
  address: "";
  approve: (pegAddress: string, amount: any) => {};
}

interface Peg {
  address: "";
  deposit: (
    tokenAddress: string,
    amount: any,
    CENNZnetAddress: Uint8Array
  ) => {};
}

const Deposit: React.FC<{}> = () => {
  const [token, setToken] = useState(0);
  const [amount, setAmount] = useState("");
  const [CENNZnetAddress, setCENNZnetAddress] = useState("");
  const [contracts, setContracts] = useState({
    peg: {} as Peg,
    testToken: {} as Token,
    testToken2: {} as Token,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [modal, setModal] = useState({
    state: "",
    text: "",
    hash: "",
  });
  const { Contracts }: any = useBlockchain();

  useEffect(() => {
    setContracts(Contracts);
  }, [Contracts]);

  const selectToken = () => {
    let selectedToken: any;
    switch (token) {
      case 1:
        selectedToken = contracts.testToken;
        break;
      case 2:
        selectedToken = contracts.testToken2;
        break;
      default:
        selectedToken = null;
        break;
    }

    if (!selectedToken) {
      setModal(defineModal("error", "noTokenSelected", setModalOpen));
    } else {
      return selectedToken;
    }
  };

  const deposit = async () => {
    setModalOpen(false);
    const selectedToken: Token = selectToken();

    if (selectedToken) {
      var tx: any = await selectedToken.approve(
        contracts.peg.address,
        ethers.utils.parseEther(amount)
      );
      setModal(defineModal("approve", tx.hash, setModalOpen));
      await tx.wait();
      tx = await contracts.peg.deposit(
        selectedToken.address,
        ethers.utils.parseUnits(amount),
        decodeAddress(CENNZnetAddress)
      );
      setModal(defineModal("deposit", tx.hash, setModalOpen));
      await tx.wait();
      console.log("addy", CENNZnetAddress, "amount", amount);
      setModal(defineModal("relayer", "", setModalOpen));
      // depositCENNZside(tx.hash, CENNZnetAddress, amount);
      console.log(token, amount, CENNZnetAddress);
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
        <FormControl
          sx={{
            display: "flex",
            width: "70%",
            margin: "20px auto",
            borderRadius: 10,
          }}
          required
        >
          <InputLabel>Token</InputLabel>
          <Select
            value={token}
            label="Token"
            onChange={(e) => setToken(e.target.value as number)}
          >
            <MenuItem value={1}>TestToken</MenuItem>
            <MenuItem value={2}>TestToken2</MenuItem>
          </Select>
        </FormControl>
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
    </>
  );
};

export default Deposit;
