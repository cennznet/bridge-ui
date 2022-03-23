import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Link,
  Modal,
} from "@mui/material";
import { Heading, SmallText, StyledModal } from "./StyledComponents";
import { useWeb3 } from "../context/Web3Context";
interface Props {
  modalState: string;
  modalText: string;
  etherscanHash: string;
  resetModal: Function;
}

const TxModal: React.FC<Props> = ({
  modalText,
  etherscanHash,
  modalState,
  resetModal,
}) => {
  const [open] = useState(true);
  const [etherscanLink, setEtherscanLink] = useState("");
  const [intervalId, setIntervalId] = useState<NodeJS.Timer>(null);
  const [relayerStatus, updateRelayerStatus] = useState("");
  const [eventConfirmations, setEventConfirmations] = useState(0);
  const [confirms, updateConfirms] = useState(0);
  const { api } = useWeb3();

  useEffect(() => {
    (async () => {
      const confirmations = (
        await api.query.ethBridge.eventConfirmations()
      ).toNumber();

      setEventConfirmations(confirmations);
    })();
  }, [api]);

  const checkRelayerStatus = (relayerLink) => {
    axios.get(relayerLink).then((res) => {
      updateRelayerStatus(res.data.status);
    });
  };

  useEffect(() => {
    const ethereumNetwork = window.localStorage.getItem("ethereum-network");
    let relayerLink;

    switch (ethereumNetwork) {
      default:
      case "Mainnet":
        setEtherscanLink(`https://etherscan.io/tx/${etherscanHash}`);
        if (modalState === "relayer")
          relayerLink = `https://bridge-contracts.centralityapp.com/transactions/${etherscanHash}`;
        break;
      case "Ropsten":
        setEtherscanLink(`https://ropsten.etherscan.io/tx/${etherscanHash}`);
        if (modalState === "relayer")
          relayerLink = `https://bridge-contracts.rata.centrality.me/transactions/${etherscanHash}`;
        break;
      case "Kovan":
        setEtherscanLink(`https://kovan.etherscan.io/tx/${etherscanHash}`);
        if (modalState === "relayer")
          relayerLink = `https://bridge-contracts.nikau.centrality.me/transactions/${etherscanHash}`;
        break;
    }

    if (modalState === "relayer") {
      switch (relayerStatus) {
        default:
          const interval = setInterval(
            () => checkRelayerStatus(relayerLink),
            10000
          );
          setIntervalId(interval);
          break;
        case "EthereumConfirming":
          updateConfirms(Math.round(0.33 * eventConfirmations));
          break;
        case "CennznetConfirming":
          updateConfirms(Math.round(0.66 * eventConfirmations));
          break;
        case "Successful":
          updateConfirms(eventConfirmations);
          clearInterval(intervalId);
          break;
      }
    }
    //eslint-disable-next-line
  }, [etherscanHash, modalState, relayerStatus]);

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
            {relayerStatus === "Successful"
              ? "DONE! YOU MAY NOW CLOSE THIS WINDOW."
              : modalText}
          </Heading>
          {modalState !== "relayer" &&
            modalState !== "bridgePaused" &&
            modalState !== "error" &&
            modalState !== "finished" &&
            modalState !== "balanceTooLow" && (
              <Box sx={{ margin: "10px auto 50px" }}>
                <CircularProgress size="3rem" sx={{ color: "black" }} />
              </Box>
            )}
          {modalState === "relayer" && relayerStatus !== "Successful" && (
            <Box sx={{ margin: "10px auto 20px" }}>
              <CircularProgress size="3rem" sx={{ color: "black" }} />
              <SmallText
                sx={{
                  color: "black",
                  fontSize: "14",
                  margin: "10px auto 0",
                }}
              >
                Confirmations: {confirms} / {eventConfirmations}
              </SmallText>
            </Box>
          )}
          {etherscanHash !== "" &&
            etherscanHash !== "noTokenSelected" &&
            etherscanHash !== "balanceTooLow" &&
            modalState !== "relayer" && (
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
          {(modalState === "bridgePaused" ||
            modalState === "error" ||
            modalState === "finished") && (
            <Button
              variant="contained"
              sx={{
                backgroundColor: "primary.main",
                width: "50%",
                margin: "50px auto 50px",
              }}
              onClick={() => resetModal()}
            >
              <Heading sx={{ color: "#FFFFFF", fontSize: "24px" }}>
                close
              </Heading>
            </Button>
          )}
          {modalState === "relayer" && (
            <Button
              variant="contained"
              sx={{
                backgroundColor: "primary.main",
                width: "50%",
                margin: "50px auto 50px",
              }}
              onClick={() => {
                updateRelayerStatus("");
                resetModal();
              }}
              disabled={relayerStatus === "Successful" ? false : true}
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
