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
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          border: "3px outset #cfcfcf",
          padding: 4,
          textAlign: "center",
          borderRadius: 10,
          boxShadow: 24,
          bgcolor: "background.paper",
        }}
      >
        <Typography
          id="modal-modal-title"
          variant="h6"
          component="h4"
          sx={{ color: "secondary.dark" }}
        >
          {modalText}
        </Typography>
        {modalState !== "relayer" &&
          modalState !== "error" &&
          modalState !== "finished" && (
            <Box sx={{ margin: "10px auto" }}>
              <CircularProgress />
            </Box>
          )}
        <Divider sx={{ margin: "15px 0 15px 0" }} />
        {etherscanHash !== "" && etherscanHash !== "noTokenSelected" && (
          <Link
            href={`https://ropsten.etherscan.io/tx/${etherscanHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Typography
              id="modal-modal-title"
              variant="h6"
              component="h6"
              sx={{ color: "secondary.dark" }}
            >
              View transaction on Etherscan
            </Typography>
          </Link>
        )}
        {(modalState === "relayer" ||
          modalState === "error" ||
          modalState === "finished") && (
          <Button
            variant="contained"
            sx={{ color: "secondary.dark" }}
            onClick={() => setModalOpen(false)}
          >
            Close
          </Button>
        )}
      </Box>
    </Modal>
  );
};

export default TxModal;
