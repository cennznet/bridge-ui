import React, { VFC, useEffect, useState } from "react";
import { ethers } from "ethers";
import { Box, Button, CircularProgress, TextField } from "@mui/material";
import TxModal from "./TxModal";
import TokenPicker from "./TokenPicker";
import { defineTxModal } from "@/utils/modal";
import { useBlockchain } from "@/context/BlockchainContext";
import { useWeb3 } from "@/context/Web3Context";
import { Heading, SmallText } from "@/components/StyledComponents";

const Withdraw: VFC = () => {
  const [token, setToken] = useState("");
  const [tokenBalance, setTokenBalance] = useState<Number>();
  const [amount, setAmount] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modal, setModal] = useState({
    state: "",
    text: "",
    hash: "",
  });
  const [estimatedFee, setEstimatedFee] = useState(0);
  const [historical, setHistorical] =
    useState<boolean>(false);
  const [historicalEventProofId, setHistoricalEventProofId] =
    useState<number>();
  const [blockHash, setBlockHash] = useState<string>();
  const {Contracts, Account, Signer}: any = useBlockchain();
  const {signer, selectedAccount, api, balances}: any = useWeb3();

  //Estimate fee
  useEffect(() => {
    if (selectedAccount)
      (async () => {
        let gasPrice = (await Signer.getGasPrice()).toString();
        gasPrice = ethers.utils.formatUnits(gasPrice);

        const gasEstimate = Number(gasPrice) * 150000;

        let verificationFee = await Contracts.bridge.verificationFee();
        verificationFee = ethers.utils.formatUnits(verificationFee);

        const totalFeeEstimate = gasEstimate + Number(verificationFee);

        setEstimatedFee(Number(totalFeeEstimate.toFixed(6)));
      })();
  }, [selectedAccount]);

  //Check CENNZnet account has enough tokens to withdraw
  useEffect(() => {
    if (token !== "" && balances)
      (async () => {
        const tokenExist = await api.query.erc20Peg.erc20ToAssetId(token);
        const tokenId = tokenExist.isSome
          ? tokenExist.unwrap()
          : await api.query.genericAsset.nextAssetId();

        Object.values(balances).map((token: any) => {
          if (token.tokenId === tokenId.toString()) {
            setTokenBalance(token.balance);
          }
        });
      })();
  }, [token, balances]);

  const resetModal = () => {
    setModal({state: "", text: "", hash: ""});
    setModalOpen(false);
  };

  const withdraw = async () => {
    setModalOpen(false);
    const bridgePaused = await api.query.ethBridge.bridgePaused();
    const CENNZwithdrawalsActive = await api.query.erc20Peg.withdrawalsActive();
    const ETHwithdrawalsActive = await Contracts.peg.withdrawalsActive();

    if (
      bridgePaused.isFalse &&
      CENNZwithdrawalsActive.isTrue &&
      ETHwithdrawalsActive
    ) {
      if (token !== "") {
        setModal(defineTxModal("withdrawCENNZside", "", setModalOpen));
        let withdrawAmount = ethers.utils.parseUnits(amount).toString();

        let eventProof;
        if (!!historicalEventProofId && !!blockHash) {
          eventProof = await api.derive.ethBridge.eventProof(
            historicalEventProofId
          );

          return await withdrawEthSide(
            withdrawAmount,
            eventProof,
            Account,
            token,
            blockHash
          );
        }

        eventProof = await withdrawCENNZside(
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
    const tokenExist = await api.query.erc20Peg.erc20ToAssetId(tokenAddress);
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
    await new Promise(async (resolve) => {
      const unsubHeads = await api.rpc.chain.subscribeNewHeads(async () => {
        console.log(`Waiting till event proof is fetched....`);
        eventProof = await api.derive.ethBridge.eventProof(eventProofId);
        if (!!eventProof) {
          console.log("Event proof found;::", eventProof);
          unsubHeads();
          resolve(eventProof);
        }
      });
    });

    return eventProof;
  };

  const withdrawEthSide = async (
    withdrawAmount: any,
    eventProof: any,
    ethAddress: string,
    tokenAddress: string,
    blockHash?: string
  ) => {
    setModalOpen(false);

    let verificationFee = await Contracts.bridge.verificationFee();
    let notaryKeys;
    if (!!blockHash) {
      notaryKeys = await api.query.ethBridge.notaryKeys.at(blockHash);
    } else {
      notaryKeys = await api.query.ethBridge.notaryKeys();
    }

    const validators = notaryKeys.map((validator: ethers.utils.BytesLike) => {
      // session key is not set
      if (
        ethers.utils.hexlify(validator) ===
        ethers.utils.hexlify(
          "0x000000000000000000000000000000000000000000000000000000000000000000"
        )
      ) {
        return ethers.constants.AddressZero;
      }
      return ethers.utils.computeAddress(validator);
    });

    let gasEstimate = await Contracts.peg.estimateGas.withdraw(
      tokenAddress,
      withdrawAmount,
      ethAddress,
      {
        eventId: eventProof.eventId,
        validatorSetId: eventProof.validatorSetId,
        v: eventProof.v,
        r: eventProof.r,
        s: eventProof.s,
        validators,
      },
      {
        value: verificationFee,
      }
    );

    let gasLimit = (gasEstimate.toNumber() * 1.02).toFixed(0);

    let tx: any = await Contracts.peg.withdraw(
      tokenAddress,
      withdrawAmount,
      ethAddress,
      {
        eventId: eventProof.eventId,
        validatorSetId: eventProof.validatorSetId,
        v: eventProof.v,
        r: eventProof.r,
        s: eventProof.s,
        validators,
      },
      {
        value: verificationFee,
        gasLimit: gasLimit,
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
          resetModal={resetModal}
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
        <TokenPicker setToken={setToken}/>
        <TextField
          label="Amount"
          variant="outlined"
          required
          sx={{
            width: "80%",
            m: "30px 0 0",
          }}
          onChange={(e) => setAmount(e.target.value)}
          helperText={
            !historical && (tokenBalance < Number(amount) ? "Account balance too low" : "")
          }
        />
        {historical && (
          <>
            <TextField
              label="Historical Event Proof Id"
              variant="outlined"
              type="number"
              required
              sx={{
                width: "80%",
                m: "30px 0 0",
              }}
              onChange={(e) => setHistoricalEventProofId(Number(e.target.value))}
            />
            <TextField
              label="Block Hash"
              variant="outlined"
              type="text"
              required
              sx={{
                width: "80%",
                m: "30px 0 0",
              }}
              onChange={(e) => setBlockHash(e.target.value)}
            />
          </>
        )}
        <Button
          size="small"
          variant="outlined"
          onClick={() => setHistorical(!historical)}
          sx={{
            fontFamily: "Teko",
            fontWeight: "bold",
            fontSize: "21px",
            lineHeight: "124%",
            color: "#1130FF",
            width: "80%",
            mb: "30px",
            textTransform: "uppercase",
          }}
        >
          {historical ? "make new withdraw*" : "claim historical withdraw*"}
        </Button>
        <Box sx={{textAlign: "center"}}>
          <Heading sx={{textTransform: "uppercase", fontSize: "18px"}}>
            estimated withdrawal fee:
          </Heading>
          {estimatedFee ? (
            <SmallText>{estimatedFee} ETH</SmallText>
          ) : (
            <CircularProgress size="1.5rem" sx={{color: "black"}}/>
          )}
        </Box>
        <Button
          sx={{
            fontFamily: "Teko",
            fontWeight: "bold",
            fontSize: "21px",
            lineHeight: "124%",
            color: "#1130FF",
            m: "30px auto 50px",
          }}
          disabled={
            historical ? !(!!historicalEventProofId && !!blockHash): !(token && amount && Number(amount) <= tokenBalance)
          }
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
