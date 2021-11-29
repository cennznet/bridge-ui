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
  data: {
    etherscanHash: any;
    CENNZnetAccount: any;
  };
  setModalOpen: (open: boolean) => void;
}

const TxModal: React.FC<Props> = ({
  modalText,
  data,
  modalState,
  setModalOpen,
}) => {
  const [open] = useState(true);
  const [etherscanLink, setEtherscanLink] = useState("");
  const [UNcoverLink, setUNcoverLink] = useState("");

  useEffect(() => {
    const ethereumNetwork = window.localStorage.getItem("ethereum-network");

    switch (ethereumNetwork) {
      default:
      case "Mainnet":
        if (data.CENNZnetAccount !== "")
          setUNcoverLink(
            `https://uncoverexplorer.com/account/${data.CENNZnetAccount}`
          );
        else setEtherscanLink(`https://etherscan.io/tx/${data.etherscanHash}`);
        break;
      case "Ropsten":
        setEtherscanLink(
          `https://ropsten.etherscan.io/tx/${data.etherscanHash}`
        );
        break;
      case "Kovan":
        if (data.CENNZnetAccount !== "")
          setUNcoverLink(
            `https://uncoverexplorer.com/account/${data.CENNZnetAccount}/?network=Nikau`
          );
        else
          setEtherscanLink(
            `https://kovan.etherscan.io/tx/${data.etherscanHash}`
          );
        break;
    }
  }, [data]);

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
          {data.etherscanHash !== "" &&
            data.etherscanHash !== "noTokenSelected" && (
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
          {modalState === "relayer" && UNcoverLink !== "" && (
            <Button
              size="large"
              variant="contained"
              sx={{
                backgroundColor: "primary.main",
                width: "50%",
                margin: "30px auto 5px",
                textTransform: "none",
              }}
            >
              <Link
                href={UNcoverLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Heading sx={{ color: "#FFFFFF", fontSize: "24px" }}>
                  VIEW ON UNcover
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
                margin:
                  modalState === "relayer" ? "0 auto 50px" : "50px auto 50px",
              }}
              onClick={() => setModalOpen(false)}
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
