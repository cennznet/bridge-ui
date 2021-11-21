import React, { useEffect, useState } from "react";
import Switch from "../components/Switch";
import Deposit from "../components/Deposit";
import Withdraw from "../components/Withdraw";
import NetworkModal from "../components/NetworkModal";
import store from "store";
import { Frame, Heading, SmallText } from "../components/StyledComponents";
import WalletModal from "../components/WalletModal";
import { useWeb3 } from "../context/Web3Context";

const Bridge: React.FC<{}> = () => {
  const [isDeposit, toggleIsDeposit] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [currentNetwork, setCurrentNetwork] = useState("");
  const [modalState, setModalState] = useState<string>("");

  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const { selectedAccount, connectWallet }: any = useWeb3();

  useEffect(() => {
    if (selectedAccount) {
      setIsWalletConnected(true);
    } else {
      setIsWalletConnected(false);
    }
  }, [selectedAccount]);

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
      {modalOpen && modalState === "networks" && (
        <NetworkModal
          setModalOpen={setModalOpen}
          setModalState={setModalState}
          setCurrentNetwork={setCurrentNetwork}
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
          right: "26%",
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
          right: "6%",
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
            fontSize: "18px",
            color:
              modalState === "showWallet" || modalState === "changeAccount"
                ? "#FFFFFF"
                : "#1130FF",
            flexGrow: 1,
          }}
        >
          CENNZnet WALLET
        </Heading>
        {selectedAccount && (
          <SmallText
            sx={{
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
