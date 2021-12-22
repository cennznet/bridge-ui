import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "../context/Web3Context";
import { Box, Button, TextField } from "@mui/material";
import TxModal from "./TxModal";
import TokenPicker from "./TokenPicker";
import { defineTxModal } from "../utils/modal";
import { useBlockchain } from "../context/BlockchainContext";
import GenericERC20TokenAbi from "../artifacts/GenericERC20Token.json";
import CENNZnetAccountPicker from "./CENNZnetAccountPicker";
import { getMetamaskBalance, ETH } from "../utils/helpers";

const Deposit: React.FC<{}> = () => {
  const [customAddress, setCustomAddress] = useState(false);
  const [token, setToken] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedAccount, updateSelectedAccount] = useState({
    address: "",
    name: "",
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [modal, setModal] = useState({
    state: "",
    text: "",
    hash: "",
  });
  const [tokenBalance, setTokenBalance] = useState<Number>();
  const [helperText, setHelperText] = useState(null);
  const { Contracts, Signer, Account }: any = useBlockchain();
  const { decodeAddress, api }: any = useWeb3();

  //Check MetaMask account has enough tokens to deposit
  useEffect(() => {
    const { ethereum }: any = window;
    if (token !== "")
      (async () => {
        let balance = await getMetamaskBalance(ethereum, token, Account);
        setTokenBalance(balance);
      })();
  }, [token]);

  //Format helper text
  useEffect(() => {
    if (amount !== "") {
      let decimals, amountInWei;
      if (token !== "" && token !== ETH) {
        (async () => {
          const tokenContract = new ethers.Contract(
            token,
            GenericERC20TokenAbi,
            Signer
          );

          decimals = await tokenContract.decimals();
        })();
        amountInWei = ethers.utils.parseUnits(amount, decimals);
        if (Number(amountInWei.toString()) < 2) {
          setHelperText("Deposit amount too low");
        } else if (tokenBalance < Number(amount)) {
          setHelperText("Account balance too low");
        } else {
          setHelperText(null);
        }
      } else if (token === ETH) {
        amountInWei = ethers.utils.parseEther(amount);
        if (Number(amountInWei.toString()) < 2) {
          setHelperText("Deposit amount too low");
        } else if (tokenBalance <= Number(amount)) {
          setHelperText("Account balance too low");
        } else {
          setHelperText(null);
        }
      }
    }
  }, [amount]);

  const depositEth = async () => {
    let tx: any = await Contracts.peg.deposit(
      ETH,
      ethers.utils.parseEther(amount),
      decodeAddress(selectedAccount.address),
      {
        value: ethers.utils.parseEther(amount),
      }
    );

    setModal(defineTxModal("deposit", tx.hash, setModalOpen));
    await tx.wait();
    setModal(defineTxModal("relayer", "", setModalOpen));
  };

  const depositERC20 = async () => {
    const tokenContract = new ethers.Contract(
      token,
      GenericERC20TokenAbi,
      Signer
    );

    const decimals = await tokenContract.decimals();

    let tx: any = await tokenContract.approve(
      Contracts.peg.address,
      ethers.utils.parseUnits(amount, decimals)
    );
    setModal(defineTxModal("approve", tx.hash, setModalOpen));
    await tx.wait();
    tx = await Contracts.peg.deposit(
      token,
      ethers.utils.parseUnits(amount),
      decodeAddress(selectedAccount.address)
    );
    setModal(defineTxModal("deposit", tx.hash, setModalOpen));
    await tx.wait();
    setModal(defineTxModal("relayer", "", setModalOpen));
  };

  const deposit = async () => {
    setModalOpen(false);
    const bridgePaused = await api.query.ethBridge.bridgePaused();
    const ETHdepositsActive = await Contracts.peg.depositsActive();
    const CENNZdepositsActive = await api.query.erc20Peg.depositsActive();
    if (
      bridgePaused.isFalse &&
      ETHdepositsActive &&
      CENNZdepositsActive.isTrue
    ) {
      if (token === ETH) {
        depositEth();
      } else {
        depositERC20();
      }
    } else {
      setModal(defineTxModal("bridgePaused", "", setModalOpen));
    }
  };

  return (
    <>
      {modalOpen && (
        <TxModal
          modalState={modal.state}
          modalText={modal.text}
          etherscanHash={modal.hash}
          setModalOpen={setModalOpen}
        />
      )}
      <Box
        component="form"
        sx={{
          width: "552px",
          height: "auto",
          margin: "0 auto",
          background: "#FFFFFF",
          border: "4px solid #1130FF",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "0px",
        }}
      >
        <TokenPicker setToken={setToken} />

        <TextField
          label="Amount"
          variant="outlined"
          required
          sx={{
            width: "80%",
            m: "30px 0 30px",
          }}
          onChange={(e) => setAmount(e.target.value.substring(0, 20))}
          helperText={helperText}
        />
        {customAddress ? (
          <>
            <TextField
              label="Destination"
              variant="outlined"
              required
              sx={{
                width: "80%",
              }}
              onChange={(e) =>
                updateSelectedAccount({
                  name: "",
                  address: e.target.value,
                })
              }
            />
            <Button
              size="small"
              variant="outlined"
              onClick={() => setCustomAddress(false)}
              sx={{
                fontFamily: "Teko",
                fontWeight: "bold",
                fontSize: "21px",
                lineHeight: "124%",
                color: "#1130FF",
                width: "80%",
                mb: "30px",
                textTransform: "none",
              }}
            >
              SELECT CENNZnet ADDRESS INSTEAD*
            </Button>
          </>
        ) : (
          <>
            <CENNZnetAccountPicker
              updateSelectedAccount={updateSelectedAccount}
            />
            <Button
              size="small"
              variant="outlined"
              onClick={() => setCustomAddress(true)}
              sx={{
                fontFamily: "Teko",
                fontWeight: "bold",
                fontSize: "21px",
                lineHeight: "124%",
                color: "#1130FF",
                width: "80%",
                mb: "30px",
                textTransform: "none",
              }}
            >
              ENTER CENNZnet ADDRESS INSTEAD*
            </Button>
          </>
        )}
        <Button
          sx={{
            fontFamily: "Teko",
            fontWeight: "bold",
            fontSize: "21px",
            lineHeight: "124%",
            color: "#1130FF",
            mt: "30px",
            mb: "50px",
          }}
          disabled={
            amount && token && selectedAccount && Number(amount) <= tokenBalance
              ? false
              : true
          }
          size="large"
          variant="outlined"
          onClick={deposit}
        >
          Deposit
        </Button>
      </Box>
    </>
  );
};

export default Deposit;
