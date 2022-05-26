import { ethers } from "ethers";
import { useCallback, useEffect, useState } from "react";
import type { BlockchainProviderContext, XdefiProvider } from "./types";

declare global {
  interface Window {
    ethereum: any;
    xfi: {
      ethereum: any;
      bitcoin: any;
      litecoin: any;
    };
  }
}

export const DEFAULT_CONNECTION: XdefiProvider = {
  isConnected: false,
  // web3 provider
  web3Provider: null,
  web3Signer: null,
  web3Account: null,
  xfiEthereumProvider: null,
  ethChainId: null,
  // bitcoin provider
  xfiBitcoinProvider: null,
  bitcoinNetwork: null,
  bitcoinAccount: null,
  // litecoin provider
  xfiLiteCoinProvider: null,
  litecoinNetwork: null,
  litecoinAccount: null,
};
export const DEFAULT_PROVIDER_CONTEXT: BlockchainProviderContext = [DEFAULT_CONNECTION, async () => {}, () => {}] as const;

const useProvider = () => {
  const xfi = window.xfi;
  const [xdefiProvider, setXdefiProvider] = useState<XdefiProvider>(DEFAULT_CONNECTION);

  const injectedAccount = useCallback(async (xfiProvider: any, signer?: ethers.providers.JsonRpcSigner): Promise<string | null> => {
    let account: string | null = null;
    try {
      if (signer) {
        account = await signer.getAddress();
      }
      if (!signer) {
        await xfiProvider.request({ method: "request_accounts", params: [] }, (error: any, accounts: string[]) => {
          console.log("🚀 ~ file: useProvider.tsx ~ line 47 ~ error", error)
          console.log("🚀 ~ file: useProvider.tsx ~ line 53 ~ accounts", accounts)
          if (!error && accounts.length) {
            account = accounts[0];
          }
          account = null;
        });
      }
    } catch (e) {
      console.log("🚀 ~ file: useProvider.tsx ~ line 54 ~ e", e)
      account = null;
    }
    return account;
  }, []);

  /**
   * connect to account of selected wallet
   * @todo save a cookie for auto injections
   */
  const connect = useCallback(async () => {
    const xfi = window.xfi;
    const xfiEthereum = xfi["ethereum"];
    const xfiBitcoin = xfi["bitcoin"];
    const xfiLitecoin = xfi["litecoin"];

    // web3 provider
    const web3Provider = new ethers.providers.Web3Provider(xfiEthereum);
    const signer = web3Provider.getSigner();
    // accounts
    const web3Account = await injectedAccount(xfiEthereum, signer);
    console.log("🚀 ~ file: useProvider.tsx ~ line 69 ~ web3Account", web3Account);
    const bitcoinAccount = await injectedAccount(xfiEthereum);
    console.log("🚀 ~ file: useProvider.tsx ~ line 71 ~ bitcoinAccount", bitcoinAccount);
    const litecoinAccount = await injectedAccount(xfiEthereum);
    console.log("🚀 ~ file: useProvider.tsx ~ line 73 ~ litecoinAccount", litecoinAccount);

    setXdefiProvider({
      isConnected: !!(web3Account && bitcoinAccount && litecoinAccount),
      // web3 provider
      web3Provider,
      web3Signer: signer,
      web3Account: web3Account,
      xfiEthereumProvider: xfiEthereum,
      ethChainId: xfiBitcoin.chainId,
      // bitcoin provider
      xfiBitcoinProvider: xfiBitcoin,
      bitcoinNetwork: xfiBitcoin.chainId,
      bitcoinAccount: bitcoinAccount,
      // litecoin provider
      xfiLiteCoinProvider: xfiLitecoin,
      litecoinNetwork: xfiLitecoin.chainId,
      litecoinAccount: litecoinAccount,
    });
  }, []);

  /**
   * checks for xdefi wallet and connects default selected chain (ethereum)
   * @todo update here to support ledger wallets
   * @requires xdefi wallet
   */
  useEffect(() => {
    // detect xdefi wallet
    if (xfi) {
      connect();
    }
  }, [xfi, connect]);

  /**
   * updates connection info
   */
  const addListeners = useCallback(async () => {
    const xfiChainIdListener = (event: any) => {
      console.info("Chain Changed");
      // @todo reload
    };
    const xfiAccountListener = (event: any) => {
      console.info("Account Changed");
      // @todo reload
    };

    if (xdefiProvider.xfiEthereumProvider) {
      xdefiProvider.xfiEthereumProvider.once("chainChanged", xfiChainIdListener);
      xdefiProvider.xfiEthereumProvider.once("accountsChanged", xfiAccountListener);
    }
    if (xdefiProvider.xfiBitcoinProvider) {
      xdefiProvider.xfiBitcoinProvider.once("chainChanged", xfiChainIdListener);
      xdefiProvider.xfiBitcoinProvider.once("accountsChanged", xfiAccountListener);
    }
    if (xdefiProvider.xfiBitcoinProvider) {
      xdefiProvider.xfiBitcoinProvider.once("chainChanged", xfiChainIdListener);
      xdefiProvider.xfiBitcoinProvider.once("accountsChanged", xfiAccountListener);
    }
  }, [xdefiProvider]);

  useEffect(() => {
    addListeners();
  }, [addListeners]);

  /**
   * @see BlockchainProviderContext
   * @see Connection selected blockchain connection info
   * @see SelectedBlockchain
   * @see Connect
   * @see Disconnect
   *
   */
  return [xdefiProvider, connect, () => null] as const;
};

export default useProvider;
