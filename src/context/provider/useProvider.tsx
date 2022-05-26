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
  const [xdefiProvider, setXdefiProvider] = useState<XdefiProvider>(DEFAULT_CONNECTION);

  const injectedWeb3Account = useCallback(async (signer: ethers.providers.JsonRpcSigner) => {
    try {
      return await signer.getAddress();
    } catch {
      return null;
    }
  }, []);
  const injectedAccount = useCallback(async (xfiProvider: any) => {
    try {
      xfiProvider.request({ method: "request_accounts", params: [] }, (error: any, accounts: string[]) => {
        if (!error && accounts.length) {
          // ! this is janky
          setXdefiProvider((prevProvider) => ({ ...prevProvider, [`${xfiProvider.chainId}Account`]: accounts[0] }));
        }
      });
    } catch {
      return null;
    }
  }, []);

  /**
   * connect to account of selected wallet
   * @todo save a cookie for auto injections
   */
  const connect = useCallback(async () => {
    const xfi = window.xfi;
    if (xfi) {
      const xfiEthereum = xfi["ethereum"];
      const xfiBitcoin = xfi["bitcoin"];
      const xfiLitecoin = xfi["litecoin"];

      // web3 provider
      const web3Provider = new ethers.providers.Web3Provider(xfiEthereum);
      const signer = web3Provider.getSigner();
      // accounts
      const web3Account = await injectedWeb3Account(signer);
      await injectedAccount(xfiBitcoin);
      await injectedAccount(xfiLitecoin);

      setXdefiProvider((prevProvider) => ({
        ...prevProvider,
        isConnected: !!web3Account,
        // web3 provider
        web3Provider,
        web3Signer: signer,
        web3Account: web3Account,
        xfiEthereumProvider: xfiEthereum,
        ethChainId: xfiEthereum.chainId,
        // bitcoin provider
        xfiBitcoinProvider: xfiBitcoin,
        bitcoinNetwork: xfiBitcoin.chainId,
        // litecoin provider
        xfiLiteCoinProvider: xfiLitecoin,
        litecoinNetwork: xfiLitecoin.chainId,
      }));
    }
  }, [injectedWeb3Account, injectedAccount]);

  /**
   * checks for xdefi wallet and connects default selected chain (ethereum)
   * @todo update here to support ledger wallets
   * @requires xdefi wallet
   */
  useEffect(() => {
    connect();
  }, [connect]);

  /**
   * updates connection info
   */
  const addListeners = useCallback(async () => {
    const xfiChainIdListener = (event: any) => {
      // console.info("Chain Changed", event);
      // @todo reload
    };
    const xfiAccountListener = (event: any) => {
      // console.info("Account Changed", event);
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
