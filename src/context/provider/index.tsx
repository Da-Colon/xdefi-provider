import { createContext, useContext } from "react";
import type { BlockchainProviderContext } from "./types";
import useProvider, { DEFAULT_PROVIDER_CONTEXT } from "./useProvider";

const createBlockchainProvider = (context: React.Context<BlockchainProviderContext>) => {
  const BlockchainRoot = ({ children }: { children: React.ReactNode }) => {
    const blockchainProvider = useProvider();
    return <context.Provider value={blockchainProvider}>{children}</context.Provider>;
  };

  return BlockchainRoot;
};

const blockchainProviderContext = createContext(DEFAULT_PROVIDER_CONTEXT);
const BlockchainProvider = createBlockchainProvider(blockchainProviderContext);
const useBlockchainProvider: () => BlockchainProviderContext = () => useContext(blockchainProviderContext);

export { BlockchainProvider, useBlockchainProvider };
