import { useState } from "react";
import uuid from 'react-uuid';

export default function NewAuction({ onCancel, onSave, signer }) {

    const [processing, setProcessing] = useState(false);

    const confirmNewAuction = async (event) => {
        event.preventDefault();
        const newAuction = {
            _id: uuid(),
            title: event.target.jobTitle.value,
            description: event.target.jobDescription.value,
            company: event.target.company.value,
            location: event.target.location.value,
            bountyAmount: parseFloat(event.target.bounty.value),
            salaryRange: event.target.salary.value,
            createdAt: new Date().toISOString(),
            positionsToFill: parseInt(event.target.positionsToFill.value),
            recruiterAddress: await signer.getAddress(),
            isPublished: false,
            isClosed: false,
        };
        setProcessing(true);
        await onSave(newAuction);
        setProcessing(false);
    }

    return (
        <form className="space-y-8 divide-y divide-gray-200" onSubmit={confirmNewAuction}>
            <div className="space-y-8 divide-y divide-gray-200">
                <div className="pt-2">
                    <div>
                        <h3 className="text-lg font-medium leading-6 text-gray-900">New job posting</h3>
                    </div>
                    <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-2">
                            <label htmlFor="first-name" className="block text-sm font-medium text-gray-700">
                                Title *
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    required
                                    name="jobTitle"
                                    id="jobTitle"
                                    placeholder="Ex. Software Engineer ..."
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="last-name" className="block text-sm font-medium text-gray-700">
                                Company *
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    required
                                    name="company"
                                    placeholder="Ex. Aave, Sushi ..."
                                    id="company"
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="last-name" className="block text-sm font-medium text-gray-700">
                                Location *
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    required
                                    name="location"
                                    placeholder="Ex. Remote ..."
                                    id="location"
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="last-name" className="block text-sm font-medium text-gray-700">
                                Salary Range *
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="salary"
                                    required
                                    placeholder="Ex. $100,000 to $150,000 ..."
                                    id="salary"
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="first-name" className="block text-sm font-medium text-gray-700">
                                Bounty <small>(Ether)</small> *
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="bounty"
                                    required
                                    id="bounty"
                                    placeholder="Ex. 10"
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="first-name" className="block text-sm font-medium text-gray-700">
                                Positions to fill *
                            </label>
                            <div className="mt-1">
                                <input
                                    type="number"
                                    name="positionsToFill"
                                    required
                                    id="positionsToFill"
                                    placeholder="Ex. 2 ..."
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-6">
                            <label htmlFor="street-address" className="block text-sm font-medium text-gray-700">
                                Description *
                            </label>
                            <div className="mt-1">
                                <textarea
                                    name="jobDescription"
                                    required
                                    id="jobDescription"
                                    rows={3}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <div className="pt-5">
                <div className="flex justify-end">
                    <button
                        type="button"
                        disabled={processing}
                        onClick={e => onCancel()}
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
            </div>
        </form>
    )
}
