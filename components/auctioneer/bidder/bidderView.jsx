import Auctions from "./auctions";
import MyAuctions from "./myAuctions";

export default function BidderView({ signer, auctionServiceInstance, searchOptionSelected = true, onChangeOption }) {

    const toggleOption = (e) => {
        e.preventDefault();
        onChangeOption('apply', !searchOptionSelected ? 'search' : 'myBids');
    }

    return (<div className="px-4 py-8 sm:px-0">
        <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
                <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900 pb-3 pl-3"> {searchOptionSelected ? "Search" : "My Bids"}</h1>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                {signer && <a className="whitespace-nowrap text-sm text-indigo-600 hover:text-indigo-700 pr-4" href="#" onClick={toggleOption}> {searchOptionSelected ? "My Bids" : "Search"}</a>}
            </div>
        </div>
        <div className="rounded-lg border-2 border-gray-200" >
            {searchOptionSelected ? <Auctions signer={signer} auctionServiceInstance={auctionServiceInstance} /> : <MyAuctions signer={signer} auctionServiceInstance={auctionServiceInstance} />}
        </div>
    </div>)
}