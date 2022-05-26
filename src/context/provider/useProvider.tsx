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
      setConnection(DEFAULT_CONNECTION)
      setXfiProvider(undefined);
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
    }
    if (selectedBlockchain === SUPPORTED_BLOCKCHAINS.bitcoin) {
      xFiProvider.request({ method: "request_accounts", params: [] }, (error: any, accounts: string[]) => {
        setConnection((prevConnection) => ({ ...prevConnection, account: accounts[0] }));
      });
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
        let signer: any;
        const accounts = await xFiProvider.handleAccounts();
        if (accounts.length) {
          signer = provider.getSigner();
        }
        setConnection((prevConnection) => ({ ...prevConnection, provider, signer }));
        return;
      }
      if (selectedBlockchain === SUPPORTED_BLOCKCHAINS.bitcoin) {
        setConnection((prevConnection) => ({ ...prevConnection, provider: 'bitcoin', signer: 'bitcoin' }));
      }
      if (selectedBlockchain === SUPPORTED_BLOCKCHAINS.litecoin) {
        setConnection((prevConnection) => ({ ...prevConnection, provider: 'litecoin', signer: 'litecoin' }));
      }
    }
  }, [xFiProvider, selectedBlockchain]);

  useEffect(() => {
    connectProvider();
  }, [connectProvider]);

  /**
   * updates connection info
   */
  const createConnectionInfo = useCallback(async () => {
    let connectionInfo = { ..._DEFAULT_CONNECTION_INFO };
    if (xFiProvider) {
      if (connection.signer) {
        if (selectedBlockchain === SUPPORTED_BLOCKCHAINS.ethereum) {
          const account = await connection.signer.getAddress();
          connectionInfo.account = account;
        }
        if (selectedBlockchain === SUPPORTED_BLOCKCHAINS.bitcoin) {
          xFiProvider.request({ method: "request_accounts", params: [] }, (error: any, accounts: string[]) => {
            setConnection((prevConnection) => ({ ...prevConnection, account: accounts[0] }));
          });
        }
        if (selectedBlockchain === SUPPORTED_BLOCKCHAINS.litecoin) {
          // @todo add litecoin support
        }
      }
      connectionInfo.chainId = xFiProvider.chainId;
    }
    connectionInfo.network = selectedBlockchain;
    setConnection((prevConnection) => ({ ...prevConnection, ...connectionInfo }));
  }, [connection.signer, selectedBlockchain, xFiProvider]);

  useEffect(() => {
    createConnectionInfo();
  }, [createConnectionInfo]);

  /**
   * subcribes to xFi provider events
   */
  useEffect(() => {
    const xfiChainIdListener = (event: any) => {
      console.log("🚀 ~ xdefi chain changed", event);
    };
    const xfiAccountListener = (event: any) => {
      console.log("🚀 ~ Xdefi Account changed", event);
    };
    const web3AccountListener = (event: any) => {
      console.log("🚀 ~ Web3 Account changed", event);
    };
    const web3ChainIdListener = (event: any) => {
      console.log("🚀 ~ Web3 Account changed", event);
    };
    if (xFiProvider) {
      // subscribe to provider events
      xFiProvider.on("chainChanged", xfiChainIdListener);
      xFiProvider.on("accountsChanged", xfiAccountListener);
    }
    if (connection.provider instanceof ethers.providers.Web3Provider) {
      // subscribe to Network events
      connection.provider.on("chainChanged", web3ChainIdListener);

      // subscribe to account change events
      connection.provider.on("accountsChanged", web3AccountListener);

      // subscribe to provider disconnection
      connection.provider.on("disconnect", () => {});
    }

    return () => {
      // unsubscribe to provider events
      if (xFiProvider) {
        xFiProvider.off("chainChanged", xfiChainIdListener);
        xFiProvider.off("accountsChanged", xfiAccountListener);
      }
      if (connection.provider instanceof ethers.providers.Web3Provider) {
        connection.provider.off("chainChanged", web3ChainIdListener);
        connection.provider.off("accountsChanged", web3AccountListener);
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
