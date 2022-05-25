import { supportedBlockchains, SUPPORTED_BLOCKCHAINS } from "../context/provider/networks";
import { PrimaryButton } from "./Button";
import ListItem from "./ListItem";

const Landing = () => {
  return (
    <div>
      <div className="p-4 m-4 border border-white rounded-lg w-1/2">
        <div>
          <ListItem title="Connected Blockchain" info="None" />
          <ListItem title="Connected ChainId" info="None" />
          <ListItem title="Connected Account Address" info="None" />
        </div>
      </div>
      <div className="p-4 m-4">
        <select name="blockchains" className="my-4 mx-2 p-4 py-2 rounded-lg">
          {supportedBlockchains.map((network: string) => <option value={network}>{network}</option>)}
        </select>
        <PrimaryButton label="Connect Account" />
      </div>
    </div>
  );
};

export default Landing;
