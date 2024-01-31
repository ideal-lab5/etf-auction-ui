import Head from "next/head";
import { useState } from "react";
import { container } from "tsyringe";
import BidderView from "../components/bidder/bidderView";
import Header from "../components/header";
import AuctioneerView from "../components/auctioneer/auctioneerView";
import { AuctionService } from "../services/AuctionService";
import Modal from "../components/modal"
import { XCircleIcon } from "@heroicons/react/20/solid";

export default function Home() {

  //get the service instance
  const auctionServiceInstance = container.resolve(AuctionService);
  const [isConnected, setIsConnected] = useState(false);
  const [showWalletSelection, setShowWalletSelection] = useState(false)
  const [signer, setSigner] = useState(null);
  const [signerAddress, setSignerAddress] = useState("");
  const [balance, setBalance] = useState(0);
  const [isSupportedNetwork, setIsSupportedNetwork] = useState(true);
  const [availableAccounts, setAvailableAccounts] = useState([]);
  const [selectedOption, setSelectedOption] = useState({
    view: "apply",
    option: "search"
  });

  async function connect() {
    if (typeof window !== "undefined") {
      // Client-side-only code
      const ext = await import("@polkadot/extension-dapp");
      const _ = await ext.web3Enable('etf-auction');
      const allAccounts = await ext.web3Accounts();
      setAvailableAccounts(allAccounts);
    }
  }

  const onChangeOption = (view, option) => {
    setSelectedOption({ view, option });
  }

  // Handler for the click event of the `Connect` button on the NavBar.
  const handleConnect = async () => {
    await connect();
    setShowWalletSelection(true);
  }

  const handleSelectWallet = (address) => async () => {
    const ext = await import("@polkadot/extension-dapp");
    // finds an injector for an address
    const injector = await ext.web3FromAddress(address);
    setSigner({ signer: injector.signer, address });
    setSignerAddress(address);
    setIsConnected(true);
    setShowWalletSelection(false);
    checkBalance();
    setSelectedOption({
      view: "apply",
      option: "search"
    });
  }

  const checkBalance = async () => {
    let b = await auctionServiceInstance.getBalance()
    let bigBalance = BigInt(parseInt(b))
    setBalance(Number(bigBalance) || 0);
  }

  setInterval(checkBalance, 60000);

  return (
    <>
      <Head>
        <title>EtF Auctions</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <>
        <Header
          onChangeOption={onChangeOption}
          onConnect={handleConnect}
          connectedAddress={signerAddress}
          isConnected={isConnected}
          auctionServiceInstance={auctionServiceInstance}
        />
        <Modal
          title="Select a wallet"
          visible={showWalletSelection}
          onClose={() => setShowWalletSelection(false)}
        >
          {availableAccounts.length > 0 ?
            <table className="-mx-4 mt-6 ring-1 ring-gray-300 sm:-mx-6 md:mx-0 md:rounded-lg min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th scope="col" className="py-3.5 px-3 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th scope="col" className="py-3.5 px-3 text-left text-sm font-semibold text-gray-900 lg:table-cell">Address</th>
                  <th scope="col" className="py-3.5 px-3 pr-6" />
                </tr>
              </thead>
              <tbody>
                {availableAccounts.map((account, index) => (
                  <tr key={index}>
                    <td className="py-3.5 px-3 text-left text-sm text-gray-800">
                      {account.meta.name}
                    </td>
                    <td className="py-3.5 px-3 text-left text-sm text-gray-800 lg:table-cell">
                      {account.address}
                    </td>
                    <td className="py-3.5 pl-3 pr-6">
                      <button
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md border border-transparent bg-pink-600 px-4 py-1 text-base font-medium text-white shadow-sm hover:bg-indigo-700"
                        onClick={handleSelectWallet(account.address)}
                      >
                        Connect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table> : <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <XCircleIcon className="h-4 w-4 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-1">
                  <h3 className="text-xs font-medium text-red-800">You need polkadotjs and at least one wallet to use this app.</h3>
                </div>
              </div>
            </div>}
        </Modal>
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
                      Auction Contract (Balance): <span className="text-base leading-6 text-gray-500">{balance}<small> ETF </small></span>
                    </p>
                  </div>
                </div>
                <p className="mt-8 text-base text-gray-400 md:order-1 md:mt-0">
                  &copy; 2024 Ideal Labs, LLC. All rights reserved.
                </p>
              </div>
            </footer>
          </div>
        </main>
      </>
    </>
  );
}
