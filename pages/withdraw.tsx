import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { initEthers } from "../utils/ethers";
import TxModal from "../components/TxModal";
import { withdrawCENNZside } from "../utils/cennznet";

interface Token {
  address: "";
  approve: (pegAddress: string, amount: any) => {};
  balanceOf: (ethAddress: string) => {};
}

interface Peg {
  address: "";
  withdraw: (
    tokenAddress: string,
    amount: any,
    recipient: any,
    proof: any,
    options: {
      value: any;
      gasLimit: number;
    }
  ) => {};
}

interface Bridge {
  verificationFee: () => any;
}

const Withdraw: React.FC<{}> = () => {
  const [token, setToken] = useState(0);
  const [amount, setAmount] = useState("");
  const [contracts, setContracts] = useState({
    bridge: {} as Bridge,
    testToken: {} as Token,
    testToken2: {} as Token,
    peg: {} as Peg,
  });
  const [account, setAccount] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modal, setModal] = useState({
    state: "",
    text: "",
    hash: "",
  });

  useEffect(() => {
    initEthers().then((ethers) => {
      const { bridge, peg, testToken, testToken2, accounts }: any = ethers;
      setContracts({ bridge, peg, testToken, testToken2 });
      setAccount(accounts[0]);
    });
  }, []);

  const selectToken = () => {
    let selectedToken: any;
    switch (token) {
      case 1:
        selectedToken = contracts.testToken;
        break;
      case 2:
        selectedToken = contracts.testToken2;
        break;
      default:
        selectedToken = null;
        break;
    }

    if (!selectedToken) {
      setModalOpen(true);
      setModal({
        state: "error",
        hash: "",
        text: "Please select a token",
      });
    } else {
      return selectedToken;
    }
  };

  async function withdraw() {
    const eventProof = await withdrawCENNZside(amount, account);
    setModal({
      state: "withdrawCENNZ",
      text: "Withdrawing your tokens from CENNZnet side...",
      hash: "",
    });
    await withdrawEthSide(amount, eventProof, account);
  }

  async function withdrawEthSide(
    amount: any,
    eventProof: any,
    ethAddress: string
  ) {
    setModalOpen(false);
    const selectedToken: Token = selectToken();

    let verificationFee = await contracts.bridge.verificationFee();
    // Make  withdraw for beneficiary1
    let withdrawAmount = amount;
    const signatures = eventProof.signatures;
    let v: any = [],
      r: any = [],
      s: any = []; // signature params
    signatures.forEach((signature: any) => {
      const hexifySignature = ethers.utils.hexlify(signature);
      const sig = ethers.utils.splitSignature(hexifySignature);
      v.push(sig.v);
      r.push(sig.r);
      s.push(sig.s);
    });

    let tx: any = await contracts.peg.withdraw(
      selectedToken.address,
      withdrawAmount,
      ethAddress,
      {
        eventId: eventProof.eventId,
        validatorSetId: eventProof.validatorSetId,
        v,
        r,
        s,
      },
      {
        gasLimit: 500000,
        value: verificationFee,
      }
    );

    setModal({
      state: "withdrawETH",
      text: "Withdrawing your tokens from ETH side...",
      hash: tx.hash,
    });
    await tx.wait();

    // Check beneficiary balance after first withdrawal
    let balanceAfter: any = await selectedToken.balanceOf(ethAddress);
    console.log(
      "Beneficiary ERC20 token balance after withdrawal:",
      balanceAfter.toString()
    );
  }

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
          margin: "0 auto",
          borderRadius: 10,
          width: "30%",
          height: "auto",
          display: "block",
          border: "3px outset #cfcfcf",
        }}
      >
        <FormControl
          sx={{
            display: "flex",
            width: "70%",
            margin: "20px auto",
            borderRadius: 10,
          }}
          required
        >
          <InputLabel>Token</InputLabel>
          <Select
            value={token}
            label="Token"
            onChange={(e) => setToken(e.target.value as number)}
          >
            <MenuItem value={1}>TestToken</MenuItem>
            <MenuItem value={2}>TestToken2</MenuItem>
          </Select>
        </FormControl>
        <TextField
          id="amount"
          label="Amount"
          variant="filled"
          required
          sx={{
            display: "flex",
            width: "70%",
            margin: "20px auto",
            borderRadius: 10,
          }}
          onChange={(e) => setAmount(e.target.value)}
        />
        <Button
          sx={{ margin: "15px auto", display: "flex" }}
          variant="contained"
          onClick={withdraw}
        >
          Withdraw
        </Button>
      </Box>
    </>
  );
};

export default Withdraw;
