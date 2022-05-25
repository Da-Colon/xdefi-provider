import { createContext, useContext } from "react";
import useProvider from "./useProvider";

const createBlockchainProvider = (context: React.Context<any>) => {
  const BlockchainRoot = ({ children }: { children: React.ReactNode }) => {
    const provider = useProvider();
    return <context.Provider value={provider}>{children}</context.Provider>;
  };

  return BlockchainRoot;
};

const blockchainProviderContext = createContext({});
const BlockchainProvider = createBlockchainProvider(blockchainProviderContext);
const useBlockchainProvider: () => {} = () => useContext(blockchainProviderContext);

export { BlockchainProvider, useBlockchainProvider };
