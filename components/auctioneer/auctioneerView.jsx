import Auctions from "./auctions";

export default function AuctioneerView({ signer, auctionServiceInstance }) {

    return (<div className="px-4 py-8 sm:px-0">
        <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
                <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900 pb-3 pl-3"> My Auctions</h1>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            </div>
        </div>
        <div className="rounded-lg border-2 border-gray-200" >
            <Auctions signer={signer} auctionServiceInstance={auctionServiceInstance} />
        </div>
    </div>)
}