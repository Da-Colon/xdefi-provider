import { createContext, useContext } from 'react';


const createBlockchainProvider = (context: any) => {
  const blockchainRoot = ({ children }: { children: React.ReactNode }) => {

    return (
      <context.Provider value={{}}>
        {children}
      </context.Provider>
    );
  };

  return blockchainRoot;
};

const blockchainProviderContext = createContext(undefined);
const BlockchainProvider = createBlockchainProvider(null);
const useProvider: () => undefined = () => useContext(blockchainProviderContext);

export { BlockchainProvider, useProvider };
