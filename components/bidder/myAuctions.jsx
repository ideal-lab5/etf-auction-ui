import { useEffect, useState } from 'react';
import Moment from 'react-moment';
import { container } from "tsyringe";

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function MyAuctions({ signer, jobApplicationServiceInstance: auctionServiceInstance }) {
    const [processing, setProcessing] = useState(undefined)
    const [myAuctions, setMyAuctions] = useState([]);

    /* const queryMyApplications = async () => {
         try {
             console.log('Loading applications...');
             const result = await textilHelper.queryMyApplications(await signer.getAddress());
             //TODO call contract method myApplications to get statuses frok blockchain
             console.log('Loading applications...', result);
 
             let newList = result.map(applicant => {
                 return { ...applicant, status: -1, canClaim: false };
             });
 
             setMyApplications(newList);
 
             for (const element of newList) {
                 let status = ApplicationStatus.SCREENING;
                 let canClaim = false;
                 try {
                     status = await jobApplicationServiceInstance.getApplicants(element.applicantAddress, element.publishedId, 0);
                     canClaim = await jobApplicationServiceInstance.canClaimBounty(element.applicantAddress, element.publishedId);
                 } catch (error) {
                     console.log("Not found");
                 }
                 element.status = status;
                 element.canClaim = canClaim;
             }
 
             setMyApplications([...newList]);
 
         } catch (e) {
             console.error(e);
         }
     }
 
     const onClaim = async (application) => {
         try {
             console.log(application);
             setProcessing(application._id);
 
             await jobApplicationServiceInstance.claimBounty(signer, application.publishedId);
 
             queryMyApplications();
         } catch (e) {
             console.error(e);
         }
         setProcessing(undefined);
     }
 
     useEffect(() => {
 
         if (textilHelper && signer) queryMyApplications();
 
     }, []); */

    return (
        <div className="px-4 py-6 sm:px-6 lg:px-8">
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">

                </div>
                <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">

                </div>
            </div>
            {/*  {signer ?
                <div className="-mx-4 mt-6 ring-1 ring-gray-300 sm:-mx-6 md:mx-0 md:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300">
                        <thead>
                            <tr>
                                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                    Position
                                </th>
                                <th
                                    scope="col"
                                    className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell"
                                >
                                    Company
                                </th>
                                <th
                                    scope="col"
                                    className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell"
                                >
                                    Applied
                                </th>
                                <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">
                                    Status
                                </th>
                                <th scope="col" className="relative py-3.5 px-3 pr-4 sm:pr-6 text-center text-sm font-semibold text-gray-900">
                                    Bounty
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {myApplications.map((application, applicationIdx) => (
                                <tr key={`${applicationIdx}_${application._id}`}>
                                    <td
                                        className={classNames(
                                            applicationIdx === 0 ? '' : 'border-t border-transparent',
                                            'relative py-4 pl-4 sm:pl-6 pr-3 text-sm'
                                        )}
                                    >
                                        <div className="font-medium text-gray-900">
                                            {application.title}
                                        </div>
                                        {applicationIdx !== 0 ? <div className="absolute right-0 left-6 -top-px h-px bg-gray-200" /> : null}
                                    </td>
                                    <td
                                        className={classNames(
                                            applicationIdx === 0 ? '' : 'border-t border-gray-200',
                                            'hidden px-3 py-3.5 text-sm text-gray-500 lg:table-cell'
                                        )}
                                    >
                                        {application.company}
                                    </td>
                                    <td
                                        className={classNames(
                                            applicationIdx === 0 ? '' : 'border-t border-gray-200',
                                            'hidden px-3 py-3.5 text-sm text-left text-gray-500 lg:table-cell'
                                        )}
                                    >
                                        <Moment date={application.createdAt} fromNow={true} />
                                    </td>
                                    <td
                                        className={classNames(
                                            applicationIdx === 0 ? '' : 'border-t border-gray-200',
                                            'px-3 py-3.5 text-sm text-center text-gray-500'
                                        )}
                                    >
                                        <span className="inline-flex rounded-full bg-blue-100 px-2 text-xs font-semibold leading-5 text-blue-800">
                                            {ApplicationStatus[application.status]?.toString().replace("_", " ") || "LOADING..."}
                                        </span>

                                    </td>
                                    <td
                                        className={classNames(
                                            applicationIdx === 0 ? '' : 'border-t border-transparent',
                                            'relative py-3.5 pl-3 pr-4 sm:pr-6 text-center text-sm font-medium'
                                        )}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => onClaim(application)}
                                            className="inline-flex items-center rounded-md border border-gray-300 bg-indigo-600 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-indigo-700 focus:outline-none disabled:cursor-not-allowed disabled:opacity-30"
                                            disabled={application.canClaim !== true}
                                        >
                                            {application._id === processing ? "Claiming...." : "Claim"}<span className="sr-only"></span>
                                        </button>
                                        {applicationIdx !== 0 ? <div className="absolute right-6 left-0 -top-px h-px bg-gray-200" /> : null}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div> : <div className="alert alert-danger" role="alert"> You need a connection to use this feature.</div>} */}
        </div>
    )
}
