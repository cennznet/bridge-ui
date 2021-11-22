import React, { useState } from "react";
import { Button, Link, Modal } from "@mui/material";
import { StyledModal, Heading, SmallText, Option } from "./StyledComponents";
import { Box } from "@mui/material";

const ErrorModal: React.FC<{
  setModalOpen: Function;
  modalState: string;
}> = ({ setModalOpen, modalState }) => {
  const [open, setOpen] = useState(true);

  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <StyledModal
        sx={{
          justifyContent: "center",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ display: "flex", mt: "3%", pl: "5%" }}>
          <Heading
            sx={{
              color: "primary.main",
              fontSize: "24px",
              mb: "15px",
            }}
          >
            ERROR
          </Heading>
        </Box>
        {modalState === "noExtension" && (
          <SmallText
            sx={{
              ml: "5%",
              display: "inline-flex",
              fontSize: "18px",
              mb: "30px",
            }}
          >
            Please install the CENNZnet extension - available&nbsp;
            <a
              href="https://chrome.google.com/webstore/detail/cennznet-extension/feckpephlmdcjnpoclagmaogngeffafk"
              rel="noopener noreferrer"
              target="blank"
              style={{ textDecoration: "none" }}
            >
              here.
            </a>
          </SmallText>
        )}
        {modalState === "noAccounts" && (
          <SmallText
            sx={{
              ml: "5%",
              display: "inline-flex",
              fontSize: "18px",
              mb: "30px",
            }}
          >
            Please create an account in the CENNZnet extension
          </SmallText>
        )}

        <Button
          sx={{
            fontFamily: "Teko",
            fontWeight: "bold",
            fontSize: "21px",
            lineHeight: "124%",
            color: "primary.main",
            width: "35%",
            m: modalState === "showWallet" ? "0 auto 30px" : "10px auto 30px",
            display: "flex",
          }}
          size="large"
          variant="outlined"
          onClick={() => {
            setModalOpen(false);
          }}
        >
          CLOSE
        </Button>
      </StyledModal>
    </Modal>
  );
};

export default ErrorModal;
