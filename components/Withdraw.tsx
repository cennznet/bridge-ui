import React, { useState } from "react";
import { ethers } from "ethers";
import { Box, Button, TextField } from "@mui/material";
import TxModal from "./TxModal";
import TokenPicker from "./TokenPicker";
import { defineTxModal } from "../utils/modal";
import { useBlockchain } from "../context/BlockchainContext";
import { useWeb3 } from "../context/Web3Context";

const Withdraw: React.FC<{}> = () => {
  const [customToken, setCustomToken] = useState(false);
  const [token, setToken] = useState("");
  const [amount, setAmount] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modal, setModal] = useState({
    state: "",
    text: "",
    hash: "",
  });
  const { Contracts, Account }: any = useBlockchain();
  const { signer, selectedAccount, api }: any = useWeb3();

  const withdraw = async () => {
    setModalOpen(false);
    const bridgePaused = await api.query.ethBridge.bridgePaused();

    if (!bridgePaused.isTrue) {
      if (token !== "") {
        setModal(defineTxModal("withdrawCENNZside", "", setModalOpen));
        let withdrawAmount = ethers.utils.parseUnits(amount).toString();

        const eventProof = await withdrawCENNZside(
          withdrawAmount,
          Account,
          token
        );
        await withdrawEthSide(withdrawAmount, eventProof, Account, token);
      } else {
        setModal(defineTxModal("error", "noTokenSelected", setModalOpen));
      }
    } else {
      setModal(defineTxModal("bridgePaused", "", setModalOpen));
    }
  };

  const withdrawCENNZside = async (
    amount: any,
    ethAddress: string,
    tokenAddress: string
  ) => {
    let eventProofId: any;
    const tokenExist =
      tokenAddress === "eth"
        ? await api.query.erc20Peg.erc20ToAssetId(
            "0x0000000000000000000000000000000000000000"
          )
        : await api.query.erc20Peg.erc20ToAssetId(tokenAddress);
    const tokenId = tokenExist.isSome
      ? tokenExist.unwrap()
      : await api.query.genericAsset.nextAssetId();

    await new Promise<void>((resolve) => {
      api.tx.erc20Peg
        .withdraw(tokenId, amount, ethAddress)
        .signAndSend(
          selectedAccount.address,
          { signer },
          async ({ status, events }: any) => {
            if (status.isInBlock) {
              for (const {
                event: { method, section, data },
              } of events) {
                if (section === "erc20Peg" && method == "Erc20Withdraw") {
                  eventProofId = data[0];
                  console.log("*******************************************");
                  console.log("Withdraw claim on CENNZnet side successfully");
                  resolve();
                }
              }
            }
          }
        );
    });

    let eventProof: any;
    await new Promise<void>(async (resolve) => {
      const unsubHeads = await api.rpc.chain.subscribeNewHeads(async () => {
        console.log(`Waiting till event proof is fetched....`);
        const versionedEventProof = (
          await api.rpc.ethy.getEventProof(eventProofId)
        ).toJSON();
        if (versionedEventProof !== null) {
          eventProof = versionedEventProof.EventProof;
          console.log("Event proof found;::", eventProof);
          unsubHeads();
          resolve();
        }
      });
    });

    return eventProof;
  };

  const withdrawEthSide = async (
    withdrawAmount: any,
    eventProof: any,
    ethAddress: string,
    tokenAddress: string
  ) => {
    setModalOpen(false);

    let verificationFee = await Contracts.bridge.verificationFee();
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

    let tx: any = await Contracts.peg.withdraw(
      tokenAddress,
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

    setModal(defineTxModal("withdrawETHside", tx.hash, setModalOpen));
    await tx.wait();
    setModal(defineTxModal("finished", "", setModalOpen));
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
            m: "30px 0 50px",
          }}
          onChange={(e) => setAmount(e.target.value)}
        />
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
          disabled={amount && token ? false : true}
          size="large"
          variant="outlined"
          onClick={withdraw}
        >
          Withdraw
        </Button>
      </Box>
    </>
  );
};

export default Withdraw;
