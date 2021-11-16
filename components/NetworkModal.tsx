import React, { useState, useEffect } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Divider,
  Modal,
  TextField,
  Typography,
} from "@mui/material";
import { useBlockchain } from "../context/BlockchainContext";

const NetworkModal: React.FC<{
  setModalOpen: Function;
  setCurrentNetwork: Function;
}> = ({ setModalOpen, setCurrentNetwork }) => {
  const [open, setOpen] = useState(true);
  const handleClose = () => setOpen(false);
  const [networks] = useState([
    "Mainnet/Mainnet",
    "Ropsten/Rata",
    "Kovan/Nikau",
  ]);
  const [selectedNetwork, setSelectedNetwork] = useState();
  const { updateNetwork } = useBlockchain();

  useEffect(() => {
    const { ethereum }: any = window;
    if (selectedNetwork) {
      switch (selectedNetwork) {
        case "Mainnet/Mainnet":
          updateNetwork(ethereum, "Mainnet");
          break;
        case "Ropsten/Rata":
          updateNetwork(ethereum, "Ropsten");
          break;
        case "Kovan/Nikau":
          updateNetwork(ethereum, "Kovan");
          break;
        default:
          break;
      }
      setCurrentNetwork(selectedNetwork);
    }
  }, [selectedNetwork]);

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
          p: 4,
          textAlign: "center",
          borderRadius: 10,
          boxShadow: 24,
          bgcolor: "background.paper",
        }}
      >
        {selectedNetwork ? (
          <Typography sx={{ color: "secondary.dark" }}>
            Please switch network in MetaMask!
          </Typography>
        ) : (
          <Autocomplete
            disablePortal
            options={networks}
            onSelect={(e: any) => setSelectedNetwork(e.target.value)}
            sx={{
              display: "flex",
              width: "70%",
              margin: "20px auto",
              borderRadius: 10,
            }}
            renderInput={(params) => <TextField {...params} label="Networks" />}
          />
        )}
        <Divider sx={{ margin: "15px 0 15px 0" }} />
        <Button
          variant="contained"
          sx={{ color: "secondary.dark" }}
          onClick={() => setModalOpen(false)}
        >
          Close
        </Button>
      </Box>
    </Modal>
  );
};

export default NetworkModal;
