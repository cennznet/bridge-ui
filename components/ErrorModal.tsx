import React, { useState } from "react";
import { Button, Link, Modal } from "@mui/material";
import { StyledModal, Heading, SmallText, Option } from "./StyledComponents";
import { Box } from "@mui/material";
import { useBlockchain } from "../context/BlockchainContext";

const ErrorModal: React.FC<{
  setModalOpen: Function;
  modalState: string;
}> = ({ setModalOpen, modalState }) => {
  const [open, setOpen] = useState(true);
  const [networks] = useState([
    "Mainnet/Mainnet",
    "Ropsten/Rata",
    "Kovan/Nikau",
  ]);
  const { updateNetwork } = useBlockchain();

  const updateNetworks = async (selectedNetwork) => {
    const { ethereum }: any = window;
    switch (selectedNetwork) {
      case networks[0]:
        await ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x1" }],
        });
        updateNetwork(ethereum, "Mainnet");
        window.localStorage.setItem("ethereum-chain", "Mainnet");
        break;
      case networks[1]:
        await ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x3" }],
        });
        updateNetwork(ethereum, "Ropsten");
        window.localStorage.setItem("ethereum-chain", "Ropsten");
        break;
      case networks[2]:
        await ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x2a" }],
        });
        updateNetwork(ethereum, "Kovan");
        window.localStorage.setItem("ethereum-chain", "Kovan");
        break;
      default:
        break;
    }

    setModalOpen(false);
  };

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
              Please select one of these networks and refresh page
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
                onClick={() => updateNetworks(network)}
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
