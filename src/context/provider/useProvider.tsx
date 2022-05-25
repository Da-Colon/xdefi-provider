import { ethers } from "ethers";
import { useEffect, useState } from "react";

const useProvider = () => {
  // provider type should depending on wallet connection
  // ? handle multiple wallet on multiple chains connected same site?
  const [provider, setProvider] = useState();
  const [selectedBlockchain, setSelectedBlockchain] = useState<string>()

  useEffect(() => {
    // detect xdefi wallet
    // ? should xdefi wallet take priority over a metamask connected wallet?
    if ("xfi" in window) {
      const xfi = (window as any)["xfi"]
      if(xfi.ethereum) {
        console.log("ETH", xfi.ethereum)
        const provider = new ethers.providers.Web3Provider(xfi.ethereum)
      }
    }
  })

  /**
   * [connection, selectBlockchain, connect, disconnect]
   * @exports connection selected blockchain connection info
   * @exports connect    
   * 
   */
  return [{}, ];
}

export default useProvider;