import React, { useState } from "react";
import { Box, Button } from "@mui/material";
import { useBlockchain } from "../context/BlockchainContext";
import { Frame, Heading, SmallText } from "../components/StyledComponents";
import { useRouter } from "next/router";
import { useWeb3 } from "../context/Web3Context";
import ErrorModal from "../components/ErrorModal";

const Home: React.FC<{}> = () => {
  const router = useRouter();
  const { Account } = useBlockchain();
  const { updateNetwork }: any = useBlockchain();
  const { connectWallet, selectedAccount }: any = useWeb3();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalState, setModalState] = useState("");

  const connectMetamask = async () => {
    const { ethereum } = window as any;
    await ethereum.request({ method: "eth_requestAccounts" });
    const ethChainId = await ethereum.request({ method: "eth_chainId" });
    let ethereumNetwork;
    switch (ethChainId) {
      case "0x1":
        ethereumNetwork = "Mainnet";
        break;
      case "0x3":
        ethereumNetwork = "Ropsten";
        break;
      case "0x2a":
        ethereumNetwork = "Kovan";
        break;
      default:
        setModalState("wrongNetwork");
        setModalOpen(true);
        break;
    }

    window.localStorage.setItem("ethereum-chain", ethereumNetwork);
    updateNetwork(ethereum, ethereumNetwork);
  };

  const CENNZnetButton = (
    <Frame
      sx={{
        top: "40%",
        cursor: "pointer",
        backgroundColor: "#FFFFFF",
        height: "60px",
        width: "70%",
      }}
      onClick={() => connectWallet()}
    >
      {selectedAccount ? (
        <>
          <Heading
            sx={{
              color: "primary.main",
              ml: "10px",
              mt: "3px",
              fontSize: "20px",
              flexGrow: 1,
              textTransform: "none",
            }}
          >
            CENNZnet
          </Heading>
          <SmallText
            sx={{
              color: "black",
              fontSize: "16px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              ml: "5px",
            }}
          >
            {selectedAccount.name}
          </SmallText>
        </>
      ) : (
        <Heading
          sx={{
            fontSize: "20px",
            margin: "0 auto",
            color: "primary.main",
            textTransform: "none",
          }}
        >
          CONNECT CENNZnet WALLET
        </Heading>
      )}
    </Frame>
  );

  const MetamaskButton = (
    <Frame
      sx={{
        display: "flex",
        mt: "8%",
        width: "70%",
        height: "60px",
        cursor: "pointer",
        backgroundColor: "white",
      }}
      onClick={connectMetamask}
    >
      {Account ? (
        <>
          <Heading
            sx={{
              color: "primary.main",
              ml: "10px",
              mt: "3px",
              fontSize: "20px",
              flexGrow: 1,
            }}
          >
            METAMASK
          </Heading>
          <SmallText sx={{ color: "black", fontSize: "16px" }}>
            {Account.substr(0, 6).concat(
              "...",
              Account.substr(Account.length - 4, 4)
            )}
          </SmallText>
        </>
      ) : (
        <Heading
          sx={{
            color: "primary.main",
            fontSize: "20px",
            margin: "0 auto",
          }}
        >
          CONNECT METAMASK WALLET
        </Heading>
      )}
    </Frame>
  );

  return (
    <>
      {modalOpen && (
        <ErrorModal setModalOpen={setModalOpen} modalState={modalState} />
      )}
      <Box
        sx={{
          position: "absolute",
          width: "40%",
          height: "auto",
          left: "30%",
          top: "25%",
          background: "#FFFFFF",
          border: "4px solid #1130FF",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          alignContent: "center",
          alignItems: "center",
        }}
      >
        {MetamaskButton}
        {CENNZnetButton}
        <Button
          variant="outlined"
          size="large"
          disabled={Account && selectedAccount ? false : true}
          sx={{
            width: "50%",
            backgroundColor: "#FFFFFF",
            color: "primary.main",
            m: "45% 0 30px",
            border: "2.5px solid #1130FF",
          }}
          onClick={() => router.push("/bridge")}
        >
          <Heading sx={{ fontSize: "20px" }}>enter bridge</Heading>
        </Button>
      </Box>
    </>
  );
};

export default Home;
