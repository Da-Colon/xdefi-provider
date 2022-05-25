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
  const [connection, setConnection] = useState<Connection>(DEFAULT_CONNECTION);

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
        setConnection((prevConnection) => ({ ...prevConnection, signer }));
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
        setXfiProvider(xfiBitcoin);
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
        const provider = new ethers.providers.Web3Provider(xFiProvider);
        const accounts = await xFiProvider.getaccounts();
        let signer: any;
        if (accounts.length) {
          signer = provider.getSigner();
        }
        setConnection((prevConnection) => ({ ...prevConnection, signer, provider }));
        return;
      }
      if (selectedBlockchain === SUPPORTED_BLOCKCHAINS.bitcoin) {
        // @todo add bitcoin support
      }
      if (selectedBlockchain === SUPPORTED_BLOCKCHAINS.litecoin) {
        // @todo add litecoin support
      }
    }
    // @todo should this reset to default if reached?
  }, [xFiProvider, selectedBlockchain]);

  useEffect(() => {
    connectProvider();
  }, [connectProvider]);

  /**
   * updates connection info
   */
  const createConnectionInfo = useCallback(async () => {
    let connectionInfo = {..._DEFAULT_CONNECTION_INFO};
    if (connection.signer) {
      if (selectedBlockchain === SUPPORTED_BLOCKCHAINS.ethereum) {
        const account = await connection.signer.getAddress();
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
    }
    setConnection((prevConnection) => ({ ...prevConnection, ...connectionInfo }));
  }, [connection.signer, selectedBlockchain, xFiProvider]);

  useEffect(() => {
    createConnectionInfo();
  }, [createConnectionInfo]);

  /**
   * subcribes to xFi provider events
   */
  useEffect(() => {
    const changeChainListener = (event: any) => {
      console.log(`chainChanged::${event.chainId}`, event);
    };
    const changeAccountsListener = (event: any) => {
      console.log(`accountsChanged::${event.chainId}`, event);
    };
    if (xFiProvider) {
      // subscribe to provider events
      xFiProvider.on("chainChanged", changeChainListener);
      xFiProvider.on("accountsChanged", changeAccountsListener);
    }
    if (connection.provider) {
      // subscribe to Network events
      connection.provider.on("chainChanged", changeChainListener);

      // subscribe to account change events
      connection.provider.on("accountsChanged", changeAccountsListener);

      // subscribe to provider disconnection
      connection.provider.on("disconnect", () => {});
    }

    return () => {
      // unsubscribe to provider events
      if (xFiProvider) {
        xFiProvider.off("chainChanged", changeChainListener);
        xFiProvider.off("chainChanged", changeAccountsListener);
      }
      if (connection.provider) {
        connection.provider.off("chainChanged", changeChainListener);
        connection.provider.off("accountsChanged", changeAccountsListener);
        connection.provider.off("disconnect");
      }
    };
  }, [xFiProvider, connection.provider]);

  /**
   * @see BlockchainProviderContext
   * @see Connection selected blockchain connection info
   * @see SelectedBlockchain
   * @see Connect
   * @see Disconnect
   *
   */
  return [connection, selectBlockchain, connectToAccount, () => null] as const;
};

export default useProvider;
