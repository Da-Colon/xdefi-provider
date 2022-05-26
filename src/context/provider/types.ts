import { ethers } from "ethers";

export type SelectBlockchain = () => void;
export type Connect = () => Promise<void>;
export type Disconnect = () => void;

export interface XdefiProvider {
  isConnected: boolean;
  // web3 provider
  web3Provider: ethers.providers.Web3Provider | null;
  xfiEthereumProvider: any | null;
  web3Signer: ethers.providers.JsonRpcSigner | null;
  web3Account?: string | null;
  ethChainId: number | null; // @todo is consistently number or string?
  // bitcoin provider
  xfiBitcoinProvider: any | null;
  bitcoinNetwork: string | null;
  bitcoinAccount?: string | null;
  // litecoin provider
  xfiLiteCoinProvider: any | null;
  litecoinNetwork: string | null;
  litecoinAccount?: string | null;
}

export type BlockchainProviderContext = readonly [XdefiProvider, Connect, Disconnect];

/**
 * xfi.etherum Object reference
 */

export interface XfiEthereum {
  accounts: string[];
  chainId: number;
  config: any; // @todo update
  connectionCallbacks: []; // @todo research
  currentBlock: number | null;
  getaccounts: () => Promise<string[]>; // sends request to connect to wallet!
  handleAccounts: any; // @todo research
  http: any;
  infuraId: string;
  isDebug: boolean;
  isMetamask: boolean; // if setting in wallet is true injects -> window.ethereum
  isXDEFI: boolean;
  networkId: number;
  request: (e: any) => Promise<void>;
}

// might not need this?
export type SupportBlockchains = 'ethereum' | 'bitcoin' | 'litecoin'
