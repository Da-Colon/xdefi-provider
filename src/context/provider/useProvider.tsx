import { ethers, Signer } from "ethers";
import { useCallback, useEffect, useState } from "react";
import { supportedBlockchains, SUPPORTED_BLOCKCHAINS } from "./networks";
import type { BlockchainProviderContext, Connection, ConnectionInfo } from "./types";

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

const _DEFAULT_CONNECTION_INFO: ConnectionInfo = { account: null };
export const DEFAULT_CONNECTION: Connection = {
  provider: null,
  signer: null,
  ..._DEFAULT_CONNECTION_INFO,
};
export const DEFAULT_PROVIDER_CONTEXT: BlockchainProviderContext = [DEFAULT_CONNECTION, () => null, () => null, () => null] as const;

const useProvider = () => {
  const xfi = window.xfi;
  const [selectedBlockchain, setSelectedBlockchain] = useState<string>();
  const [connection, setConnection] = useState<Connection>(DEFAULT_CONNECTION);

  const selectBlockchain = (blockchain: string) => {
    if (supportedBlockchains.includes(blockchain)) {
      setSelectedBlockchain(blockchain);
      setConnection(DEFAULT_CONNECTION);
    }
  };

  const injectedEthereumProvider = useCallback(async () => {
    const xfiEthereum = xfi["ethereum"];
    let signer: Signer | undefined;
    const web3Provider = new ethers.providers.Web3Provider(xfiEthereum);
    try {
      const accounts = await xfiEthereum.getaccounts();
      if (accounts.length) {
        signer = web3Provider.getSigner();
      }
      setConnection({
        signer,
        provider: web3Provider,
        chainId: xfiEthereum.chainId,
        network: "ethereum",
        account: accounts[0],
      });
    } catch {
      setConnection({
        provider: web3Provider,
        chainId: xfiEthereum.chainId,
        network: "ethereum",
      });
    }
  }, [xfi]);

  const injectedBitcoinProvider = useCallback(async () => {
    const xfiBitcoin = xfi["bitcoin"];
    await xfiBitcoin.request({ method: "request_accounts", params: [] }, (error: any, accounts: string[]) => {
      setConnection({
        signer: null,
        provider: null,
        account: accounts[0],
        chainId: xfiBitcoin.chainId,
        network: xfiBitcoin.chainId,
      });
    });
  }, [xfi]);

  const injectedLitecoinProvider = useCallback(async () => {
    const xfiLitecoin = xfi["litecoin"];
    await xfiLitecoin.request({ method: "request_accounts", params: [] }, (error: any, accounts: string[]) => {
      setConnection({
        signer: null,
        provider: null,
        account: accounts[0],
        chainId: xfiLitecoin.chainId,
        network: xfiLitecoin.chainId,
      });
    });
  }, [xfi]);

  /**
   * connect to account of selected wallet
   * @note only needs to connect once per wallet (unless manually disconnected)
   */
  const connect = useCallback(async () => {
    switch (selectedBlockchain) {
      case SUPPORTED_BLOCKCHAINS.ethereum:
        return injectedEthereumProvider();
      case SUPPORTED_BLOCKCHAINS.bitcoin:
        return injectedBitcoinProvider();
      case SUPPORTED_BLOCKCHAINS.litecoin:
        return injectedLitecoinProvider();
    }
  }, [injectedEthereumProvider, injectedBitcoinProvider, injectedLitecoinProvider, selectedBlockchain]);

  /**
   * checks for xdefi wallet and connects default selected chain (ethereum)
   * @todo update here to support ledger wallets
   * @requires xdefi wallet
   */
  useEffect(() => {
    // detect xdefi wallet
    if (xfi) {
      setSelectedBlockchain(SUPPORTED_BLOCKCHAINS.ethereum);
    }
  }, [xfi]);

  useEffect(() => {
    connect();
  }, [connect]);

  /**
   * updates connection info
   */
  const createConnectionInfo = useCallback(async () => {
    let provider: any;

    const xfiChainIdListener = (event: any) => {
      console.info("Chain Changed");
      // @todo reload
    };
    const xfiAccountListener = (event: any) => {
      console.info("Account Changed");
      // @todo reload
    };

    switch (selectedBlockchain) {
      case SUPPORTED_BLOCKCHAINS.ethereum:
        const xfiEthereum = xfi["ethereum"];
        provider = xfiEthereum;
        break;
      case SUPPORTED_BLOCKCHAINS.bitcoin:
        const xfiBitcoin = xfi["bitcoin"];
        provider = xfiBitcoin;
        break;
      case SUPPORTED_BLOCKCHAINS.litecoin:
        const xfiLitecoin = xfi["litecoin"];
        provider = xfiLitecoin;
        break;
    }

    if (provider) {
      provider.once("chainChanged", xfiChainIdListener);
      provider.once("accountsChanged", xfiAccountListener);
    }
  }, [selectedBlockchain, xfi]);

  useEffect(() => {
    createConnectionInfo();
  }, [createConnectionInfo]);

  /**
   * @see BlockchainProviderContext
   * @see Connection selected blockchain connection info
   * @see SelectedBlockchain
   * @see Connect
   * @see Disconnect
   *
   */
  return [connection, selectBlockchain, connect, () => null] as const;
};

export default useProvider;
