import React, { useCallback, useEffect, useState } from "react";
import {
  web3Enable,
  web3AccountsSubscribe,
  web3FromSource,
  web3Accounts,
} from "@polkadot/extension-dapp";
import { InjectedExtension } from "@polkadot/extension-inject/types";
import { defaults as addressDefaults } from "@polkadot/util-crypto/address/defaults";
import { Api as ApiPromise } from "@cennznet/api";
import { hexToString } from "@polkadot/util";
import { decodeAddress } from "@polkadot/keyring";
import store from "store";
import axios from "axios";
import Web3Context from "../context/Web3Context";
const endpoint = process.env.NEXT_PUBLIC_CENNZ_API_ENDPOINT;
const EXTENSION = "cennznet-extension";
import ERC20Tokens from "../artifacts/erc20tokens.json";

async function extractMeta(api) {
  const systemChain = await api.rpc.system.chain();
  const genesisHashExpected = api.genesisHash.toString();
  const response = await axios.get(
    "https://raw.githubusercontent.com/cennznet/api.js/master/extension-releases/runtimeModuleTypes.json"
  );
  const { data } = response;
  const additionalTypes = data;
  if (additionalTypes) {
    let typesForCurrentChain = additionalTypes[genesisHashExpected];
    // if not able to find types, take the first element (in case of local node the genesis Hash keep changing)
    typesForCurrentChain =
      typesForCurrentChain === undefined
        ? Object.values(additionalTypes)[0]
        : typesForCurrentChain;
    let specTypes, userExtensions;
    if (typesForCurrentChain) {
      specTypes = typesForCurrentChain.types;
      userExtensions = typesForCurrentChain.userExtensions;
    }
    const DEFAULT_SS58 = api.registry.createType("u32", addressDefaults.prefix);
    const DEFAULT_DECIMALS = api.registry.createType("u32", 4);
    const metadata = {
      chain: systemChain,
      color: "#191a2e",
      genesisHash: api.genesisHash.toHex(),
      icon: "CENNZnet",
      metaCalls: Buffer.from(api.runtimeMetadata.asCallsOnly.toU8a()).toString(
        "base64"
      ),
      specVersion: api.runtimeVersion.specVersion.toNumber(),
      ss58Format: DEFAULT_SS58.toNumber(),
      tokenDecimals: DEFAULT_DECIMALS.toNumber(),
      tokenSymbol: "CENNZ",
      types: specTypes,
      userExtensions: userExtensions,
    };
    return metadata;
  }
  return null;
}

const Web3: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [hasWeb3injected, setHasWeb3Injected] = useState(false);
  const [wallet, setWallet] = useState<InjectedExtension>();
  const [balances, setBalances] = useState(null);
  const [signer, setSigner] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [api, setAPI] = useState(null);

  const getAccountAssets = useCallback(
    async (address: string) => {
      await api.isReady;
      const assets = await api.rpc.genericAsset.registeredAssets();
      const tokenMap = {};

      for (const asset of assets) {
        const [tokenId, { symbol, decimalPlaces }] = asset;
        // Generic assets
        if (hexToString(symbol.toJSON()) !== "")
          tokenMap[tokenId] = {
            symbol: hexToString(symbol.toJSON()),
            decimalPlaces: decimalPlaces.toNumber(),
          };
        else {
          // ERC20 Tokens
          let tokenAddress = await api.query.erc20Peg.assetIdToErc20(tokenId);
          tokenAddress = tokenAddress.toJSON();
          try {
            // Only fetch data for tokens on selected network
            for (const ERC20Token of ERC20Tokens.tokens) {
              const tokenChainId = store.get("token-chain-id");
              if (
                (ERC20Token.chainId === tokenChainId &&
                  ERC20Token.address === tokenAddress) ||
                tokenAddress === "0x0000000000000000000000000000000000000000"
              ) {
                const tokenSymbolOption = await api.query.erc20Peg.erc20Meta(
                  tokenAddress
                );
                tokenMap[tokenId] = {
                  symbol: hexToString(tokenSymbolOption.toJSON()[0]),
                  decimalPlaces: decimalPlaces.toNumber(),
                  address: tokenAddress,
                };
              }
            }
          } catch (err) {
            console.log(err.message);
          }
        }
      }
      const balanceSubscriptionArg = Object.keys(tokenMap).map(
        (tokenId, index) => {
          tokenMap[tokenId].index = index;
          return [tokenId, address];
        }
      );
      await api.query.genericAsset.freeBalance.multi(
        balanceSubscriptionArg,
        (balances) => {
          const userBalances = {};
          Object.keys(tokenMap).forEach((tokenId) => {
            const token = tokenMap[tokenId];
            const tokenBalance =
              balances[token.index] / Math.pow(10, token.decimalPlaces);
            if (tokenBalance > 0 && token.symbol !== "")
              userBalances[token.symbol] = {
                balance: tokenBalance,
                tokenId,
                decimalPlaces: token.decimalPlaces,
                address: token.address,
                symbol: token.symbol,
              };
          });
          setBalances(userBalances);
        }
      );
    },
    [api]
  );

  const updateSelectedAccount = async (account) => {
    setSelectedAccount(account);
  };

  const connectWallet = async () => {
    try {
      const extensions = await web3Enable("Bridge");

      const cennznetWallet = extensions.find(
        (extension) => extension.name === "cennznet-extension"
      );

      if (!cennznetWallet) throw new Error("CENNZnet wallet not found");
      const metadata = cennznetWallet.metadata;
      const checkIfMetaUpdated = localStorage.getItem(`EXTENSION_META_UPDATED`);
      if (!checkIfMetaUpdated && api) {
        try {
          const metadataDef = await extractMeta(api);
          if (metadataDef) {
            await metadata.provide(metadataDef as any);
            localStorage.setItem(`EXTENSION_META_UPDATED`, "true");
          }
        } catch (e) {
          // any issue with metadata update should not ask to install extension
          console.log(`update metadata rejected ${e}`);
        }
      }

      setWallet(cennznetWallet);
      store.set("CENNZNET-EXTENSION", cennznetWallet);

      setHasWeb3Injected(true);
    } catch (error) {
      setHasWeb3Injected(false);
    }
  };

  const updateApi = (endpoint) => {
    let apiInstance: ApiPromise;
    try {
      apiInstance = new ApiPromise({ provider: endpoint });
    } catch (err) {
      console.error(`cennznet connection failed: ${err}`);
    }

    if (!apiInstance) {
      console.warn(`cennznet is not connected. endpoint: ${endpoint}`);
      return;
    }

    apiInstance.isReady.then(() => setAPI(apiInstance));
  };

  // Create api instance
  useEffect(() => {
    let apiInstance: ApiPromise;
    try {
      apiInstance = new ApiPromise({ provider: endpoint });
    } catch (err) {
      console.error(`cennznet connection failed: ${err}`);
    }

    if (!apiInstance) {
      console.warn(`cennznet is not connected. endpoint: ${endpoint}`);
      return;
    }

    apiInstance.isReady.then(() => setAPI(apiInstance));
  }, []);

  // Get balances for extension account when api or web3Account has changed
  useEffect(() => {
    if (api && selectedAccount) {
      getAccountAssets(selectedAccount.address);
    }
  }, [api, selectedAccount, getAccountAssets]);

  // Set account/signer when wallet has changed
  useEffect(() => {
    const getSelectedAccount = async () => {
      await web3Enable("Bridge");
      const accounts = await web3Accounts();

      if (accounts.length === 0) {
        setSelectedAccount(null);
        //error modal no accounts
      } else {
        const acc = accounts.map((acc) => ({
          address: acc.address,
          name: acc.meta.name,
        }));
        setAccounts(acc);
      }

      web3AccountsSubscribe(async (accounts) => {
        if (accounts.length) {
          const acc = accounts.map((acc) => ({
            address: acc.address,
            name: acc.meta.name,
          }));
          setAccounts(acc);
        }
      });
    };

    // if wallet exist,
    if (wallet && !selectedAccount) {
      getSelectedAccount();
    }
  }, [wallet]);

  useEffect(() => {
    (async () => {
      await web3Enable("Bridge");
      if (signer === null || signer === undefined) {
        try {
          const injector = await web3FromSource(EXTENSION);
          setSigner(injector.signer);
          if (!injector) throw new Error("No extension found");
        } catch (error) {
          //error modal no extension
        }
      }
      if (
        (selectedAccount === undefined || selectedAccount === null) &&
        accounts.length > 0
      ) {
        //  select the 0th account by default if no accounts are selected
        setSelectedAccount(accounts[0]);
      }
    })();
  }, [accounts, selectedAccount, signer]);

  return (
    <Web3Context.Provider
      value={{
        hasWeb3injected,
        connectWallet,
        updateSelectedAccount,
        extension: wallet,
        balances,
        signer,
        accounts,
        selectedAccount,
        api,
        decodeAddress,
        setBalances,
        updateApi,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export default Web3;
