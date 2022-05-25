import { ethers } from "ethers";
import { useCallback, useEffect, useState } from "react";
import { supportedBlockchains, SUPPORTED_BLOCKCHAINS } from "./networks";
import type { BlockchainProviderContext, Connection, ConnectionInfo, XfiEthereum } from "./types";

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
const _DEFAULT_CONNECTION_INFO: ConnectionInfo = { account: null, network: null, chainId: null };
export const DEFAULT_CONNECTION: Connection = {
  provider: undefined,
  ..._DEFAULT_CONNECTION_INFO,
};
export const DEFAULT_PROVIDER_CONTEXT: BlockchainProviderContext = [DEFAULT_CONNECTION, () => null, () => null, () => null] as const;

const useProvider = () => {
  const [selectedBlockchain, setSelectedBlockchain] = useState<string>();
  const [xFiProvider, setXfiProvider] = useState<any>();
  const [provider, setProvider] = useState<any>();
  const [signer, setSigner] = useState<any>();
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo>();

  const selectBlockchain = (blockchain: string) => {
    if (supportedBlockchains.includes(blockchain)) {
      setSelectedBlockchain(blockchain);
    }
  };

  const connectToAccount = async () => {
    if (selectedBlockchain === SUPPORTED_BLOCKCHAINS.ethereum) {
      const accounts = await xFiProvider.getaccounts();
      if (accounts.length) {
        const web3Provider = new ethers.providers.Web3Provider(xFiProvider);
        const signer = web3Provider.getSigner();
        setSigner(signer);
      }
      return;
    }
    if (selectedBlockchain === SUPPORTED_BLOCKCHAINS.bitcoin) {
      // ? how do you connect (get signer) to bitcoin wallet?
    }
    if (selectedBlockchain === SUPPORTED_BLOCKCHAINS.litecoin) {
      // ? how do you connect (get signer) for litecoin wallet?
    }
  };

  /**
   * checks for xdefi wallet and connects default selected chain (ethereum)
   * @todo update here to support ledger wallets
   * @requires xdefi wallet
   */
  useEffect(() => {
    // detect xdefi wallet
    if ("xfi" in window) {
      setSelectedBlockchain(SUPPORTED_BLOCKCHAINS.ethereum);
    }
  }, []);

  /**
   * sets injected provider to state based on selected blockchain
   * @requires xdefi wallet
   * @requires selectedBlockchain
   */
  useEffect(() => {
    const xfi = window.xfi;
    if (xfi && selectedBlockchain) {
      const xfiEthereum: XfiEthereum = xfi.ethereum;
      if (xfiEthereum && selectedBlockchain === SUPPORTED_BLOCKCHAINS.ethereum) {
        setXfiProvider(xfiEthereum);
      }
      const xfiBitcoin: any = xfi.bitcoin;
      if (xfiBitcoin && selectedBlockchain === SUPPORTED_BLOCKCHAINS.bitcoin) {
        setXfiProvider(xfiEthereum);
      }
      const xfiLitecoin: any = xfi.litecoin;
      if (xfiLitecoin && selectedBlockchain === SUPPORTED_BLOCKCHAINS.litecoin) {
        setXfiProvider(xfiLitecoin);
      }
    }
  }, [selectedBlockchain]);

  /**
   * attempts to connect to selected provider
   * @requires xdefi wallet
   * @requires selectedBlockchain
   * @requires xFiProvider
   */
  const connectProvider = useCallback(async () => {
    if (xFiProvider) {
      if (selectedBlockchain === SUPPORTED_BLOCKCHAINS.ethereum) {
        const web3Provider = new ethers.providers.Web3Provider(xFiProvider);
        const handleAccountRes = await xFiProvider.handleAccounts();
        if (handleAccountRes.length) {
          const signer = web3Provider.getSigner();
          setSigner(signer);
        }
        setProvider(web3Provider);
        return;
      }
      if (selectedBlockchain === SUPPORTED_BLOCKCHAINS.bitcoin) {
        // @todo add bitcoin support
      }
      if (selectedBlockchain === SUPPORTED_BLOCKCHAINS.litecoin) {
        // @todo add litecoin support
      }
      setProvider(undefined);
      setSigner(undefined);
    }
  }, [xFiProvider, selectedBlockchain]);

  useEffect(() => {
    connectProvider();
  }, [connectProvider]);

  /**
   * updates connection info
   */
  const createConnectionInfo = useCallback(async () => {
    if (signer && selectedBlockchain) {
      let connectionInfo = _DEFAULT_CONNECTION_INFO;
      if (selectedBlockchain === SUPPORTED_BLOCKCHAINS.ethereum) {
        const account = await signer.getAddress();
        connectionInfo.account = account;
      }
      if (selectedBlockchain === SUPPORTED_BLOCKCHAINS.bitcoin) {
        // @todo add bitcoin support
      }
      if (selectedBlockchain === SUPPORTED_BLOCKCHAINS.litecoin) {
        // @todo add litecoin support
      }
      connectionInfo.chainId = xFiProvider.chainId;
      connectionInfo.network = selectedBlockchain;
      setConnectionInfo(connectionInfo);
    }
  }, [signer, selectedBlockchain, xFiProvider]);

  useEffect(() => {
    createConnectionInfo();
  }, [createConnectionInfo]);

  /**
   * subcribes to xFi provider events
   */
  useEffect(() => {
    const changeChainListener = (event: any) => {
      console.log(`chainChanged::${event.chainId}`, event);
      setXfiProvider(undefined);
    };
    const changeAccountsListener = (event: any) => {
      console.log(`accountsChanged::${event.chainId}`, event);
      setXfiProvider(undefined);
    };
    if (xFiProvider) {
      // subscribe to provider events
      xFiProvider.on("chainChanged", changeChainListener);
      xFiProvider.on("accountsChanged", changeAccountsListener);
    }
    if (provider) {
      // subscribe to Network events
      provider.on("chainChanged", changeChainListener);

      // subscribe to account change events
      provider.on("accountsChanged", changeAccountsListener);

      // subscribe to provider disconnection
      provider.on("disconnect", () => {
        setXfiProvider(undefined);
      });
    }

    return () => {
      // unsubscribe to provider events
      if (xFiProvider) {
        xFiProvider.off("chainChanged", changeChainListener);
        xFiProvider.off("chainChanged", changeAccountsListener);
      }
      if (provider) {
        provider.off("chainChanged", changeChainListener);
        provider.off("accountsChanged", changeAccountsListener);
        provider.off("disconnect");
      }
    };
  }, [xFiProvider, provider]);

  /**
   * @see BlockchainProviderContext
   * @see Connection selected blockchain connection info
   * @see SelectedBlockchain
   * @see Connect
   * @see Disconnect
   *
   */
  return [
    {
      provider,
      signer,
      selectedBlockchain,
      ...connectionInfo,
    },
    selectBlockchain,
    connectToAccount,
    () => null,
  ] as const;
};

export default useProvider;
