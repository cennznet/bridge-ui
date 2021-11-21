import React, { useState } from "react";
import { Button, Modal } from "@mui/material";
import { useBlockchain } from "../context/BlockchainContext";
import {
  StyledModal,
  Heading,
  SmallText,
  Option,
} from "../components/StyledComponents";

const NetworkModal: React.FC<{
  setModalOpen: Function;
  setModalState: Function;
  setCurrentNetwork: Function;
  currentNetwork: string;
}> = ({ setModalOpen, setModalState, setCurrentNetwork, currentNetwork }) => {
  const [open, setOpen] = useState(true);
  const handleClose = () => setOpen(false);
  const [networks] = useState([
    "Mainnet/Mainnet",
    "Ropsten/Rata",
    "Kovan/Nikau",
  ]);
  const [selectedNetwork, setSelectedNetwork] = useState("");
  const { updateNetwork } = useBlockchain();

  const updateNetworks = async (selectedNetwork) => {
    const { ethereum }: any = window;
    setSelectedNetwork(selectedNetwork);
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
    setCurrentNetwork(selectedNetwork);
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <StyledModal
        sx={{
          justifyContent: "center",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Heading
          sx={{
            color: "primary.main",
            fontSize: "24px",
            mt: "3%",
            pl: "5%",
          }}
        >
          NOTE
        </Heading>
        <SmallText sx={{ pl: "5%", mb: "5%" }}>
          Please refresh page after switching network in MetaMask.
        </SmallText>
        <Heading
          sx={{
            color: "primary.main",
            fontSize: "24px",
            pl: "5%",
          }}
        >
          SELECT NETWORK
        </Heading>
        {networks.map((network, i) => (
          <Option
            sx={{
              width: "85%",
              margin: "0 auto",
              height: "53px",
              display: "flex",
              mb: "10px",
              border: "1px solid #1130FF",
              backgroundColor:
                currentNetwork === network ? "#1130FF" : "#FFFFFF",
            }}
            key={i}
            onClick={() => {
              updateNetworks(network);
              setModalState("");
              setModalOpen(false);
            }}
          >
            <SmallText
              sx={{
                fontSize: "20px",
                color: currentNetwork === network ? "#FFFFFF" : "black",
                textTransform: "none",
              }}
            >
              {network}
            </SmallText>
          </Option>
        ))}
        <Button
          sx={{
            fontFamily: "Teko",
            fontWeight: "bold",
            fontSize: "21px",
            lineHeight: "124%",
            color: "#1130FF",
            width: "35%",
            m: "30px auto 50px",
            display: "flex",
          }}
          size="large"
          variant="outlined"
          onClick={() => {
            setModalState("");
            setModalOpen(false);
          }}
        >
          CLOSE
        </Button>
      </StyledModal>
    </Modal>
  );
};

export default NetworkModal;
