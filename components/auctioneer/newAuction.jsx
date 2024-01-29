import { XCircleIcon } from "@heroicons/react/20/solid";
import { useEffect, useState } from "react";

export default function NewAuction({ onCancel, onSave, signer, auctionServiceInstance }) {

    const [processing, setProcessing] = useState(false);
    const [confirmNewAuctionError, setConfirmNewAuctionError] = useState(false);
    const [friendlyErrorMessage, setFriendlyErrorMessage] = useState("");

    const [inputValidationErrors, setInputValidationErrors] = useState({});

    const [latestBlockNumber, setLatestBlockNumber] = useState(0);

    useEffect(() => {
        auctionServiceInstance.api.eventEmitter.on('blockHeader', () => {
            setLatestBlockNumber(auctionServiceInstance.api.latestBlockNumber);
        });
    }, []);

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
                event.target.deadline.value,
                event.target.deposit.value
            );

            if (!result) {
                throw new Error("Uknown error, please try again.");
            }

            await onSave(result);
        } catch (error) {
            if (error.message.includes("1010:")) {
                setFriendlyErrorMessage("You don't have enough balance to create this auction.");
                setConfirmNewAuctionError(error);
            } else if (error.message.includes("invalid block number")) {
                setFriendlyErrorMessage("invalid block number");
                setConfirmNewAuctionError(error);
            } else if (!error.message.includes("Cancelled")) {
                setFriendlyErrorMessage("Uknown error, please try again.");
                setConfirmNewAuctionError(error);
            }
        }
        setProcessing(false);
    }

    const handleNameLengthCheck = (event) => {
        const value = event.target.value;

        // Check if the length in bytes is within the limit (48 bytes in this case)
        if (value.length > 48) {
            let msg = `Name is too long (max 48 characters) ${48 - value.length}`;
            setInputValidationErrors(errors => ({ ...errors, nameLength: msg }));
        } else {
            setInputValidationErrors(errors => {
                const { nameLength, ...rest } = errors;
                return rest;
            });
        }
    }

    const handleBlockNumberCheck = (event) => {
        const value = event.target.value;

        // Check if the block number is in the future
        if (value <= latestBlockNumber) {
            setInputValidationErrors(errors => ({ ...errors, blockNumber: 'The target block number must be in the future.' }));
        } else {
            setInputValidationErrors(errors => {
                const { blockNumber, ...rest } = errors;
                return rest;
            });
        }
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
                                Name (max 48 characters)
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    required
                                    name="title"
                                    id="title"
                                    placeholder="Ex. Little Pony NFT ..."
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    onChange={handleNameLengthCheck}
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="last-name" className="block text-sm font-medium text-gray-700">
                                Deadline (Block number)
                            </label>
                            <div className="mt-1">
                                <input
                                    type="number"
                                    required
                                    name="deadline"
                                    placeholder="Ex. 10"
                                    id="deadline"
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    onChange={handleBlockNumberCheck}
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
                                    name="deposit"
                                    required
                                    placeholder="Ex. 100"
                                    id="deposit"
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
                {Object.keys(inputValidationErrors).length > 0 && (
                    <div className="rounded-md bg-red-50 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Validation Errors</h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <ul role="list" className="list-disc space-y-1 pl-5">
                                        {Object.values(inputValidationErrors).map((error, index) => (
                                            <li key={index}>{error}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {confirmNewAuctionError && <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Oops! An error occurred while processing your transaction</h3>
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
