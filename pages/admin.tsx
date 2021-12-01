import React, { useEffect, useState } from "react";
import { ethers, BigNumber } from "ethers";
import {
  Button,
  Box,
  ButtonGroup,
  TextField,
  Autocomplete,
  Icon,
} from "@mui/material";
import { AdminButton, Heading } from "../components/StyledComponents";
import { useBlockchain } from "../context/BlockchainContext";
import AdminModal from "../components/AdminModal";
import { useWeb3 } from "../context/Web3Context";

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
  const { activateAdmin }: any = useBlockchain();

  useEffect(() => {
    (async () => {
      const { ethereum }: any = window;
      let ethereumNetwork = window.localStorage.getItem("admin-ethereum-chain");
      if (ethereumNetwork === "Mainnet" || ethereumNetwork === "Rinkeby") {
        const { provider, timelock, bridge, peg }: any = await activateAdmin(
          ethereum,
          ethereumNetwork
        );
        setProvider(provider);
        setContracts({ timelock, bridge, peg });
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

    setModalState(dataHex);
    setModalOpen(true);
    console.log("dataHex", dataHex);
    console.log(
      "decoded dataHex",
      abi.decode(
        ["string", "string", "uint", "string", "string", "uint"],
        dataHex
      )
    );
  };

  const bridgeSignature = signatures.Bridge.find((signature) => {
    if (signature === state.signature) {
      return true;
    }
  });

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
    </>
  );
};

export default Admin;
