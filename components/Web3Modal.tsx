import React, { useEffect, useState } from "react";
import { Box, Button, Divider, Link, Modal, Typography } from "@mui/material";
import { useWeb3 } from "../context/Web3Context";
import CENNZnetAccountPicker from "./CENNZnetAccountPicker";

interface Props {
  modalState: string;
  modalText: string;
  modalSubText: string;
  setModalOpen: (open: boolean) => void;
}

const Web3Modal: React.FC<Props> = ({
  modalState,
  modalText,
  modalSubText,
  setModalOpen,
}) => {
  const { selectedAccount, balances } = useWeb3();
  const [open, setOpen] = useState(true);
  const handleClose = () => setOpen(false);
  const [changeAccount, setChangeAccount] = useState(false);
  const [CENNZnetAccountSelected, setCENNZnetAccountSelected] = useState(false);

  useEffect(() => {
    if (selectedAccount) setCENNZnetAccountSelected(true);
  }, [selectedAccount]);

  const NoExtension = (
    <>
      <Divider sx={{ margin: "15px 0 15px 0" }} />
      <Link
        href="https://chrome.google.com/webstore/detail/cennznet-extension/feckpephlmdcjnpoclagmaogngeffafk"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Typography
          variant="h6"
          component="h6"
          sx={{ color: "secondary.dark" }}
        >
          Get Extension
        </Typography>
      </Link>
    </>
  );

  const ShowWallet = (
    <>
      {CENNZnetAccountSelected ? (
        <>
          <Typography sx={{ color: "secondary.dark" }}>
            Selected Account: {selectedAccount.name}
          </Typography>
          {balances &&
            Object.values(balances).map((token: any, i) => (
              <Typography sx={{ color: "secondary.dark" }} key={i}>
                {token.symbol} Balance: {token.balance}
              </Typography>
            ))}
          <br />
        </>
      ) : (
        <CENNZnetAccountPicker
          setCENNZnetAccountSelected={setCENNZnetAccountSelected}
          location={"wallet"}
        />
      )}
      {changeAccount ? (
        <CENNZnetAccountPicker
          setCENNZnetAccountSelected={setCENNZnetAccountSelected}
          location={"wallet"}
        />
      ) : (
        <Button
          onClick={() => setChangeAccount(true)}
          variant="contained"
          sx={{ color: "secondary.dark" }}
        >
          change account
        </Button>
      )}
    </>
  );

  const SelectAccount = (
    <>
      <Divider />
      <CENNZnetAccountPicker
        setCENNZnetAccountSelected={setCENNZnetAccountSelected}
        location={"wallet"}
      />
    </>
  );

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          border: "3px outset #cfcfcf",
          p: 4,
          textAlign: "center",
          borderRadius: 10,
          boxShadow: 24,
          bgcolor: "background.paper",
        }}
      >
        <Typography
          variant="h6"
          component="h4"
          sx={{ color: "secondary.dark" }}
        >
          {modalText}
        </Typography>
        {modalState === "noExtension" && NoExtension}
        {modalState === "showWallet" && ShowWallet}
        {modalState === "selectAccount" && SelectAccount}
        <Typography
          variant="h6"
          component="h4"
          sx={{ color: "secondary.dark" }}
        >
          {modalSubText}
        </Typography>
        <Divider sx={{ margin: "15px 0 15px 0" }} />
        <Button
          variant="contained"
          sx={{ color: "secondary.dark" }}
          onClick={() => setModalOpen(false)}
        >
          Close
        </Button>
      </Box>
    </Modal>
  );
};

export default Web3Modal;
