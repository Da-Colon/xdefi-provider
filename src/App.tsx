import Landing from "./components/Landing";
import { BlockchainProvider } from "./context/provider";

function App() {
  return (
    <BlockchainProvider>
      <Landing />
    </BlockchainProvider>
  );
}

export default App;
