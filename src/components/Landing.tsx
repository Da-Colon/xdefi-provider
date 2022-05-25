import { useBlockchainProvider } from "../context/provider";
import { supportedBlockchains } from "../context/provider/networks";
import { PrimaryButton } from "./Button";
import ListItem from "./ListItem";

const Landing = () => {
  const [{ provider, selectedBlockchain, account, network, chainId }, selectBlockchain, connectToAccount] = useBlockchainProvider();
  return (
    <div>
      <div className="p-4 m-4 border border-white rounded-lg w-1/2">
        <div>
          <ListItem title="Connected Blockchain" info={network || "Not Connected"} />
          <ListItem title="Connected ChainId" info={chainId || "Not Connected"}  />
          <ListItem title="Connected Account Address" info={account || "Not Connected"}  />
        </div>
      </div>
      <div className="p-4 m-4">
        <select name="blockchains" className="my-4 mx-2 p-4 py-2 rounded-lg" value={selectedBlockchain} onChange={(e) => selectBlockchain(e.target.value)}>
          {supportedBlockchains.map((network: string) => (
            <option value={network} key={network}>
              {network}
            </option>
          ))}
        </select>
        { !account &&
          <PrimaryButton label="Connect Account" isLoading={!provider} onClick={connectToAccount} />
        }
      </div>
    </div>
  );
};

export default Landing;
