import React, { useState } from "react";
import {
  Box,
  CircularProgress,
  Divider,
  Link,
  Modal,
  Typography,
} from "@mui/material";

const TxModal: React.FC<{ modalText: string; etherscanHash: string }> = ({
  modalText,
  etherscanHash,
}) => {
  const [open, setOpen] = useState(true);
  const handleClose = () => setOpen(false);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-locking-tokens"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          border: "2px solid #000",
          boxShadow: 24,
          p: 4,
          textAlign: "center",
          borderRadius: 5,
        }}
      >
        <Typography id="modal-modal-title" variant="h6" component="h4">
          {modalText}
        </Typography>
        <Box sx={{ margin: "10px auto" }}>
          <CircularProgress />
        </Box>
        <Divider sx={{ margin: "15px 0 15px 0" }} />
        <Link
          href={`https://ropsten.etherscan.io/tx/${etherscanHash}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Typography
            id="modal-modal-title"
            variant="h6"
            component="h6"
            color="black"
          >
            View transaction on Etherscan
          </Typography>
        </Link>
      </Box>
    </Modal>
  );
};

export default TxModal;
