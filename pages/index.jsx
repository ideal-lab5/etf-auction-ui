import Head from "next/head";
import { useEffect, useState } from "react";
import { container } from "tsyringe";
import BidderView from "../components/bidder/bidderView";
import Header from "../components/header";
import AuctioneerView from "../components/auctioneer/auctioneerView";
import { AuctionService } from "../services/AuctionService";

export default function Home() {

  //get the service instance
  const auctionServiceInstance = container.resolve(AuctionService);
  const [isConnected, setIsConnected] = useState(false);
  const [signer, setSigner] = useState(null);
  const [signerAddress, setSignerAddress] = useState("");
  const [isSupportedNetwork, setIsSupportedNetwork] = useState(true);
  const [selectedOption, setSelectedOption] = useState({
    view: "apply",
    option: "search"
  });

  const onChainChanged = (chainId) => {
    // Handle the new chain.
    // Correctly handling chain changes can be complicated.
    // We recommend reloading the page unless you have good reason not to.
    setIsConnected(false);
    window.location.reload();
  }

  const onaAccountsChanged = (chainId) => {
    // Handle the new chain.
    // Correctly handling chain changes can be complicated.
    // We recommend reloading the page unless you have good reason not to.
    setIsConnected(false);
    window.location.reload();
  }

  async function connect() {
    if (typeof window !== "undefined") {
      // Client-side-only code
      const ext = await import("@polkadot/extension-dapp");
      const _ = await ext.web3Enable('etf-auction')
      const allAccounts = await ext.web3Accounts()
      const defaultAddress = allAccounts[0].address;
      // finds an injector for an address
      const injector = await ext.web3FromAddress(defaultAddress);
      setSigner({ signer: injector.signer, address: defaultAddress })
      setSignerAddress(defaultAddress)
      setIsConnected(true)
    }
  }

  useEffect(() => {
    connect();
    return () => {
      //TODO implement disconnection logic
    };

  }, []);

  const onChangeOption = (view, option) => {
    setSelectedOption({ view, option });
  }

  return (
    <>
      <Head>
        <title>EtF Auctions</title>
        <link rel="icon" href="/favicon-32x32.png" />
      </Head>
      <>
        <Header onChangeOption={onChangeOption} onConnect={connect} connectedAddress={signerAddress} isConnected={isConnected} />
        <main className="pt-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* We've used 3xl here, but feel free to try other max-widths based on your needs */}
            {<div className="mx-auto max-w-4xl">
              {selectedOption.view === "apply" ?
                <BidderView onChangeOption={onChangeOption} searchOptionSelected={selectedOption.option === 'search'} signer={signer} auctionServiceInstance={auctionServiceInstance} /> :
                <AuctioneerView signer={signer} auctionServiceInstance={auctionServiceInstance} />}
            </div>}
            {!isSupportedNetwork && <div className="alert alert-danger" role="alert"> Etf Auctions is currently in beta. Only available on .... network!</div>}
            <footer className="bg-white">
              <div className="mt-8 border-t border-gray-200 pt-8 md:flex md:items-center md:justify-between">
                <div className="flex space-x-6 md:order-2">
                  <div className="text-sm text-gray-500">
                    <p className="text-base leading-6 text-indigo-400">
                      XXX Balance: <span className="text-base leading-6 text-gray-500">{`$0`}</span>
                    </p>
                  </div>
                </div>
                <p className="mt-8 text-base text-gray-400 md:order-1 md:mt-0">
                  &copy; 2023 Ideal Labs, Inc. All rights reserved.
                </p>
              </div>
            </footer>
          </div>

        </main>


      </>
    </>
  );
}
