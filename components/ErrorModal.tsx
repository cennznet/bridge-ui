import React, { useState } from "react";
import { Button, Link, Modal } from "@mui/material";
import { StyledModal, Heading, SmallText, Option } from "./StyledComponents";
import { Box } from "@mui/material";
import { updateNetworks } from "../utils/networks";

const networks = ["Mainnet/Mainnet", "Ropsten/Rata", "Kovan/Nikau", "Rinkeby/Nikau"];

const ErrorModal: React.FC<{
  setModalOpen: Function;
  modalState: string;
}> = ({ setModalOpen, modalState }) => {
  const [open] = useState(true);

  const changeNetwork = async (selectedNetwork) => {
    updateNetworks(selectedNetwork);
  };

  return (
    <Modal open={open}>
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
          <>
            <SmallText
              sx={{
                ml: "5%",
                display: "inline-flex",
                fontSize: "18px",
                mb: "30px",
              }}
            >
              Please install the CENNZnet extension then refresh page
            </SmallText>
            <Button
              sx={{
                fontFamily: "Teko",
                fontWeight: "bold",
                fontSize: "21px",
                lineHeight: "124%",
                color: "primary.main",
                width: "35%",
                m: "30px auto 0",
                display: "flex",
                textTransform: "none",
              }}
              size="large"
              variant="outlined"
            >
              <Link
                href="https://chrome.google.com/webstore/detail/cennznet-extension/feckpephlmdcjnpoclagmaogngeffafk"
                rel="noopener noreferrer"
                target="blank"
                style={{ textDecoration: "none", color: "#1130FF" }}
              >
                GET CENNZnet
              </Link>
            </Button>
          </>
        )}
        {modalState === "noMetamask" && (
          <>
            <SmallText
              sx={{
                ml: "5%",
                display: "inline-flex",
                fontSize: "18px",
                mb: "30px",
              }}
            >
              Please install the MetaMask extension then refresh page
            </SmallText>
            <Button
              sx={{
                fontFamily: "Teko",
                fontWeight: "bold",
                fontSize: "21px",
                lineHeight: "124%",
                color: "primary.main",
                width: "35%",
                m: "30px auto 0",
                display: "flex",
              }}
              size="large"
              variant="outlined"
            >
              <Link
                href="https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en"
                rel="noopener noreferrer"
                target="blank"
                style={{ textDecoration: "none", color: "#1130FF" }}
              >
                Get MetaMask
              </Link>
            </Button>
          </>
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
        {modalState === "wrongNetwork" && (
          <>
            <SmallText
              sx={{
                ml: "5%",
                display: "inline-flex",
                fontSize: "18px",
                mb: "30px",
              }}
            >
              Please select one of these networks and wait for page to refresh
            </SmallText>
            {networks.map((network, i) => (
              <Option
                sx={{
                  width: "85%",
                  margin: "0 auto",
                  height: "53px",
                  display: "flex",
                  mb: "10px",
                  border: "1px solid #1130FF",
                  backgroundColor: "#FFFFFF",
                }}
                key={i}
                onClick={() => changeNetwork(network)}
              >
                <SmallText
                  sx={{
                    fontSize: "20px",
                    color: "black",
                    textTransform: "none",
                  }}
                >
                  {network}
                </SmallText>
              </Option>
            ))}
          </>
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
