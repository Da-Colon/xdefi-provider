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

const _DEFAULT_CONNECTION_INFO: ConnectionInfo = { account: null, network: null, chainId: null };
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

  /**
   * connect to account of selected wallet
   * @note only needs to connect once per wallet (unless manually disconnected)
   */
  const connect = async () => {
    switch (selectedBlockchain) {
      case SUPPORTED_BLOCKCHAINS.ethereum: {
        const xfiEthereum = xfi["ethereum"];
        let signer: Signer;
        const accounts = await xfiEthereum.getaccounts();
        const web3Provider = new ethers.providers.Web3Provider(xfiEthereum);
        if (accounts.length) {
          signer = web3Provider.getSigner();
        }
        setConnection((prevConnection) => ({ ...prevConnection, signer, provider: web3Provider, chainId: xfiEthereum.chainId, network: selectedBlockchain }));
        break;
      }
      case SUPPORTED_BLOCKCHAINS.bitcoin: {
        const xfiBitcoin = xfi["bitcoin"];
        xfiBitcoin.request({ method: "request_accounts", params: [] }, (error: any, accounts: string[]) => {
          setConnection((prevConnection) => ({
            ...prevConnection,
            signer: null,
            provider: null,
            account: accounts[0],
            chaindId: xfiBitcoin.chaindId,
            network: xfiBitcoin.chainId,
          }));
        });
        break;
      }
      case SUPPORTED_BLOCKCHAINS.litecoin: {
        const xfiLitecoin = xfi["litecoin"];
        xfiLitecoin.request({ method: "request_accounts", params: [] }, (error: any, accounts: string[]) => {
          setConnection((prevConnection) => ({
            ...prevConnection,
            signer: null,
            provider: null,
            account: accounts[0],
            chaindId: xfiLitecoin.chaindId,
            network: xfiLitecoin.chaindId,
          }));
        });
        break;
      }
    }
  };

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

  /**
   * attempts to connect to selected provider
   * @requires xdefi wallet
   * @requires selectedBlockchain
   */
  const connectProvider = useCallback(async () => {
    switch (selectedBlockchain) {
      case SUPPORTED_BLOCKCHAINS.ethereum: {
        const xfiEthereum = xfi["ethereum"];
        let account: string;
        const provider = new ethers.providers.Web3Provider(xfiEthereum);
        const signerOrProvider = provider.getSigner();
        const accounts = await xfiEthereum.handleAccounts();
        if (accounts.length) {
          account = await signerOrProvider.getAddress();
        }
        setConnection((prevConnection) => ({
          ...prevConnection,
          account,
          provider,
          signerOrProvider,
          chainId: xfiEthereum.chainId,
          network: selectedBlockchain,
        }));
        break;
      }
      case SUPPORTED_BLOCKCHAINS.bitcoin: {
        const xfiBitcoin = xfi["bitcoin"];
        await xfiBitcoin.request({ method: "request_accounts", params: [] }, (error: any, accounts: string[]) => {
          setConnection((prevConnection) => ({
            ...prevConnection,
            signer: null,
            provider: xfiBitcoin,
            account: accounts[0],
            chainId: xfiBitcoin.chainId,
            network: selectedBlockchain,
          }));
        });
        break;
      }
      case SUPPORTED_BLOCKCHAINS.litecoin: {
        const xfiLitecoin = xfi["litecoin"];
        await xfiLitecoin.request({ method: "request_accounts", params: [] }, (error: any, accounts: string[]) => {
          setConnection((prevConnection) => ({
            ...prevConnection,
            signer: null,
            provider: xfiLitecoin,
            account: accounts[0],
            chainId: xfiLitecoin.chainId,
            network: selectedBlockchain,
          }));
        });
        break;
      }
    }
  }, [selectedBlockchain, xfi]);

  useEffect(() => {
    connectProvider();
  }, [connectProvider]);

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
