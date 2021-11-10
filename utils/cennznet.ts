import { Api } from "@cennznet/api";
import { Keyring } from "@polkadot/keyring";

async function setupApi() {
  const api = await Api.create({
    network: "rata",
  });
  const keyring = new Keyring({ type: "sr25519" });
  const account = keyring.addFromUri(
    "0x934418d27a5dd1459abe599f5e683e94601841cc41cb27fb2c215361dea154fd"
  );

  return { api, account };
}

async function withdrawCENNZside(
  amount: any,
  ethAddress: string,
  tokenAddress: string,
  bridge: any
) {
  const { api, account }: any = await setupApi();

  let eventProofId: any;
  const tokenExist = await api.query.erc20Peg.erc20ToAssetId(tokenAddress);
  const tokenId = tokenExist.isSome
    ? tokenExist.unwrap()
    : await api.query.genericAsset.nextAssetId();

  await new Promise<void>((resolve) => {
    api.tx.erc20Peg
      .withdraw(tokenId, amount, ethAddress)
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
}

export { withdrawCENNZside };
