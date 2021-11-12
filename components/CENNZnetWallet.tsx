import React, { useEffect, useState } from "react";
import { Button, Typography } from "@mui/material";
import { useWeb3 } from "../context/Web3Context";
import { defineWeb3Modal } from "../utils/modal";
import Web3Modal from "./Web3Modal";

const ConnectWallet: React.FC<{}> = () => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const { selectedAccount, connectWallet } = useWeb3();
  const [modal, setModal] = useState({
    state: "",
    text: "",
    subText: "",
  });
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (selectedAccount) {
      setIsWalletConnected(true);
    } else {
      setIsWalletConnected(false);
    }
  }, [selectedAccount]);

  const buttonClickHandler: React.EventHandler<React.SyntheticEvent> = (
    event: React.SyntheticEvent
  ) => {
    if (isWalletConnected) {
      setModal(defineWeb3Modal("showWallet", setModalOpen));
    } else {
      connectWallet();
    }
  };

  return (
    <>
      {modalOpen && (
        <Web3Modal
          modalState={modal.state}
          modalText={modal.text}
          modalSubText={modal.subText}
          setModalOpen={setModalOpen}
        />
      )}
      <Button
        onClick={buttonClickHandler}
        variant="contained"
        sx={{
          width: "70%",
          margin: "10px auto",
          display: "flex",
          textTransform: "none",
        }}
      >
        <img
          src="/wallet.svg"
          alt="Connect Wallet"
          style={{ marginRight: "10px" }}
        />
        <Typography
          sx={{
            color: "secondary.dark",
          }}
        >
          {isWalletConnected && selectedAccount
            ? `CENNZnet Wallet`
            : "Connect CENNZnet"}
        </Typography>
      </Button>
    </>
  );
};

export default ConnectWallet;
