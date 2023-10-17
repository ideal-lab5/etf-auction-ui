import SearchBox from "../searchBox"
import Moment from 'react-moment';
import { useEffect, useState } from "react";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/20/solid";

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function Auctions({ signer, auctionServiceInstance }) {

    const [publishedAuctions, setPublishedAuctions] = useState([]);
    const [processing, setProcessing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [currentTab, setCurrentTab] = useState(0);
    const [bids, setBids] = useState({});
    const [errors, setErrors] = useState({});

    const queryAuctions = async () => {
        setLoading(true);
        try {
            console.log('Loading auctions...');
            let auctions = await auctionServiceInstance.getPublishedAuctions(signer);
            setPublishedAuctions(auctions);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    }

    const onBid = async (auction) => {
        try {
            setErrors({ ...errors, [auction.id]: false });
            setProcessing(true);
            let success = await auctionServiceInstance.bid(signer, auction.id, auction.deadlineSlot, bids[auction.id]);
            setErrors({ ...errors, [auction.id]: !success });
            queryAuctions();
        } catch (e) {
            console.error(e);
        }
        setProcessing(false);
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
            console.error(e);
        }
        setProcessing(false);
    }

    useEffect(() => {
        if (signer !== null) {
            queryAuctions();
        }
    }, [signer]);

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
                        {!loading && publishedAuctions.filter((element) => {
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
                                    <Moment date={auction.deadline} fromNow={true} />
                                </td>

                                <td
                                    className={classNames(
                                        auctionIndex === 0 ? '' : 'border-t border-transparent',
                                        'relative py-3.5 pl-3 pr-4 sm:pr-6 text-left text-sm font-medium'
                                    )}
                                >
                                    {auction.status === 0 && auction.deadlineSlot > auctionServiceInstance.api?.getLatestSlot() ?
                                        <div className="sm:flex sm:items-center">
                                            <div>
                                                <input
                                                    type="number"
                                                    name="bidValue"
                                                    id="bidValue"
                                                    disabled={processing}
                                                    className="block w-24 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-5"
                                                    placeholder="ex. 2"
                                                    onChange={(e) => {
                                                        setBids({ ...bids, [auction.id]: e.target.value });
                                                    }}
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => onBid(auction)}
                                                className="inline-flex items-center rounded-md border border-gray-300 bg-indigo-600 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-indigo-700 focus:outline-none disabled:cursor-not-allowed disabled:opacity-30"
                                                disabled={!signer || processing}
                                                title={signer ? '' : 'Connect your wallet to bid'}
                                            >
                                                {processing ? "Bidding..." : "Bid"} <span className="sr-only"></span>
                                            </button>
                                        </div> : auction.status === 0 && <button
                                            type="button"
                                            onClick={() => onComplete(auction)}
                                            className="inline-flex items-center rounded-md border border-gray-300 bg-indigo-600 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-indigo-700 focus:outline-none disabled:cursor-not-allowed disabled:opacity-30"
                                            disabled={!signer || processing}
                                            title={signer ? '' : 'Connect your wallet to bid'}
                                        >
                                            {processing ? "Completing..." : "Complete"} <span className="sr-only"></span>
                                        </button>}
                                    {auction.status === 1 && <span className="inline-flex items-center rounded-md border border-gray-300 bg-gray-600 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm">
                                        Completed</span>}
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
                                    {auction.winner && <div className="rounded-md bg-green-50 p-4">
                                        <div className="flex">
                                            <div className="flex-shrink-0">
                                                <CheckCircleIcon className="h-4 w-4 text-green-400" aria-hidden="true" />
                                            </div>
                                            <div className="ml-1">
                                                <h3 className="text-xs font-medium text-grenn-800">Winner: {hasWinner}</h3>
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
