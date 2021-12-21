import React, { useEffect, useState } from "react";
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Link,
  Modal,
} from "@mui/material";
import { Heading, StyledModal } from "./StyledComponents";
interface Props {
  modalState: string;
  modalText: string;
  etherscanHash: string;
  setModalOpen: (open: boolean) => void;
}

const TxModal: React.FC<Props> = ({
  modalText,
  etherscanHash,
  modalState,
  setModalOpen,
}) => {
  const [open] = useState(true);
  const [etherscanLink, setEtherscanLink] = useState("");

  useEffect(() => {
    const ethereumNetwork = window.localStorage.getItem("ethereum-network");

    switch (ethereumNetwork) {
      default:
      case "Mainnet":
        setEtherscanLink(`https://etherscan.io/tx/${etherscanHash}`);
        break;
      case "Ropsten":
        setEtherscanLink(`https://ropsten.etherscan.io/tx/${etherscanHash}`);
        break;
      case "Kovan":
        setEtherscanLink(`https://kovan.etherscan.io/tx/${etherscanHash}`);
        break;
    }
  }, [etherscanHash]);

  return (
    <Backdrop
      sx={{
        backgroundColor: "rgba(17,48,255,0.5)",
        opacity: "0.3",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
      open={open}
    >
      <Modal open={open}>
        <StyledModal
          sx={{
            justifyContent: "center",
            display: "flex",
            flexDirection: "column",
            border: "4px solid black",
            textAlign: "center",
          }}
        >
          <Heading
            sx={{
              color: "black",
              fontSize: "24px",
              letterSpacing: "1px",
              m: "50px auto 15px",
              maxWidth: "70%",
            }}
          >
            {modalText}
          </Heading>
          {modalState !== "relayer" &&
            modalState !== "bridgePaused" &&
            modalState !== "error" &&
            modalState !== "finished" && (
              <Box sx={{ margin: "10px auto 50px" }}>
                <CircularProgress size="3rem" sx={{ color: "black" }} />
              </Box>
            )}
          {etherscanHash !== "" && etherscanHash !== "noTokenSelected" && (
            <Button
              size="large"
              variant="contained"
              sx={{
                backgroundColor: "primary.main",
                width: "50%",
                margin: "20px auto 50px",
              }}
            >
              <Link
                href={etherscanLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Heading sx={{ color: "#FFFFFF", fontSize: "24px" }}>
                  View on Etherscan
                </Heading>
              </Link>
            </Button>
          )}
          {(modalState === "relayer" ||
            modalState === "bridgePaused" ||
            modalState === "error" ||
            modalState === "finished") && (
            <Button
              variant="contained"
              sx={{
                backgroundColor: "primary.main",
                width: "50%",
                margin: "50px auto 50px",
              }}
              onClick={() => setModalOpen(false)}
              data-testid="tx-close-button"
            >
              <Heading sx={{ color: "#FFFFFF", fontSize: "24px" }}>
                close
              </Heading>
            </Button>
          )}
        </StyledModal>
      </Modal>
    </Backdrop>
  );
};

export default TxModal;
