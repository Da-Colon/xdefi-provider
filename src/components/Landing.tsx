import { useBlockchainProvider } from "../context/provider";
import { PrimaryButton } from "./Button";
import ListItem from "./ListItem";

const Landing = () => {
  const [
    {
      isConnected,
      web3Provider,
      web3Signer,
      web3Account,
      xfiEthereumProvider,
      ethChainId,
      xfiBitcoinProvider,
      bitcoinNetwork,
      bitcoinAccount,
      xfiLiteCoinProvider,
      litecoinNetwork,
      litecoinAccount,
    },
    connectToAccount,
  ] = useBlockchainProvider();
  const personalSignEth = async () => {
    let message = "Hello World";
    const flatSig = await web3Signer!.signMessage(message);
    console.log("🚀 ~ file: Landing.tsx ~ line 11 ~ flatSig", flatSig);
  };

  return (
    <div>
      <div className="p-4 m-4 border border-white rounded-lg w-1/2">
        <div>
          <div>Ethereum Connection</div>
          <ListItem title="Web3 Account Address" info={web3Account || "Not Connected"} />
          <ListItem title="Web3 Chain id" info={ethChainId || "Not Connected"} />

          <div>Bitcoin Connection</div>
          <ListItem title="Bitcoin Account Address" info={bitcoinAccount || "Not Connected"} />
          <ListItem title="Bitcoin connected Network" info={bitcoinNetwork || "Not Connected"} />

          <div>Litecoin Connection</div>
          <ListItem title="Connected Account Address" info={litecoinAccount || "Not Connected"} />
          <ListItem title="Litecoin connected Network" info={litecoinNetwork || "Not Connected"} />
        </div>
      </div>
      <div className="p-4 m-4">
        {!isConnected && <PrimaryButton label="Connect Account" onClick={connectToAccount} />}
        {isConnected && (
          <div>
            <PrimaryButton label="Sign Eth Message" onClick={personalSignEth} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Landing;
