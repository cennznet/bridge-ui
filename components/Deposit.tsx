import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "../context/Web3Context";
import { Box, Button, TextField, Typography } from "@mui/material";

import TxModal from "./TxModal";
import TokenPicker from "./TokenPicker";
import { defineTxModal } from "../utils/modal";
import { useBlockchain } from "../context/BlockchainContext";
import GenericERC20TokenAbi from "../artifacts/GenericERC20Token.json";
import CENNZnetAccountPicker from "./CENNZnetAccountPicker";
import store from "store";
import { SmallText } from "./StyledComponents";

const Deposit: React.FC<{}> = () => {
  const { decodeAddress } = useWeb3();
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
  const { api }: any = useWeb3();

  useEffect(() => {
    if (CENNZnetAccountSelected) {
      const account = store.get("selected-cennz-account");
      setCENNZnetAccount(account);
    }
  }, [CENNZnetAccountSelected]);

  const depositEth = async () => {
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
  };

  const depositERC20 = async () => {
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
  };

  const deposit = async () => {
    setModalOpen(false);
    const bridgePaused = await api.query.ethBridge.bridgePaused();
    if (!bridgePaused.isTrue) {
      if (token === "eth") {
        depositEth();
      } else if (token && token !== "eth") {
        depositERC20();
      } else {
        setModal(defineTxModal("error", "noTokenSelected", setModalOpen));
      }
    } else {
      setModal(defineTxModal("bridgePaused", "", setModalOpen));
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
          width: "552px",
          height: "auto",
          margin: "0 auto",
          background: "#FFFFFF",
          border: "4px solid #1130FF",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "0px",
        }}
      >
        {customToken ? (
          <>
            <TextField
              label="Token Address"
              variant="outlined"
              required
              sx={{
                width: "80%",
                mt: "50px",
              }}
              onChange={(e) => setToken(e.target.value)}
            />
            <Button
              size="small"
              variant="outlined"
              onClick={() => setCustomToken(false)}
              sx={{
                fontFamily: "Teko",
                fontWeight: "bold",
                fontSize: "21px",
                lineHeight: "124%",
                color: "#1130FF",
                width: "80%",
                mb: "30px",
              }}
            >
              select token instead*
            </Button>
          </>
        ) : (
          <>
            <TokenPicker setToken={setToken} />
            <Button
              size="small"
              variant="outlined"
              onClick={() => setCustomToken(true)}
              sx={{
                fontFamily: "Teko",
                fontWeight: "bold",
                fontSize: "21px",
                lineHeight: "124%",
                color: "#1130FF",
                width: "80%",
                mb: "30px",
              }}
            >
              use token address instead*
            </Button>
          </>
        )}
        <TextField
          label="Amount"
          variant="outlined"
          required
          sx={{
            width: "80%",
            mb: "30px",
          }}
          onChange={(e) => setAmount(e.target.value)}
        />
        <CENNZnetAccountPicker
          setCENNZnetAccountSelected={setCENNZnetAccountSelected}
          location={"deposit"}
        />
        <Button
          sx={{
            fontFamily: "Teko",
            fontWeight: "bold",
            fontSize: "21px",
            lineHeight: "124%",
            color: "#1130FF",
            mt: "30px",
            mb: "50px",
            opacity:
              CENNZnetAccountSelected && amount && token ? "100%" : "60%",
          }}
          size="large"
          variant="outlined"
          onClick={deposit}
        >
          Deposit
        </Button>
      </Box>
    </>
  );
};

export default Deposit;
