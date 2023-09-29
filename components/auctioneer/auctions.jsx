import { useEffect, useState } from 'react';
import Moment from 'react-moment';
import NewAuction from './newAuction';
import { container } from "tsyringe";

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function Auctions({ signer, auctionServiceInstance }) {

    const [newAuction, setNewAuction] = useState(false);
    const [auctions, setAuctions] = useState([]);
    const [currentTab, setCurrentTab] = useState(0);
    const [processing, setProcessing] = useState(false);

    const onSave = async (auction) => {
        console.log('New auction saved!', auction);
        queryAuctions();
        setNewAuction(false);
    }

    const onComplete = async (auction) => {
        try {
            setProcessing(true);
            await auctionServiceInstance.completeAuction(signer, auction.id);
            queryAuctions();
        } catch (e) {
            console.error(e);
        }
        setProcessing(false);
    }

    const onCancel = async (auction) => {
        try {
            setProcessing(true);
            await auctionServiceInstance.cancelAuction(signer, auction.id);
            queryAuctions();
            setCurrentTab(2);
        } catch (e) {
            console.error(e);
        }
        setProcessing(false);
    }

    const queryAuctions = async () => {
        try {
            console.log('Loading auctions...');
            let auctions = await auctionServiceInstance.getMyAuctions(signer);
            setAuctions(auctions);
        } catch (e) {
            console.error(e);
        }

    }

    useEffect(() => {

        queryAuctions();

    }, []);

    return (
        <div className="px-4 py-6 sm:px-6 lg:px-8">
            {signer ? <>
                {!newAuction && <>
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
                        <div className="mt-4 mr-2 sm:mt-0 sm:ml-16 sm:flex-none">
                            <button
                                type="button"
                                onClick={() => setNewAuction(true)}
                                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                New
                            </button>
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
                                        Units
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
                                {auctions.filter((element) => {
                                    if (currentTab === 0) return element.status === 1;
                                    if (currentTab === 1) return element.status === 2 || element.status === 3;
                                }).map((auction, auctionIndex) => (
                                    <tr key={auction.id}>
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
                                            {auction.units}
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
                                            {auction.deadline}
                                        </td>

                                        <td
                                            className={classNames(
                                                auctionIndex === 0 ? '' : 'border-t border-transparent',
                                                'relative py-3.5 pl-3 pr-4 sm:pr-6 text-center text-sm font-medium'
                                            )}
                                        >
                                            {auction.status === 1 && auction.deadline < new Date() ? <button
                                                type="button"
                                                onClick={() => onCancel(auction)}
                                                className="inline-flex items-center rounded-md border border-gray-300 bg-indigo-600 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-indigo-700 focus:outline-none disabled:cursor-not-allowed disabled:opacity-30"
                                                disabled={!signer || processing}
                                                title={signer ? '' : 'Connect your wallet to cancel your auction'}
                                            >
                                                {processing ? "Canceling..." : "Cancel"} <span className="sr-only"></span>
                                            </button> : auction.status === 1 && <button
                                                type="button"
                                                onClick={() => onComplete(auction)}
                                                className="inline-flex items-center rounded-md border border-gray-300 bg-indigo-600 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-indigo-700 focus:outline-none disabled:cursor-not-allowed disabled:opacity-30"
                                                disabled={!signer || processing}
                                                title={signer ? '' : 'Connect your wallet to bid'}
                                            >
                                                {processing ? "Completing..." : "Complete"} <span className="sr-only"></span>
                                            </button>}
                                            {auction.status === 2 && <span className="inline-flex items-center rounded-md border border-gray-300 bg-gray-600 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm">
                                                Completed</span>}
                                            {auction.status === 3 && <span className="inline-flex items-center rounded-md border border-gray-300 bg-gray-600 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm">
                                                Canceled</span>}
                                            {auctionIndex !== 0 ? <div className="absolute right-6 left-0 -top-px h-px bg-gray-200" /> : null}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div> </>}
                {newAuction && <NewAuction signer={signer} onCancel={() => setNewAuction(false)} onSave={onSave} auctionServiceInstance={auctionServiceInstance} />}
            </> : <div className="alert alert-danger" role="alert"> You need a connection to use this feature.</div>}
        </div>
    )
}
