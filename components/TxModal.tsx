import React, { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Link,
  Modal,
  Typography,
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
  const [open, setOpen] = useState(true);
  const handleClose = () => setOpen(false);

  return (
    <Modal open={open} onClose={handleClose}>
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
              href={`https://ropsten.etherscan.io/tx/${etherscanHash}`}
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
          >
            <Heading sx={{ color: "#FFFFFF", fontSize: "24px" }}>close</Heading>
          </Button>
        )}
      </StyledModal>
    </Modal>
  );
};

export default TxModal;
