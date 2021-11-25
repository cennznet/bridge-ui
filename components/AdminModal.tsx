import React, { useState } from "react";
import { Button, Modal } from "@mui/material";
import { StyledModal, Heading, SmallText, Option } from "./StyledComponents";
import { Box } from "@mui/material";

const networks = ["Mainnet", "Rinkeby"];

const AdminModal: React.FC<{
  setModalOpen: Function;
  modalState: string;
}> = ({ setModalOpen, modalState }) => {
  const [open] = useState(true);

  const updateNetworks = async (selectedNetwork) => {
    const { ethereum }: any = window;
    console.log("selectedNetwork", selectedNetwork);
    switch (selectedNetwork) {
      case networks[0]:
        await ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x1" }],
        });
        window.localStorage.setItem("admin-ethereum-chain", "Mainnet");
        break;
      case networks[1]:
        await ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x4" }],
        });
        window.localStorage.setItem("admin-ethereum-chain", "Rinkeby");
        break;
      default:
        break;
    }

    setModalOpen(false);
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
        {modalState !== "" && modalState !== "wrongNetwork" && (
          <>
            <Box sx={{ display: "flex", mt: "3%", pl: "5%" }}>
              <Heading
                sx={{
                  color: "primary.main",
                  fontSize: "24px",
                  mb: "15px",
                }}
              >
                Data Hex for Gnosis-Safe
              </Heading>
            </Box>
            <Box
              sx={{ display: "flex", mt: "3%", pl: "5%", height: "auto" }}
            ></Box>
            <SmallText
              display="inline"
              sx={{
                margin: "0 auto",
                fontSize: "14px",
                mb: "30px",
                width: "80%",
                wordBreak: "break-word",
              }}
            >
              {modalState}
            </SmallText>
          </>
        )}
        {modalState === "wrongNetwork" && (
          <>
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
            m: "10px auto 30px",
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

export default AdminModal;
