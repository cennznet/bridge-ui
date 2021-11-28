import React, { useEffect, useState } from "react";
import Switch from "../components/Switch";
import Deposit from "../components/Deposit";
import Withdraw from "../components/Withdraw";
import NetworkModal from "../components/NetworkModal";
import { Frame, Heading, SmallText } from "../components/StyledComponents";
import WalletModal from "../components/WalletModal";
import { useWeb3 } from "../context/Web3Context";
import { useBlockchain } from "../context/BlockchainContext";
import { useRouter } from "next/router";
import { updateNetworks } from "../utils/networks";

const Bridge: React.FC<{}> = () => {
  const router = useRouter();
  const [isDeposit, toggleIsDeposit] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [currentNetwork, setCurrentNetwork] = useState("");
  const [modalState, setModalState] = useState<string>("");

  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const { selectedAccount, connectWallet }: any = useWeb3();
  const { updateNetwork }: any = useBlockchain();

  useEffect(() => {
    if (!selectedAccount) connectWallet();
    const ethereumNetwork = window.localStorage.getItem("ethereum-network");

    if (currentNetwork !== ethereumNetwork) {
      let network: string;
      switch (ethereumNetwork) {
        case "Mainnet":
          network = "Mainnet/Mainnet";
          break;
        case "Ropsten":
          network = "Ropsten/Rata";
          break;
        case "Kovan":
          network = "Kovan/Nikau";
          break;
        default:
          break;
      }

      if (currentNetwork !== network) {
        const { ethereum }: any = window;
        updateNetwork(ethereum, ethereumNetwork);
      }
      setCurrentNetwork(network);
    }
    //eslint-disable-next-line
  }, [currentNetwork]);

  useEffect(
    () =>
      selectedAccount
        ? setIsWalletConnected(true)
        : setIsWalletConnected(false),
    [selectedAccount]
  );

  const walletClickHandler: React.EventHandler<React.SyntheticEvent> = (
    event: React.SyntheticEvent
  ) => {
    if (isWalletConnected) {
      setModalState("showWallet");
      setModalOpen(true);
    } else {
      connectWallet();
      setModalState("changeAccount");
      setModalOpen(true);
    }
  };

  return (
    <>
      {modalOpen && modalState === "networks" && (
        <NetworkModal
          setModalOpen={setModalOpen}
          setModalState={setModalState}
          currentNetwork={currentNetwork}
        />
      )}
      {modalOpen &&
        (modalState === "showWallet" || modalState === "changeAccount") && (
          <WalletModal
            modalState={modalState}
            setModalOpen={setModalOpen}
            setModalState={setModalState}
          />
        )}
      <Switch isDeposit={isDeposit} toggleIsDeposit={toggleIsDeposit} />
      <Frame
        sx={{
          cursor: "pointer",
          top: "4%",
          right: "30%",
          backgroundColor: modalState === "networks" ? "#1130FF" : "#FFFFFF",
        }}
        onClick={() => {
          setModalOpen(true);
          setModalState("networks");
        }}
      >
        <Heading
          sx={{
            ml: "10px",
            mt: "3px",
            fontSize: "20px",
            flexGrow: 1,
            color: modalState === "networks" ? "#FFFFFF" : "#1130FF",
          }}
        >
          NETWORK
        </Heading>
        <SmallText
          sx={{ color: modalState === "networks" ? "#FFFFFF" : "black" }}
        >
          {currentNetwork}
        </SmallText>
      </Frame>
      <Frame
        sx={{
          top: "4%",
          right: "5%",
          backgroundColor:
            modalState === "showWallet" || modalState === "changeAccount"
              ? "#1130FF"
              : "#FFFFFF",
          cursor: "pointer",
        }}
        onClick={walletClickHandler}
      >
        <Heading
          sx={{
            ml: "10px",
            mt: "3px",
            fontSize: "17px",
            color:
              modalState === "showWallet" || modalState === "changeAccount"
                ? "#FFFFFF"
                : "#1130FF",
            flexGrow: 1,
            whiteSpace: "nowrap",
          }}
        >
          CENNZnet WALLET
        </Heading>
        {selectedAccount && (
          <SmallText
            sx={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              ml: "1.5px",
              fontSize: "15px",
              color:
                modalState === "showWallet" || modalState === "changeAccount"
                  ? "#FFFFFF"
                  : "black",
            }}
          >
            {selectedAccount.name}
          </SmallText>
        )}
      </Frame>
      {isDeposit ? <Deposit /> : <Withdraw />}
    </>
  );
};

export default Bridge;
