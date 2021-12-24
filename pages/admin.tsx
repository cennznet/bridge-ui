import React, { useEffect, useState } from "react";
import { ethers, BigNumber } from "ethers";
import {
  Button,
  Box,
  ButtonGroup,
  TextField,
  Autocomplete,
} from "@mui/material";
import { AdminButton, Heading } from "../components/StyledComponents";
import { useBlockchain } from "../context/BlockchainContext";
import AdminModal from "../components/AdminModal";
import { useWeb3 } from "../context/Web3Context";

import Safe, {
  EthersAdapter,
  EthSignSignature,
} from "@gnosis.pm/safe-core-sdk";
import {
  MetaTransactionData,
  SafeTransactionData,
} from "@gnosis.pm/safe-core-sdk-types/dist/src/types";
import { SafeTransaction } from "@gnosis.pm/safe-core-sdk-types";
import EthSafeTransaction from "@gnosis.pm/safe-core-sdk/dist/src/utils/transactions/SafeTransaction";

const abi = new ethers.utils.AbiCoder();
const targets: string[] = ["Bridge", "ERC20Peg"];
const signatures = {
  Bridge: [
    "forceActiveValidatorSet(address[],uint32)",
    "forceHistoricValidatorSet(address[],uint32)",
    "setProofTTL(uint256)",
    "setMaxRewardPayout(uint256)",
    "setVerificationFee(uint256)",
    "setThreshold(uint256)",
    "setActive(bool)",
  ],
  ERC20Peg: [
    "activateCENNZDeposits()",
    "activateDeposits()",
    "pauseDeposits()",
    "activateWithdrawals()",
    "pauseWithdrawals()",
  ],
  Timelock: [
    "queueTransaction(address, uint, string, bytes, uint)",
    "executeTransaction(address, uint, string, bytes, uint)",
    "cancelTransaction(address, uint, string, bytes, uint)",
  ],
};

const dataParams = {
  bridge: {
    [signatures.Bridge[0]]: ["Validator Public Keys", "Validator Set Id"],
    [signatures.Bridge[1]]: ["Validator Public Keys", "Validator Set Id"],
    [signatures.Bridge[2]]: "newTTL",
    [signatures.Bridge[3]]: "newMaxRewardPayout",
    [signatures.Bridge[4]]: "newFee",
    [signatures.Bridge[5]]: "newThresholdPercent",
    [signatures.Bridge[6]]: "active",
  },
};

const Admin: React.FC<{}> = () => {
  const { decodeAddress }: any = useWeb3();
  const [provider, setProvider] = useState<any>();
  const [contracts, setContracts] = useState({
    bridge: {} as ethers.Contract,
    peg: {} as ethers.Contract,
    timelock: {} as ethers.Contract,
  });
  const [state, updateState] = useState({
    txType: signatures.Timelock[0],
    target: "",
    value: "",
    signature: "",
    validatorPublicKeys: "",
    validatorSetId: "",
    uint256: "",
    bool: "",
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalState, setModalState] = useState("");
  const [ethNetwork, setEthNetwork] = useState("");
  const [signerAddress, setSignerAddress] = useState("");
  const [safeSdk, setSafeSdk] = useState<Safe>();
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [pendingTransactionsTimelock, setPendingTransactionsTimelock] =
    useState([]);
  const [historicalTransactions, setHistoricalTransactions] = useState([]);
  const [txDataView, setTxDataView] = useState("safe");
  const { activateAdmin, Signer }: any = useBlockchain();
  const safeAddress = "0x97e5140985E5FFA487C51b2E390a40c34919936E"; //rinkeby safe
  useEffect(() => {
    (async () => {
      const { ethereum }: any = window;
      let ethereumNetwork = window.localStorage.getItem("admin-ethereum-chain");
      if (ethereumNetwork === "Mainnet" || ethereumNetwork === "Rinkeby") {
        setEthNetwork(ethereumNetwork);
        const { provider, timelock, bridge, peg }: any = await activateAdmin(
          ethereum,
          ethereumNetwork
        );
        const ethAdapterOwner = new EthersAdapter({
          ethers,
          signer: Signer,
        });
        let signerAddress = await Signer.getAddress();
        const safeSdk: Safe = await Safe.create({
          ethAdapter: ethAdapterOwner,
          safeAddress,
        });
        const queuedTransactions = await getAllQueuedTransactions(safeAddress);
        if (queuedTransactions) {
          let formattedTransactions = await formatTransactions(
            queuedTransactions
          );

          setPendingTransactions(formattedTransactions);
        }

        setProvider(provider);
        setContracts({ timelock, bridge, peg });
        setSignerAddress(signerAddress);
        setSafeSdk(safeSdk);
      } else {
        setModalState("wrongNetwork");
        setModalOpen(true);
      }
    })();
    //eslint-disable-next-line
  }, []);

  const updateTarget = (target) => {
    updateState({
      txType: state.txType,
      target,
      value: "",
      signature: "",
      validatorPublicKeys: "",
      validatorSetId: "",
      uint256: "",
      bool: "",
    });
  };

  const submit = async () => {
    let encodedParams;

    switch (state.signature) {
      case signatures.Bridge[0]:
      case signatures.Bridge[1]:
        let addressArr = state.validatorPublicKeys
          .split("\n")
          .map((address) =>
            ethers.utils.computeAddress(decodeAddress(address))
          );
        encodedParams = abi.encode(
          ["address[]", "uint32"],
          [addressArr, state.validatorSetId]
        );
        break;
      case signatures.Bridge[2]:
      case signatures.Bridge[3]:
      case signatures.Bridge[4]:
      case signatures.Bridge[5]:
        encodedParams = abi.encode(["uint256"], [state.uint256]);
        break;
      case signatures.Bridge[6]:
        encodedParams = abi.encode(["bool"], [state.bool]);
        break;
      default:
        break;
    }

    let blockNumAfter = await provider.getBlockNumber();
    let blockAfter = await provider.getBlock(blockNumAfter);
    let timestampAfter = blockAfter.timestamp;
    let delay = await contracts.timelock.delay();
    let eta = BigNumber.from(timestampAfter)
      .add(delay)
      .add(BigNumber.from(100));
    let dataHex;
    let timeLockABI;
    let timelockInterface;
    if (state.target === "Bridge") {
      switch (state.txType) {
        case signatures.Timelock[0]:
          timeLockABI = [`function ${signatures.Timelock[0]}`];
          timelockInterface = new ethers.utils.Interface(timeLockABI);
          dataHex = timelockInterface.encodeFunctionData(state.txType, [
            contracts.bridge.address,
            state.value,
            state.signature,
            encodedParams,
            eta,
          ]);
          break;
        case signatures.Timelock[1]:
          timeLockABI = [`function ${signatures.Timelock[1]}`];
          timelockInterface = new ethers.utils.Interface(timeLockABI);
          dataHex = timelockInterface.encodeFunctionData(state.txType, [
            contracts.bridge.address,
            state.value,
            state.signature,
            encodedParams,
            eta,
          ]);
          break;
        default:
          break;
      }
    } else if (state.target === "ERC20Peg")
      dataHex = abi.encode(
        ["string", "string", "uint", "string", "string", "uint"],
        [
          `timelock.${state.txType}Transaction()`,
          contracts.peg.address,
          BigNumber.from(0),
          state.signature,
          "",
          eta.toNumber(),
        ]
      );
    console.info(dataHex);
    await createSafeTransaction(dataHex);
  };

  const bridgeSignature = signatures.Bridge.find((signature) => {
    if (signature === state.signature) {
      return true;
    }
  });

  const createExecuteTransaction = async (transaction: any) => {
    const timeLockABI = [`function ${signatures.Timelock[1]}`];
    const timelockInterface = new ethers.utils.Interface(timeLockABI);
    const dataHex = timelockInterface.encodeFunctionData(signatures.Timelock[1], [
      contracts.bridge.address,
      0,
      transaction.signature,
      transaction.data,
      transaction.eta,
    ]);
    await createSafeTransaction(dataHex);
  }

  const createCancelTransaction = async (transaction: any) => {
    const timeLockABI = [`function ${signatures.Timelock[2]}`];
    const timelockInterface = new ethers.utils.Interface(timeLockABI);
    const dataHex = timelockInterface.encodeFunctionData(signatures.Timelock[2], [
      contracts.bridge.address,
      0,
      transaction.signature,
      transaction.data,
      transaction.eta,
    ]);
    await createSafeTransaction(dataHex);
  }

  const createSafeTransaction = async (dataHex: any) => {
    const transaction: MetaTransactionData[] = [
      {
        to: contracts.timelock.address,
        value: "0",
        data: dataHex,
      },
    ];
    const res = await fetch(
      "https://api-rinkeby.etherscan.io/api?module=gastracker&action=gasoracle&apikey=JNFAU892RF9TJWBU3EV7DJCPIWZY8KEMY1"
    );
    const resJson = await res.json();
    const nextNonce = await getNextQueuedNonce(safeAddress);
    let options: any = { safeTxGas: resJson.result.SafeGasPrice };
    if (nextNonce) options = { nonce: nextNonce, ...options };
    const safeTransaction: SafeTransaction = await safeSdk.createTransaction(
      transaction,
      options
    );
    await safeSdk.signTransaction(safeTransaction);
    //Send proposed transaction to gnosis safe for others to review
    await proposeTransaction(
      safeSdk,
      safeTransaction,
      signerAddress,
      safeAddress
    );

    const queuedTransactions = await getAllQueuedTransactions(safeAddress);
    let formattedTransactions = await formatTransactions(queuedTransactions);
    setPendingTransactions(formattedTransactions);
  };

  const formatTransactions = async (transactions: any[]) => {
    let formattedTransactions = [];

    for (const tx of transactions) {
      let value: string;
      let txSignature: string;
      let { txData } = await getMultiSignatureTransaction(tx.transaction.id);
      if (!txData.dataDecoded) continue;
      let signature = txData.dataDecoded.parameters[2].value;
      switch (signature) {
        default:
        case signatures.Bridge[0]:
        case signatures.Bridge[1]:
          txSignature = signature;
          break;
        case signatures.Bridge[2]:
        case signatures.Bridge[3]:
        case signatures.Bridge[4]:
        case signatures.Bridge[5]:
          value = abi
            .decode(["uint256"], txData.dataDecoded.parameters[3].value)
            .toString();
          txSignature = `${signature.split("(")[0]}(${value})`;
          break;
        case signatures.Bridge[6]:
          value = abi
            .decode(["bool"], txData.dataDecoded.parameters[3].value)
            .toString();
          txSignature = `${signature.split("(")[0]}(${value})`;
          break;
      }

      formattedTransactions.push({
        ...tx,
        txSignature,
      });
    }
    return formattedTransactions;
  };

  const signTransaction = async (transactionID: string) => {
    //Get all queued transactions and find the multisig_TX_hash
    const multiSigTransaction = await getMultiSignatureTransaction(
      transactionID
    );
    const transactionData = multiSigTransaction.txData.hexData
      ? multiSigTransaction.txData.hexData
      : "0x";

    const safeTransactionData: SafeTransactionData = {
      //ensure this is always lowercase
      to: multiSigTransaction.txData.to.value,
      value: multiSigTransaction.txData.value,
      data: transactionData,
      operation: multiSigTransaction.txData.operation,
      nonce: multiSigTransaction.detailedExecutionInfo.nonce.toString(),
      safeTxGas: multiSigTransaction.detailedExecutionInfo.safeTxGas,
      baseGas: multiSigTransaction.detailedExecutionInfo.baseGas,
      gasPrice: multiSigTransaction.detailedExecutionInfo.gasPrice,
      gasToken: multiSigTransaction.detailedExecutionInfo.gasToken,
      refundReceiver:
        multiSigTransaction.detailedExecutionInfo.refundReceiver.value,
    };
    const pendingTransaction = new EthSafeTransaction(safeTransactionData);
    //add all confirmation signatures to the pending transaction
    multiSigTransaction.detailedExecutionInfo.confirmations.map(
      (confirmation) => {
        const confirmSig = new EthSignSignature(
          confirmation.signer.value,
          confirmation.signature
        );
        pendingTransaction.addSignature(confirmSig);
      }
    );
    //check if last confirmation if so then execute
    if (
      multiSigTransaction.detailedExecutionInfo.confirmationsRequired ===
      multiSigTransaction.detailedExecutionInfo.confirmations.length + 1
    ) {
      const executeTxResponse = await safeSdk.executeTransaction(
        pendingTransaction
      );
      const transRes = await executeTxResponse.transactionResponse.wait();
      console.info(transRes);
    }
    //else sign add to the proposed transaction
    else {
      await safeSdk.signTransaction(pendingTransaction);
      await proposeTransaction(
        safeSdk,
        pendingTransaction,
        signerAddress,
        safeAddress
      );
    }
  };

  const getNextQueuedNonce = async (safeAddress: string) => {
    const res = await fetch(
      `https://safe-client.gnosis.io/v1/chains/4/safes/${safeAddress}/transactions/queued`
    );
    const resJson = await res.json();
    if (resJson.results.length === 0) {
      return null;
    }
    const queuedTransactions = resJson.results.filter(
      (trans) => trans.type === "TRANSACTION"
    );
    const allNonces = queuedTransactions.map(
      (trans) => trans.transaction.executionInfo.nonce
    );
    const maxNonce = Math.max(...allNonces);
    return maxNonce + 1;
  };

  const getAllQueuedTransactions = async (safeAddress: string) => {
    const res = await fetch(
      `https://safe-client.gnosis.io/v1/chains/4/safes/${safeAddress}/transactions/queued`
    );
    const resJson = await res.json();
    if (resJson.results.length === 0) {
      return null;
    }
    return resJson.results.filter((trans) => trans.type === "TRANSACTION");
  };

  const getHistoricalTransactions = async (safeAddress: string) => {
    const res = await fetch(
      `https://safe-client.gnosis.io/v1/chains/4/safes/${safeAddress}/transactions/history`
    );
    const resJson = await res.json();
    if (resJson.results.length === 0) {
      return null;
    }
    return resJson.results.filter((trans) => trans.type === "TRANSACTION");
  };

  const proposeTransaction = async (
    safeSdk: Safe,
    safeTransaction: SafeTransaction,
    signerAddress: string,
    safeAddress: string
  ) => {
    const safeTxHash = await safeSdk.getTransactionHash(safeTransaction);
    const proposedSafeTx = {
      ...safeTransaction.data,
      baseGas: safeTransaction.data.baseGas.toString(),
      gasPrice: safeTransaction.data.gasPrice.toString(),
      nonce: safeTransaction.data.nonce.toString(),
      origin: null,
      safeTxHash: safeTxHash,
      sender: signerAddress,
      signature: safeTransaction.signatures.get(
        signerAddress.toString().toLowerCase()
      )["data"],
    };
    const proposeRes = await fetch(
      `https://safe-client.gnosis.io/v1/chains/4/transactions/${safeAddress}/propose`,
      {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify(proposedSafeTx),
      }
    );
    return await proposeRes.json();
  };

  const getMultiSignatureTransaction = async (multisignature: string) => {
    const res = await fetch(
      `https://safe-client.gnosis.io/v1/chains/4/transactions/${multisignature}`
    );
    return await res.json();
  };

  const getPendingTransactionsTimelock = async () => {
    //TODO get events only certain date in past
    if(Object.keys(contracts.timelock).length > 0){
      const events = await contracts.timelock.queryFilter({});
      // get all un-executed queued transactions
      const unExecutedQueuedTransactionProms = events.map(async (event) => {
        if (event.eventSignature.includes("QueueTransaction")) {
          const isQueued = await contracts.timelock.queuedTransactions(
              event.args.txHash
          );
          if (isQueued) {
            let decodeData = abi.decode(
                event.args.signature.split("(")[1].replace(")", "").split(","),
                event.args.data
            );
            decodeData = decodeData.map((data) => {
              if (BigNumber.isBigNumber(data)) return data.toNumber();
              else return data;
            });
            return {
              blockNumber: event.blockNumber,
              signature: event.args.signature,
              data: event.args.data,
              decodeData: decodeData,
              eta: event.args.eta.toNumber(),
            };
          }
        }
      });
      let unExecutedQueuedTransaction = await Promise.all(
          unExecutedQueuedTransactionProms
      );
      unExecutedQueuedTransaction = unExecutedQueuedTransaction.filter(
          (trans) => trans
      );
      return unExecutedQueuedTransaction;
    }
  };

  const formatPendingTransactionsTimelock = async () => {
    let pendingTransactions = await getPendingTransactionsTimelock();
    let formattedTransactions = [];

    for (const tx of pendingTransactions) {
      let txSignature: string,
        value: string,
        distance: number,
        days: number,
        hours: number,
        minutes: number,
        seconds: number,
        countdownString: string;

      switch (tx.signature) {
        default:
        case signatures.Bridge[0]:
        case signatures.Bridge[1]:
          txSignature = tx.signature;
          break;
        case signatures.Bridge[2]:
        case signatures.Bridge[3]:
        case signatures.Bridge[4]:
        case signatures.Bridge[5]:
        case signatures.Bridge[6]:
          value = tx.decodeData[0];
          txSignature = `${tx.signature.split("(")[0]}(${value})`;
          break;
      }

      distance = new Date(tx.eta * 1000).getTime() - new Date().getTime();
      days = Math.floor(distance / (1000 * 60 * 60 * 24));
      hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      seconds = Math.floor((distance % (1000 * 60)) / 1000);
      if (distance > 0)
        countdownString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

      formattedTransactions.push({
        ...tx,
        countdown: countdownString,
        txSignature: txSignature,
      });
    }
    setPendingTransactionsTimelock(formattedTransactions);
  };

  const viewHistoricalTransactions = async () => {
    const transactions = await getHistoricalTransactions(safeAddress);
    const formattedTransactions = await formatTransactions(transactions);
    setHistoricalTransactions(formattedTransactions);
  };

  return (
    <>
      {modalOpen && (
        <AdminModal
          setModalOpen={setModalOpen}
          modalState={modalState}
          updateState={updateState}
        />
      )}
      <Box
        sx={{
          m: "6% auto 0",
          width: "40%",
          textAlign: "center",
        }}
      >
        <Heading sx={{ margin: "0 auto", fontSize: "30px" }}>
          ADMIN CONSOLE
        </Heading>
        <ButtonGroup
          sx={{
            display: "flex",
            m: "auto",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            border: "4px solid #1130FF",
            borderBottom: 0,
          }}
        >
          <AdminButton
            variant="outlined"
            sx={{
              backgroundColor:
                state.txType === signatures.Timelock[0] ? "#1130FF" : "#FFFFFF",
              color:
                state.txType === signatures.Timelock[0] ? "#FFFFFF" : "#1130FF",
            }}
            onClick={() =>
              updateState({ ...state, txType: signatures.Timelock[0] })
            }
          >
            QueueTx
          </AdminButton>
        </ButtonGroup>
        <Box
          component="form"
          sx={{
            height: "auto",
            m: "0 auto",
            background: "#FFFFFF",
            border: "4px solid #1130FF",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "0px",
          }}
        >
          <Autocomplete
            disablePortal
            options={targets}
            onSelect={(e: any) => updateTarget(e.target.value)}
            sx={{
              m: "20px 0 20px",
              width: "80%",
            }}
            renderInput={(params) => (
              <TextField {...params} label="Target" required />
            )}
          />
          {state.target !== "" && (
            <Autocomplete
              disablePortal
              options={signatures[state.target]}
              onSelect={(e: any) =>
                updateState({ ...state, signature: e.target.value })
              }
              sx={{
                mb: "20px",
                width: "80%",
              }}
              renderInput={(params) => (
                <TextField {...params} label="Signature" required />
              )}
            />
          )}
          {state.target === "Bridge" && bridgeSignature && (
            <>
              {dataParams.bridge[state.signature].length === 2 && (
                <>
                  <TextField
                    label={dataParams.bridge[state.signature][0]}
                    variant="outlined"
                    required
                    multiline
                    sx={{
                      width: "80%",
                      mb: "20px",
                    }}
                    onChange={(e) =>
                      updateState({
                        ...state,
                        validatorPublicKeys: e.target.value,
                      })
                    }
                    helperText="Enter each key on new line"
                  />
                  <TextField
                    label={dataParams.bridge[state.signature][1]}
                    variant="outlined"
                    required
                    sx={{
                      width: "80%",
                      mb: "20px",
                    }}
                    onChange={(e) =>
                      updateState({
                        ...state,
                        validatorSetId: e.target.value,
                      })
                    }
                  />
                </>
              )}
              {typeof dataParams.bridge[state.signature] === "string" &&
                (dataParams.bridge[state.signature] === "active" ? (
                  <Autocomplete
                    disablePortal
                    options={["true", "false"]}
                    onSelect={(e: any) =>
                      updateState({ ...state, bool: e.target.value })
                    }
                    sx={{
                      mb: "20px",
                      width: "80%",
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={dataParams.bridge[state.signature]}
                        required
                      />
                    )}
                  />
                ) : (
                  <TextField
                    label={dataParams.bridge[state.signature]}
                    variant="outlined"
                    required
                    sx={{
                      width: "80%",
                      mb: "20px",
                    }}
                    onChange={(e) =>
                      updateState({ ...state, uint256: e.target.value })
                    }
                  />
                ))}
              <TextField
                label="Value"
                variant="outlined"
                required
                sx={{
                  width: "80%",
                  mb: "20px",
                }}
                onChange={(e) =>
                  updateState({ ...state, value: e.target.value })
                }
              />
            </>
          )}
          <Button
            sx={{
              fontFamily: "Teko",
              fontWeight: "bold",
              fontSize: "21px",
              lineHeight: "124%",
              color: "#1130FF",
              mt: "20px",
              mb: "50px",
            }}
            disabled={state.target && state.signature ? false : true}
            size="large"
            variant="outlined"
            onClick={submit}
          >
            Submit
          </Button>
        </Box>
      </Box>
      <Box
        sx={{
          m: "6% auto 0",
          width: "40%",
          textAlign: "center",
        }}
      >
        <ButtonGroup
          sx={{
            display: "flex",
            m: "auto",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            border: "4px solid #1130FF",
            borderBottom: 0,
          }}
        >
          <AdminButton
            variant="outlined"
            sx={{
              backgroundColor: txDataView === "safe" ? "#1130FF" : "#FFFFFF",
              color: txDataView === "safe" ? "#FFFFFF" : "#1130FF",
            }}
            onClick={() => setTxDataView("safe")}
          >
            Queued - Safe
          </AdminButton>
          <AdminButton
            variant="outlined"
            sx={{
              backgroundColor:
                txDataView === "timelock" ? "#1130FF" : "#FFFFFF",
              color: txDataView === "timelock" ? "#FFFFFF" : "#1130FF",
            }}
            onClick={() => {
              setTxDataView("timelock");
              formatPendingTransactionsTimelock();
            }}
          >
            Queued - Timelock
          </AdminButton>
          <AdminButton
            variant="outlined"
            sx={{
              backgroundColor: txDataView === "history" ? "#1130FF" : "#FFFFFF",
              color: txDataView === "history" ? "#FFFFFF" : "#1130FF",
            }}
            onClick={() => {
              setTxDataView("history");
              viewHistoricalTransactions();
            }}
          >
            History
          </AdminButton>
        </ButtonGroup>
        <Box
          component="form"
          sx={{
            height: "auto",
            m: "0 auto",
            background: "#FFFFFF",
            border: "4px solid #1130FF",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "0px",
          }}
        >
          {txDataView === "safe" && (
            <>
              {pendingTransactions?.map((trans, idx) => {
                const nonce = trans.transaction.executionInfo.nonce;
                const confirmed =
                  trans.transaction.executionInfo.confirmationsSubmitted;
                const required =
                  trans.transaction.executionInfo.confirmationsRequired;
                const txHashId: string = trans.transaction.id;
                const methodName: string = trans.transaction.txInfo.methodName;
                const missingSigners = trans.transaction.executionInfo.missingSigners;
                const foundCurrentSigner = missingSigners.filter(signer => signer.value === signerAddress);
                const alreadySigned = foundCurrentSigner.length === 0;
                return (
                  <div
                    key={idx}
                    style={{
                      // @ts-ignore
                      "font-family": "Teko",
                      "font-style": "bold",
                      "font-weight": 400,
                    }}
                  >
                    {`${methodName} ${nonce}: ${trans.txSignature}`}
                    {alreadySigned ?
                        <Button>Signed</Button>
                        :
                        <>
                          <Button onClick={() => signTransaction(txHashId)}>
                            Sign
                          </Button>
                          <Button>
                             {confirmed}/{required} Confirmed
                          </Button>
                        </>
                    }
                  </div>
                );
              })}
              <Button>
                <a
                  href={
                    ethNetwork === "Mainnet"
                      ? "todo: mainnet link"
                      : "https://gnosis-safe.io/app/rin:0x97e5140985E5FFA487C51b2E390a40c34919936E/transactions/queue"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    textDecoration: "none",
                    color: "black",
                    fontFamily: "teko",
                    fontSize: "20px",
                    letterSpacing: "0.5px",
                    textTransform: "none",
                  }}
                >
                  View on Gnosis Safe
                </a>
              </Button>
            </>
          )}
          {txDataView === "timelock" && (
            <>

              {pendingTransactionsTimelock?.map((trans, idx) => {
                return (
                  <div
                    key={idx}
                    style={{
                      fontFamily: "Roboto",
                    }}
                  >
                    <span>{trans.txSignature}</span>
                    {trans.countdown ? (
                      <span>: Executable in: {trans.countdown}</span>
                    ) : (
                      <>
                        <Button onClick={() => createExecuteTransaction(trans)}>
                        Execute
                        </Button>
                        <Button onClick={() => createCancelTransaction(trans)}>
                        Cancel
                        </Button>
                      </>
                    )}
                  </div>
                );
              })}
              <Button>
                <a
                    href={
                      ethNetwork === "Mainnet"
                          ? "todo: mainnet link"
                          : `https://rinkeby.etherscan.io/address/${contracts.timelock.address}#events`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      textDecoration: "none",
                      color: "black",
                      fontFamily: "teko",
                      fontSize: "20px",
                      letterSpacing: "0.5px",
                      textTransform: "none",
                    }}
                >
                  View on Etherscan
                </a>
              </Button>
            </>
          )}
          {txDataView === "history" && (
            <>
              {historicalTransactions?.map((trans, idx) => {
                return (
                  <div
                    key={idx}
                    style={{
                      fontFamily: "roboto",
                    }}
                  >
                    {trans.txSignature && (
                      <span>Signature: {trans.txSignature}, </span>
                    )}
                    <span>
                      Date:{" "}
                      {new Date(trans.transaction.timestamp).toDateString()}{" "}
                      NZDT
                    </span>
                    <span>, Status: {trans.transaction.txStatus}</span>
                  </div>
                );
              })}
              <Button>
                <a
                  href={
                    ethNetwork === "Mainnet"
                      ? "todo: mainnet link"
                      : "https://gnosis-safe.io/app/rin:0x97e5140985E5FFA487C51b2E390a40c34919936E/transactions/history"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    textDecoration: "none",
                    color: "black",
                    fontFamily: "teko",
                    fontSize: "20px",
                    letterSpacing: "0.5px",
                    textTransform: "none",
                  }}
                >
                  View on Gnosis Safe
                </a>
              </Button>
            </>
          )}
        </Box>
      </Box>
    </>
  );
};

export default Admin

