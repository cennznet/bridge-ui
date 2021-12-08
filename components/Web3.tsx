import React, { useCallback, useEffect, useState } from "react";
import {
  web3Enable,
  web3AccountsSubscribe,
  web3FromSource,
  web3Accounts,
} from "@polkadot/extension-dapp";
import { InjectedExtension } from "@polkadot/extension-inject/types";
import { Api as ApiPromise } from "@cennznet/api";
import { hexToString } from "@polkadot/util";
import { decodeAddress } from "@polkadot/keyring";
import store from "store";
import Web3Context from "../context/Web3Context";
const EXTENSION = "cennznet-extension";
import ERC20Tokens from "../artifacts/erc20tokens.json";
import ErrorModal from "./ErrorModal";

const Web3: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [hasWeb3injected, setHasWeb3Injected] = useState(false);
  const [wallet, setWallet] = useState<InjectedExtension>();
  const [balances, setBalances] = useState(null);
  const [signer, setSigner] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [api, setAPI] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalState, setModalState] = useState("");

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

      setWallet(cennznetWallet);
      store.set("CENNZNET-EXTENSION", cennznetWallet);

      setHasWeb3Injected(true);
    } catch (error) {
      setModalState("noExtension");
      setModalOpen(true);
      setHasWeb3Injected(false);
    }
  };

  useEffect(() => {
    if (wallet)
      (async () => {
        await web3Enable("Bridge");
        if (signer === null || signer === undefined) {
          const injector = await web3FromSource(EXTENSION);
          setSigner(injector.signer);
        }
        if (
          (selectedAccount === undefined || selectedAccount === null) &&
          accounts.length > 0
        ) {
          //  select the 0th account by default if no accounts are selected
          const account = store.get("selected-CENNZnet-account")
            ? store.get("selected-CENNZnet-account")
            : accounts[0];
          setSelectedAccount(account);
        }
      })();
  }, [accounts, wallet, selectedAccount, signer]);

  const updateApi = async (endpoint) => {
    let apiPromise: any;
    try {
      apiPromise = new ApiPromise({ provider: endpoint });
    } catch (err) {
      console.error(`cennznet connection failed: ${err}`);
    }

    if (!apiPromise) {
      console.warn(`cennznet is not connected. endpoint: ${endpoint}`);
      return;
    }

    apiPromise.isReady.then(() => setAPI(apiPromise));
  };

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
        setModalState("noAccounts");
        setModalOpen(true);
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
  }, [wallet, selectedAccount]);

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
      {modalOpen && (
        <ErrorModal setModalOpen={setModalOpen} modalState={modalState} />
      )}
      {children}
    </Web3Context.Provider>
  );
};

export default Web3;
