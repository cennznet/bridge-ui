import React, { useState } from "react";
import {
  Box,
  CircularProgress,
  Divider,
  Link,
  Modal,
  Typography,
} from "@mui/material";
import useStyles from "../utils/styles";

const TxModal: React.FC<{ modalText: string; etherscanHash: string }> = ({
  modalText,
  etherscanHash,
}) => {
  const classes = useStyles();
  const [open, setOpen] = useState(true);
  const handleClose = () => setOpen(false);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-locking-tokens"
    >
      <Box
        className={classes.modal}
        sx={{ boxShadow: 24, bgcolor: "background.paper" }}
      >
        <Typography
          id="modal-modal-title"
          variant="h6"
          component="h4"
          sx={{ color: "secondary.dark" }}
        >
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
            sx={{ color: "secondary.dark" }}
          >
            View transaction on Etherscan
          </Typography>
        </Link>
      </Box>
    </Modal>
  );
};

export default TxModal;
