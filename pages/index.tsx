import React, { useEffect, useState } from "react";
import { Button, Box, Divider, Typography } from "@mui/material";
import { useBlockchain } from "../context/BlockchainContext";
import NetworkModal from "../components/NetworkModal";
import store from "store";
import { Frame, Heading, SmallText } from "../components/StyledComponents";
import { useRouter } from "next/router";

const Home: React.FC<{}> = () => {
  const router = useRouter();
  const { Account } = useBlockchain();
  const [modalOpen, setModalOpen] = useState(false);
  const [showMetamaskAccount, setShowMetamaskAccount] = useState(false);

  useEffect(() => {
    if (Account) {
      setShowMetamaskAccount(true);
    }
  }, [Account]);

  const CENNZnetButton = (
    <Frame
      sx={{
        top: "4%",
        right: "30%",
        cursor: "pointer",
        backgroundColor: "#FFFFFF",
      }}
      onClick={() => router.push("/bridge")}
    >
      <Heading
        sx={{
          fontSize: "20px",
          margin: "0 auto",
          color: "primary.main",
        }}
      >
        ENTER BRIDGE
      </Heading>
    </Frame>
  );

  const MetamaskButton = (
    <Frame
      sx={{
        top: "4%",
        right: "8%",
        cursor: "pointer",
        backgroundColor: "white",
      }}
      onClick={async () => {
        const { ethereum }: any = window;
        await ethereum.request({
          method: "eth_requestAccounts",
        });
      }}
    >
      {showMetamaskAccount ? (
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
          CONNECT METAMASK
        </Heading>
      )}
    </Frame>
  );

  return (
    <>
      {CENNZnetButton}
      {MetamaskButton}
    </>
  );

  //   return (
  //     <>
  //       {modalOpen && <>{alert("yeet")}</>}
  //       <Box
  //         sx={{
  //           margin: "0 auto",
  //           borderRadius: 10,
  //           width: "30%",
  //           height: "auto",
  //           display: "block",
  //           border: "3px outset #cfcfcf",
  //         }}
  //       >
  //         <Typography
  //           variant="h4"
  //           sx={{
  //             textAlign: "center",
  //             color: "secondary.dark",
  //             marginBottom: "10px",
  //           }}
  //         >
  //           Networks
  //         </Typography>
  //         <Typography
  //           variant="h6"
  //           sx={{
  //             textAlign: "center",
  //             color: "secondary.dark",
  //             marginBottom: "10px",
  //           }}
  //         >
  //           Current Networks: {currentNetwork}
  //         </Typography>
  //         <Button
  //           variant="contained"
  //           sx={{
  //             margin: "0 auto 15px",
  //             display: "flex",
  //             textTransform: "none",
  //             width: "70%",
  //           }}
  //           onClick={() => setModalOpen(true)}
  //         >
  //           <Typography
  //             sx={{
  //               color: "secondary.dark",
  //             }}
  //           >
  //             Change Networks
  //           </Typography>
  //         </Button>
  //         <Divider />
  //         <Typography
  //           variant="h4"
  //           sx={{
  //             textAlign: "center",
  //             color: "secondary.dark",
  //             margin: "5px 0",
  //           }}
  //         >
  //           Wallets
  //         </Typography>
  //         <Typography
  //           variant="h6"
  //           sx={{
  //             textAlign: "center",
  //             color: "secondary.dark",
  //           }}
  //         >
  //           MetaMask:
  //           <br />
  //           {Account.substr(0, 6).concat(
  //             "...",
  //             Account.substr(Account.length - 4, 4)
  //           )}
  //         </Typography>
  //         <Typography
  //           sx={{
  //             textAlign: "center",
  //             color: "secondary.dark",
  //           }}
  //         >
  //           Connected to network: {metamaskNetwork}
  //         </Typography>
  //         <CENNZnetWallet />
  //       </Box>
  //     </>
  //   );
};

export default Home;
