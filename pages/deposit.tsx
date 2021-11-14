import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { decodeAddress } from "@polkadot/keyring";
import { Box, Button, TextField, Typography } from "@mui/material";
import TxModal from "../components/TxModal";
import TokenPicker from "../components/TokenPicker";
import { defineTxModal } from "../utils/modal";
import { useBlockchain } from "../context/BlockchainContext";
import GenericERC20TokenAbi from "../artifacts/GenericERC20Token.json";
import CENNZnetAccountPicker from "../components/CENNZnetAccountPicker";
import store from "store";

const Deposit: React.FC<{}> = () => {
  const [customToken, setCustomToken] = useState(false);
  const [token, setToken] = useState("");
  const [amount, setAmount] = useState("");
  const [CENNZnetAccountSelected, setCENNZnetAccountSelected] = useState(false);
  const [CENNZnetAccount, setCENNZnetAccount] = useState({
    address: "",
    name: "",
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [modal, setModal] = useState({
    state: "",
    text: "",
    hash: "",
  });
  const { Contracts, Signer }: any = useBlockchain();

  useEffect(() => {
    if (CENNZnetAccountSelected) {
      const account = store.get("selected-cennz-account");
      setCENNZnetAccount(account);
    }
  }, [CENNZnetAccountSelected]);

  const deposit = async () => {
    setModalOpen(false);

    if (token === "eth") {
      let tx: any = await Contracts.peg.deposit(
        "0x0000000000000000000000000000000000000000",
        ethers.utils.parseUnits(amount),
        decodeAddress(CENNZnetAccount.address),
        {
          value: ethers.utils.parseUnits(amount),
        }
      );
      setModal(defineTxModal("deposit", tx.hash, setModalOpen));
      await tx.wait();
      setModal(defineTxModal("relayer", "", setModalOpen));
    } else if (token && token !== "eth") {
      const tokenContract = new ethers.Contract(
        token,
        GenericERC20TokenAbi,
        Signer
      );

      let tx: any = await tokenContract.approve(
        Contracts.peg.address,
        ethers.utils.parseEther(amount)
      );
      setModal(defineTxModal("approve", tx.hash, setModalOpen));
      await tx.wait();
      tx = await Contracts.peg.deposit(
        token,
        ethers.utils.parseUnits(amount),
        decodeAddress(CENNZnetAccount.address)
      );
      setModal(defineTxModal("deposit", tx.hash, setModalOpen));
      await tx.wait();
      setModal(defineTxModal("relayer", "", setModalOpen));
    } else {
      setModal(defineTxModal("error", "noTokenSelected", setModalOpen));
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
        {customToken ? (
          <TextField
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
        ) : (
          <>
            <TokenPicker setToken={setToken} />
            <Button
              size="small"
              variant="outlined"
              onClick={() => setCustomToken(true)}
              sx={{
                margin: "15px auto",
                width: "70%",
                display: "flex",
                color: "secondary.dark",
              }}
            >
              use token address
            </Button>
          </>
        )}
        <TextField
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
        {CENNZnetAccountSelected ? (
          <div>
            <Typography sx={{ textAlign: "center", fontSize: 21 }}>
              Beneficiary: {CENNZnetAccount.name}
            </Typography>
          </div>
        ) : (
          <CENNZnetAccountPicker
            setCENNZnetAccountSelected={setCENNZnetAccountSelected}
            location={"deposit"}
          />
        )}
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
