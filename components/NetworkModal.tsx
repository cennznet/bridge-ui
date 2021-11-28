import React, { useState } from "react";
import { Button, Modal } from "@mui/material";
import { useBlockchain } from "../context/BlockchainContext";
import {
  StyledModal,
  Heading,
  SmallText,
  Option,
} from "../components/StyledComponents";
import { updateNetworks } from "../utils/networks";

const networks = ["Mainnet/Mainnet", "Ropsten/Rata", "Kovan/Nikau"];

const NetworkModal: React.FC<{
  setModalOpen: Function;
  setModalState: Function;
  currentNetwork: string;
}> = ({ setModalOpen, setModalState, currentNetwork }) => {
  const [open] = useState(true);
  const { updateNetwork } = useBlockchain();

  const changeNetwork = (selectedNetwork) => {
    updateNetworks(selectedNetwork, updateNetwork).then(() =>
      window.location.reload()
    );
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
          Please select one of these networks and wait for page to refresh
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
              changeNetwork(network);
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
