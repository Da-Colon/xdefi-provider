export const SUPPORTED_BLOCKCHAINS: { bitcoin: string; litecoin: string; ethereum: string } = {
  ethereum: "ethereum",
  bitcoin: "bitcoin",
  litecoin: "litecoin",
};

/**
 * defines supported blockchains
 * any static data that is needed for supported blockchains should be saved here, for easy lookup
 * ? do I need this?
 */

const BITCOIN = {
  supportedChainIds: [],
  nativeSym: "BTC",
};

const LITECOIN = {
  supportedChainIds: [],
  nativeSym: "LTC",
};

const ETHEREUM = {
  supportedChainIds: [1],
  nativeSym: "ETH",
};

export const supportedBlockchains = Object.keys(SUPPORTED_BLOCKCHAINS)

export const CHAINS = {
  [SUPPORTED_BLOCKCHAINS.ethereum]: ETHEREUM,
  [SUPPORTED_BLOCKCHAINS.bitcoin]: BITCOIN,
  [SUPPORTED_BLOCKCHAINS.litecoin]: LITECOIN
};
