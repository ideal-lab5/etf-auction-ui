import { XCircleIcon } from "@heroicons/react/20/solid";
import { useState } from "react";

export default function NewAuction({ onCancel, onSave, signer, auctionServiceInstance }) {

    const [processing, setProcessing] = useState(false);
    const [confirmNewAuctionError, setConfirmNewAuctionError] = useState(false);
    const [friendlyErrorMessage, setFriendlyErrorMessage] = useState("");

    const cancelNewAuction = () => {
        setConfirmNewAuctionError(false);
        onCancel();
    }
    const confirmNewAuction = async (event) => {
        event.preventDefault();
        setConfirmNewAuctionError(false);
        setProcessing(true);
        try {
            let result = await auctionServiceInstance.newAuction(
                signer,
                event.target.title.value,
                event.target.assetId.value,
                event.target.deadline.value,
                event.target.salary.value
            );

            if (!result) {
                throw new Error("Uknown error, please try again.");
            }

            await onSave(result);
        } catch (error) {
            if (error.message.includes("1010:")) {
                setFriendlyErrorMessage("You don't have enough balance to create this auction.");
                setConfirmNewAuctionError(error);
            }
            else if (!error.message.includes("Cancelled")) {
                setFriendlyErrorMessage("Uknown error, please try again.");
                setConfirmNewAuctionError(error);
            }
        }
        setProcessing(false);
    }

    return (
        <form className="space-y-8 divide-y divide-gray-200" onSubmit={confirmNewAuction}>
            <div className="space-y-8 divide-y divide-gray-200">
                <div className="pt-2">
                    <div>
                        <h3 className="text-lg font-medium leading-6 text-gray-900">New Auction</h3>
                    </div>
                    <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-3">
                            <label htmlFor="first-name" className="block text-sm font-medium text-gray-700">
                                Name *
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    required
                                    name="title"
                                    id="title"
                                    placeholder="Ex. Little Pony NFT ..."
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="last-name" className="block text-sm font-medium text-gray-700">
                                NFT/Asset Id *
                            </label>
                            <div className="mt-1">
                                <input
                                    type="number"
                                    required
                                    name="assetId"
                                    placeholder="Ex. 100"
                                    id="assetId"
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="last-name" className="block text-sm font-medium text-gray-700">
                                Deadline (Number of minutes from now) *
                            </label>
                            <div className="mt-1">
                                <input
                                    type="number"
                                    required
                                    name="deadline"
                                    placeholder="Ex. 10"
                                    id="deadline"
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="last-name" className="block text-sm font-medium text-gray-700">
                                Min deposit *
                            </label>
                            <div className="mt-1">
                                <input
                                    type="number"
                                    name="salary"
                                    required
                                    placeholder="Ex. 100"
                                    id="salary"
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <div className="pt-5">
                <div className="flex justify-end pb-5">
                    <button
                        type="button"
                        disabled={processing}
                        onClick={e => cancelNewAuction()}
                        className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={processing}
                        className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        {processing ? <span> Saving... </span> : <span> Save </span>}
                    </button>
                </div>
                {confirmNewAuctionError && <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Opps...there is a problem with your transaction</h3>
                            <div className="mt-2 text-sm text-red-700">
                                <ul role="list" className="list-disc space-y-1 pl-5">
                                    <li>{friendlyErrorMessage}</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>}
            </div>
        </form>
    )
}
