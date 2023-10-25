import SearchBox from "../searchBox"
import Moment from 'react-moment';
import { useEffect, useState } from "react";
import { XCircleIcon } from "@heroicons/react/20/solid";

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function MyAuctions({ signer, auctionServiceInstance }) {

    const [myAuctions, setMyAuctions] = useState([]);
    const [processing, setProcessing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [currentTab, setCurrentTab] = useState(0);
    const [errors, setErrors] = useState({});

    const queryAuctions = async () => {
        setLoading(true);
        try {
            console.log('Loading auctions...');
            let auctions = await auctionServiceInstance.getMyBids(signer);
            setMyAuctions(auctions);
        } catch (e) {
            console.log(e);
        }
        setLoading(false);
    }

    const onComplete = async (auction) => {
        try {
            setErrors({ ...errors, [auction.id]: false });
            console.log('Completing...');
            setProcessing(true);
            let success = await auctionServiceInstance.completeAuction(signer, auction.id, auction.deadlineSlot);
            setErrors({ ...errors, [auction.id]: !success });
            queryAuctions();
        } catch (e) {
            console.log(e);
        }
        setProcessing(false);
    }

    const onClaim = async (auction) => {
        try {
            setErrors({ ...errors, [auction.id]: false });
            console.log('Claiming...');
            setProcessing(true);
            let success = await auctionServiceInstance.claim(signer, auction.id);
            setErrors({ ...errors, [auction.id]: !success });
            queryAuctions();
        } catch (e) {
            console.log(e);
        }
        setProcessing(false);
    }

    useEffect(() => {
        queryAuctions();
    }, []);

    return (
        <div className="px-4 py-6 sm:px-6 lg:px-8">
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <span className="isolate inline-flex rounded-md shadow-sm">
                        <button
                            type="button"
                            onClick={() => setCurrentTab(0)}
                            className={currentTab !== 0 ? "relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:bg-gray-600 focus:text-white focus:outline-none" :
                                "relative inline-flex items-center rounded-l-md border border-gray-300 px-4 py-2 text-sm font-medium z-10 bg-gray-600 text-white outline-none"}
                        >
                            Published
                        </button>
                        <button
                            type="button"
                            onClick={() => setCurrentTab(1)}
                            className={currentTab !== 1 ? "relative -ml-px inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:bg-gray-600 focus:text-white focus:outline-none" :
                                "relative -ml-px inline-flex items-center border border-gray-300 px-4 py-2 text-sm font-medium z-10 bg-gray-600 text-white outline-none"}
                        >
                            Past
                        </button>
                    </span>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                    <SearchBox />
                </div>
            </div>
            <div className="-mx-4 mt-6 ring-1 ring-gray-300 sm:-mx-6 md:mx-0 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                        <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                Auction
                            </th>
                            <th
                                scope="col"
                                className="hidden px-3 py-3.5 text-right text-sm font-semibold text-gray-900 lg:table-cell"
                            >
                                Bids
                            </th>
                            <th
                                scope="col"
                                className="hidden px-3 py-3.5 text-right text-sm font-semibold text-gray-900 lg:table-cell"
                            >
                                Nft Id
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                                Min Bid
                            </th>
                            <th
                                scope="col"
                                className="hidden px-3 py-3.5 text-center text-sm font-semibold text-gray-900 lg:table-cell"
                            >
                                Published
                            </th>
                            <th
                                scope="col"
                                className="hidden px-3 py-3.5 text-center text-sm font-semibold text-gray-900 lg:table-cell"
                            >
                                Deadline
                            </th>
                            <th
                                scope="col"
                                className="hidden px-3 py-3.5 text-center text-sm font-semibold text-gray-900 lg:table-cell"
                            >
                                Winner
                            </th>
                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading &&
                            <div role="status" className="max-w-sm animate-pulse p-4">
                                <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
                                <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px] mb-2.5"></div>
                                <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
                                <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[330px] mb-2.5"></div>
                                <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[300px] mb-2.5"></div>
                                <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px]"></div>
                                <span className="sr-only">Loading...</span>
                            </div>
                        }
                        {!loading && myAuctions.filter((element) => {
                            if (currentTab === 0) return element.status === 0;
                            if (currentTab === 1) return element.status === 1;
                        }).map((auction, auctionIndex) => {
                            return <tr key={auction.id}>
                                <td
                                    className={classNames(
                                        auctionIndex === 0 ? '' : 'border-t border-transparent',
                                        'relative py-4 pl-4 sm:pl-6 pr-3 text-sm'
                                    )}
                                >
                                    <div className="font-medium text-gray-900">
                                        {auction.title}
                                    </div>
                                    {auctionIndex !== 0 ? <div className="absolute right-0 left-6 -top-px h-px bg-gray-200" /> : null}
                                </td>
                                <td
                                    className={classNames(
                                        auctionIndex === 0 ? '' : 'border-t border-gray-200',
                                        'hidden px-3 py-3.5 text-sm text-right text-gray-500 lg:table-cell'
                                    )}
                                >
                                    {auction.bids}
                                </td>
                                <td
                                    className={classNames(
                                        auctionIndex === 0 ? '' : 'border-t border-gray-200',
                                        'hidden px-3 py-3.5 text-sm text-right text-gray-500 lg:table-cell'
                                    )}
                                >
                                    {auction.assetId}
                                </td>
                                <td
                                    className={classNames(
                                        auctionIndex === 0 ? '' : 'border-t border-gray-200',
                                        'px-3 py-3.5 text-sm text-right text-gray-500'
                                    )}
                                >
                                    {auction.minBid?.toFixed(2)} <small>{auction.minBidUnit}</small>
                                </td>
                                <td
                                    className={classNames(
                                        auctionIndex === 0 ? '' : 'border-t border-gray-200',
                                        'hidden px-3 py-3.5 text-sm text-center text-gray-500 lg:table-cell'
                                    )}
                                >
                                    <Moment date={auction.publishedAt} fromNow={true} />
                                </td>

                                <td
                                    className={classNames(
                                        auctionIndex === 0 ? '' : 'border-t border-gray-200',
                                        'hidden px-3 py-3.5 text-sm text-center text-gray-500 lg:table-cell'
                                    )}
                                >
                                    <Moment date={new Date(auction.deadline)} fromNow={true} />
                                </td>

                                <td
                                    className={classNames(
                                        auctionIndex === 0 ? '' : 'border-t border-transparent',
                                        auction.winner ? 'cursor-copy' : '',
                                        'relative py-3.5 pl-3 pr-4 sm:pr-6 text-left text-sm font-medium'
                                    )}
                                >
                                    <span
                                        onClick={
                                            () => navigator.clipboard.writeText(
                                                auction.winner ? auction.winner : ''
                                            )}
                                    >
                                        { auction.winner ? 
                                            auction.winner.substring(0, 4) + 
                                                '...' + auction.winner.substring(auction.winner.length - 4) : ''
                                        }
                                    </span>
                                </td>

                                <td
                                    className={classNames(
                                        auctionIndex === 0 ? '' : 'border-t border-transparent',
                                        'relative py-3.5 pl-3 pr-4 sm:pr-6 text-left text-sm font-medium'
                                    )}
                                >
                                    {auction.status === 0 && auction.deadlineSlot < auctionServiceInstance.api.getLatestSlot() && <button
                                        type="button"
                                        onClick={() => onComplete(auction)}
                                        className="inline-flex items-center rounded-md border border-gray-300 bg-indigo-600 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-indigo-700 focus:outline-none disabled:cursor-not-allowed disabled:opacity-30"
                                        disabled={!signer || processing}
                                        title={signer ? '' : 'Connect your wallet to bid'}
                                    >
                                        {processing ? "Completing..." : "Complete"} <span className="sr-only"></span>
                                    </button>}
                                    {auction.status === 1 && <button
                                        type="button"
                                        onClick={() => onClaim(auction)}
                                        className="inline-flex items-center rounded-md border border-gray-300 bg-indigo-600 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-indigo-700 focus:outline-none disabled:cursor-not-allowed disabled:opacity-30"
                                        disabled={!signer || processing}
                                        title={signer ? '' : 'Connect your wallet to bid'}
                                    >
                                        {processing ? "Claiming..." : "Claim"} <span className="sr-only"></span>
                                    </button>}
                                    {auction.status === 2 && <span className="inline-flex items-center rounded-md border border-gray-300 bg-gray-600 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm">
                                        Canceled</span>}
                                    {auctionIndex !== 0 ? <div className="absolute right-6 left-0 -top-px h-px bg-gray-200" /> : null}
                                    {errors[auction.id] && <div className="rounded-md bg-red-50 p-4">
                                        <div className="flex">
                                            <div className="flex-shrink-0">
                                                <XCircleIcon className="h-4 w-4 text-red-400" aria-hidden="true" />
                                            </div>
                                            <div className="ml-1">
                                                <h3 className="text-xs font-medium text-red-800">Something went wrong!</h3>
                                            </div>
                                        </div>
                                    </div>}
                                </td>
                            </tr>
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
