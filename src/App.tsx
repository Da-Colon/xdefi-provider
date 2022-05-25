import "./App.css";
import { BlockchainProvider } from "./context/provider";

function App() {
  return (
    <BlockchainProvider>
      <div className="">
        <div>
          <span>Connected Account</span>
          <span>"0x00000000000000000000000000"</span>
        </div>
      </div>
    </BlockchainProvider>
  );
}

export default App;
