import { ethers } from "ethers";
import { Api } from "@cennznet/api";
import { Keyring } from "@polkadot/keyring";
import { initEthers } from "./ethers";

let contracts: any = {};

initEthers().then((res) => {
  const { bridge, peg, token }: any = res;
  contracts = {
    bridge,
    peg,
    token,
  };
});

async function setupApi() {
  const api = await Api.create({
    network: "rata",
  });
  const keyring = new Keyring({ type: "sr25519" });
  const account = keyring.addFromUri(
    "document like evil comic island toilet enhance toddler bar bulk they bus"
  );

  return { api, account };
}

async function depositCENNZside(
  depositTxHash: string,
  CENNZnetAddress: string,
  depositAmount: any
) {
  const { api, account } = await setupApi();

  /********** new Token Id that would be minted on deposition at CENNZnet **********/
  const tokenExist: any = await api.query.erc20Peg.erc20ToAssetId(
    contracts.token.address
  );
  const testTokenId = tokenExist.isSome
    ? tokenExist.unwrap()
    : await api.query.genericAsset.nextAssetId();
  const claim = {
    tokenAddress: contracts.token.address,
    amount: depositAmount,
    beneficiary: CENNZnetAddress,
  };

  console.log("testTokenId::", testTokenId.toString());

  /***************** Make Deposit on CENNZnet **********************/
  let eventClaimId: any;
  await new Promise<void>((resolve) => {
    api.tx.erc20Peg
      .depositClaim(depositTxHash, claim)
      .signAndSend(account, async ({ status, events }) => {
        if (status.isInBlock) {
          for (const {
            event: { method, section, data },
          } of events) {
            console.log("\t", `: ${section}.${method}`, data.toString());
            const [, claimer] = data;
            if (
              section === "erc20Peg" &&
              method == "Erc20Claim" &&
              claimer &&
              claimer.toString() === account.address
            ) {
              eventClaimId = data[0];
              console.log("*******************************************");
              console.log(
                "Deposit claim on CENNZnet side started for claim Id",
                eventClaimId.toString()
              );
              resolve();
            }
          }
        }
      });
  });

  let eventProofId = null;
  // eslint-disable-next-line no-async-promise-executor
  await new Promise<void>(async (resolve, reject) => {
    const unsubHeads = await api.rpc.chain.subscribeNewHeads(() => {
      console.log("Waiting till Ethbridge sends a verify event...");
      console.log(
        "Also look for Erc20deposit event to check if deposit claim succeeeded"
      );
      api.query.system.events((events) => {
        // loop through the Vec<EventRecord>
        events.forEach((record) => {
          // extract the phase, event and the event types
          const { event } = record;
          if (event.section === "erc20Peg" && event.method === "Erc20Deposit") {
            const [claimId, , , claimer] = event.data;
            if (
              claimId.toString() === eventClaimId.toString() &&
              claimer.toString() === account.address
            ) {
              console.log("Deposited claim on CENNZnet side succeeded..");
            }
          }
          if (event.section === "ethBridge" && event.method === "Verified") {
            unsubHeads();
            resolve();
          }
          if (event.section === "ethBridge" && event.method !== "Verified") {
            console.log("Invalid", event.data);
          }
        });
      });
    });
  });
}

async function withdrawCENNZside(amount: any, ethAddress: string) {
  const { api, account }: any = await setupApi();

  let eventProofId: any;

  await new Promise<void>((resolve) => {
    api.tx.erc20Peg
      .withdraw(contracts.token.address, amount, ethAddress)
      .signAndSend(account, async ({ status, events }: any) => {
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
      });
  });

  let eventProof: any;
  // eslint-disable-next-line no-async-promise-executor
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

  // Ignore if validator public key is 0x000..
  const IGNORE_KEY =
    "0x000000000000000000000000000000000000000000000000000000000000000000";

  // Set validators for bridge
  console.log("Set validators for bridge...");
  const notaryKeys: any = await api.query.ethBridge.notaryKeys();
  const newValidators = notaryKeys.map((notaryKey: any) => {
    console.log("notary key:", notaryKey.toString());
    if (notaryKey.toString() === IGNORE_KEY) return notaryKey.toString();
    let decompressedPk = ethers.utils.computePublicKey(notaryKey);
    let h = ethers.utils.keccak256("0x" + decompressedPk.slice(4));
    return "0x" + h.slice(26);
  });
  console.log("newValidators::", newValidators);
  const eventProof_Id: any = await api.query.ethBridge.notarySetProofId();
  console.log("event proof id::", eventProof_Id.toString());
  const event_Proof: any = await api.derive.ethBridge.eventProof(eventProof_Id);
  console.log("Event proof::", event_Proof);
  console.log(
    await contracts.bridge.forceActiveValidatorSet(
      newValidators,
      event_Proof.validatorSetId,
      { gasLimit: 500000 }
    )
  );

  /***************** Make Withdrawal on ETHEREUM **********************/

  // Check beneficiary balance before first withdrawal
  let balanceBefore = await contracts.token.balanceOf(ethAddress);
  console.log(
    `${ethAddress} Beneficiary ERC20 token balance before withdrawal:`,
    balanceBefore.toString()
  );

  return eventProof;
}

export { depositCENNZside, withdrawCENNZside };
