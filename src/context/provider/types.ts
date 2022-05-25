export type SelectBlockchain = (blockchain: string) => void;
export type Connect = () => void;
export type Disconnect = () => void;
export interface Connection extends ConnectionInfo {
  provider?: any;
  signer?: any;
  selectedBlockchain?: string;
}

export interface ConnectionInfo {
  account?: string | null,
  chainId?: string | number | null, // @todo is consistently number or string?
  network?: string | null,
}

export type BlockchainProviderContext = readonly [Connection, SelectBlockchain, Connect, Disconnect];


/**
 * xfi.etherum Object reference
 */

export interface XfiEthereum {
  accounts: string[],
  chainId: number,
  config: any, // @todo update
  connectionCallbacks: [], // @todo research
  currentBlock: number | null,
  getaccounts: () => Promise<string[]>, // sends request to connect to wallet!
  handleAccounts: any, // @todo research
  http: any,
  infuraId: string,
  isDebug: boolean,
  isMetamask: boolean; // if setting in wallet is true injects -> window.ethereum
  isXDEFI: boolean;
  networkId: number;
  request: (e: any) => Promise<void>;
}