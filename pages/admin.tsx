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

import Safe, {EthersAdapter, EthSignSignature} from '@gnosis.pm/safe-core-sdk'
import {MetaTransactionData, SafeTransactionData} from "@gnosis.pm/safe-core-sdk-types/dist/src/types";
import {SafeTransaction} from "@gnosis.pm/safe-core-sdk-types";
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
    txType: "queue",
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
  const [signerAddress, setSignerAddress] = useState("");
  const [safeSdk, setSafeSdk] = useState<Safe>();
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const { activateAdmin, Signer }: any = useBlockchain();
  const safeAddress = "0x97e5140985E5FFA487C51b2E390a40c34919936E"; //rinkeby safe

  useEffect(() => {
    (async () => {
      const { ethereum }: any = window;
      let ethereumNetwork = window.localStorage.getItem("admin-ethereum-chain");
      if (ethereumNetwork === "Mainnet" || ethereumNetwork === "Rinkeby") {
        const { provider, timelock, bridge, peg }: any = await activateAdmin(
          ethereum,
          ethereumNetwork
        );
          const ethAdapterOwner = new EthersAdapter({
              ethers,
              signer: Signer
          })
          let signerAddress = await Signer.getAddress();
          const safeSdk: Safe = await Safe.create({ ethAdapter: ethAdapterOwner, safeAddress });
        const queuedTransactions = await getAllQueuedTransactions(safeAddress);
        setProvider(provider);
        setContracts({ timelock, bridge, peg });
        setPendingTransactions(queuedTransactions);
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

    if (state.target === "Bridge")
      dataHex = abi.encode(
        ["string", "string", "uint", "string", "string", "uint"],
        [
          `timelock.${state.txType}Transaction()`,
          contracts.bridge.address,
          state.value,
          state.signature,
          encodedParams,
          eta.toNumber(),
        ]
      );
    else if (state.target === "ERC20Peg")
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
    console.log("dataHex", dataHex);
    console.log(
      "decoded dataHex",
      abi.decode(
        ["string", "string", "uint", "string", "string", "uint"],
        dataHex
      )
    );
  await createSafeTransaction(dataHex);
  };

  const bridgeSignature = signatures.Bridge.find((signature) => {
    if (signature === state.signature) {
      return true;
    }
  });

    const createSafeTransaction = async (dataHex:any) => {
        //TODO encode transaction data to hex for data section
        const transaction: MetaTransactionData[] = [{
            //ensure this is always lowercase
            to: '0x551cf0a5719d37e1E6Bc947fD84FE76d204BeB4d', //rinkeby Timelock contract
            value: '0',
            data: dataHex
        }];
        const res = await fetch("https://api-rinkeby.etherscan.io/api?module=gastracker&action=gasoracle&apikey=JNFAU892RF9TJWBU3EV7DJCPIWZY8KEMY1");
        const resJson = await res.json();
        const nextNonce = await getNextQueuedNonce(safeAddress);
        let options: any = {safeTxGas: resJson.result.SafeGasPrice};
        if(nextNonce) options = {nonce: nextNonce, ...options};
        const safeTransaction: SafeTransaction = await safeSdk.createTransaction(transaction, options);
        await safeSdk.signTransaction(safeTransaction);
        //Send proposed transaction to gnosis safe for others to review
        await proposeTransaction(safeSdk, safeTransaction, signerAddress, safeAddress);
        const queuedTransactions = await getAllQueuedTransactions(safeAddress);
        setPendingTransactions(queuedTransactions);
    };

    const signTransaction = async (transactionID: string) => {
        //Get all queued transactions and find the multisig_TX_hash
        const multiSigTransaction = await getMultiSignatureTransaction(transactionID);
        const transactionData = multiSigTransaction.txData.hexData ? multiSigTransaction.txData.hexData : "0x";

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
            refundReceiver: multiSigTransaction.detailedExecutionInfo.refundReceiver.value
        }
        const pendingTransaction = new EthSafeTransaction(safeTransactionData);
        //add all confirmation signatures to the pending transaction
        multiSigTransaction.detailedExecutionInfo.confirmations.map(confirmation => {
            const confirmSig = new EthSignSignature(confirmation.signer.value, confirmation.signature);
            pendingTransaction.addSignature(confirmSig);
        });
        //check if last confirmation if so then execute
        if(multiSigTransaction.detailedExecutionInfo.confirmationsRequired === multiSigTransaction.detailedExecutionInfo.confirmations.length + 1){
            const executeTxResponse = await safeSdk.executeTransaction(pendingTransaction);
            const transRes = await executeTxResponse.transactionResponse.wait();
            console.info(transRes);
        }
        //else sign add to the proposed transaction
        else {
            await safeSdk.signTransaction(pendingTransaction);
            await proposeTransaction(safeSdk, pendingTransaction, signerAddress, safeAddress);
            console.info("transaction Signed")
        }
    }

    const getNextQueuedNonce = async (safeAddress: string) => {
        const res = await fetch(`https://safe-client.gnosis.io/v1/chains/4/safes/${safeAddress}/transactions/queued`);
        const resJson = await res.json();
        if(resJson.results.length === 0){
            return null;
        }
        const queuedTransactions = resJson.results.filter(trans => trans.type === "TRANSACTION");
        const allNonces = queuedTransactions.map(trans => trans.transaction.executionInfo.nonce);
        const maxNonce = Math.max(...allNonces);
        return maxNonce + 1;
    }

    const getAllQueuedTransactions = async (safeAddress: string) => {
        const res = await fetch(`https://safe-client.gnosis.io/v1/chains/4/safes/${safeAddress}/transactions/queued`);
        const resJson = await res.json();
        if(resJson.results.length === 0){
            return null;
        }
        return resJson.results.filter(trans => trans.type === "TRANSACTION");
    }

    const proposeTransaction = async (safeSdk: Safe,safeTransaction: SafeTransaction, signerAddress: string, safeAddress: string) => {
        const safeTxHash = await safeSdk.getTransactionHash(safeTransaction);
        const proposedSafeTx = {
            ...safeTransaction.data,
            baseGas: safeTransaction.data.baseGas.toString(),
            gasPrice: safeTransaction.data.gasPrice.toString(),
            nonce: safeTransaction.data.nonce.toString(),
            origin: null,
            safeTxHash: safeTxHash,
            sender: signerAddress,
            signature: safeTransaction.signatures.get(signerAddress.toString().toLowerCase())['data']
        }
        const proposeRes = await fetch(`https://safe-client.gnosis.io/v1/chains/4/transactions/${safeAddress}/propose`,
            {
                headers: {'Content-Type':'application/json'},
                method: "POST",
                body: JSON.stringify(proposedSafeTx)
            })
        return await proposeRes.json();
    }

    const getMultiSignatureTransaction = async (multisignature: string) => {
        const res = await fetch(`https://safe-client.gnosis.io/v1/chains/4/transactions/${multisignature}`)
        return await res.json();
    }

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
          UNF*CK THE BRIDGE
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
              backgroundColor: state.txType === "queue" ? "#1130FF" : "#FFFFFF",
              color: state.txType === "queue" ? "#FFFFFF" : "#1130FF",
            }}
            onClick={() => updateState({ ...state, txType: "queue" })}
          >
            QueueTx
          </AdminButton>
          <AdminButton
            variant="outlined"
            sx={{
              backgroundColor:
                state.txType === "execute" ? "#1130FF" : "#FFFFFF",
              color: state.txType === "execute" ? "#FFFFFF" : "#1130FF",
            }}
            onClick={() => updateState({ ...state, txType: "execute" })}
          >
            ExecuteTx
          </AdminButton>
          <AdminButton
            variant="outlined"
            sx={{
              backgroundColor:
                state.txType === "cancel" ? "#1130FF" : "#FFFFFF",
              color: state.txType === "cancel" ? "#FFFFFF" : "#1130FF",
            }}
            onClick={() => updateState({ ...state, txType: "cancel" })}
          >
            CancelTx
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
                        backgroundColor: "#1130FF",
                        color: "#FFFFFF",
                    }}
                >
                    Queued
                </AdminButton>
                <AdminButton
                    variant="outlined"
                    sx={{
                        backgroundColor: "#FFFFFF",
                        color:"#1130FF",
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
                {pendingTransactions?.map((trans, idx) => {
                    const nonce = trans.transaction.executionInfo.nonce;
                    const confirmed = trans.transaction.executionInfo.confirmationsSubmitted;
                    const required = trans.transaction.executionInfo.confirmationsRequired;
                    const txHashId: string = trans.transaction.id;
                    return(
                        <>
                        <div
                            key={idx}
                            style={{
                            // @ts-ignore
                            "font-family": "Teko",
                            "font-style": "bold",
                            "font-weight": 400}}>
                            {`Pending Transaction ${nonce}`}
                            <Button onClick={() => signTransaction(txHashId)}>Sign</Button>
                            <Button>
                                {confirmed}/{required} Confirmed
                            </Button>
                        </div>
                    </>
                )
                })}
            </Box>
        </Box>
    </>
  );
};

export default Admin;
