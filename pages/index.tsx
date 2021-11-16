import React, { useEffect, useState } from "react";
import { Button, Box, Divider, Typography } from "@mui/material";
import { useBlockchain } from "../context/BlockchainContext";
import CENNZnetWallet from "../components/CENNZnetWallet";
import NetworkModal from "../components/NetworkModal";
import store from "store";

const Home: React.FC<{}> = () => {
  const { Account } = useBlockchain();
  const [modalOpen, setModalOpen] = useState(false);
  const [currentNetwork, setCurrentNetwork] = useState("");

  useEffect(() => {
    const ethereumNetwork = store.get("ethereum-network");
    switch (ethereumNetwork) {
      case "Mainnet":
        setCurrentNetwork("Mainnet/Mainnet");
        break;
      case "Ropsten":
        setCurrentNetwork("Ropsten/Rata");
        break;
      case "Kovan":
        setCurrentNetwork("Kovan/Nikau");
        break;
      default:
        break;
    }
  }, []);

  return (
    <>
      {modalOpen && (
        <NetworkModal
          setModalOpen={setModalOpen}
          setCurrentNetwork={setCurrentNetwork}
        />
      )}
      <Box
        sx={{
          margin: "0 auto",
          borderRadius: 10,
          width: "30%",
          height: "auto",
          display: "block",
          border: "3px outset #cfcfcf",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            textAlign: "center",
            color: "secondary.dark",
            marginBottom: "10px",
          }}
        >
          Networks
        </Typography>
        <Typography
          variant="h6"
          sx={{
            textAlign: "center",
            color: "secondary.dark",
            marginBottom: "10px",
          }}
        >
          Current Networks: {currentNetwork}
        </Typography>
        <Button
          variant="contained"
          sx={{
            margin: "0 auto 15px",
            display: "flex",
            textTransform: "none",
            width: "70%",
          }}
          onClick={() => setModalOpen(true)}
        >
          <Typography
            sx={{
              color: "secondary.dark",
            }}
          >
            Change Networks
          </Typography>
        </Button>
        <Divider />
        <Typography
          variant="h4"
          sx={{
            textAlign: "center",
            color: "secondary.dark",
            margin: "5px 0 10px",
          }}
        >
          Wallets
        </Typography>
        <Typography
          variant="h6"
          sx={{
            textAlign: "center",
            color: "secondary.dark",
          }}
        >
          MetaMask:{" "}
          {Account.substr(0, 6).concat(
            "...",
            Account.substr(Account.length - 4, 4)
          )}
        </Typography>
        <CENNZnetWallet />
      </Box>
    </>
  );
};

export default Home;
