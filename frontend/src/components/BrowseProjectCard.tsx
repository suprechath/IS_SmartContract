import React from 'react';
import Image from 'next/image';
import { Project } from '@/data/projects';

const BrowseProjectCard: React.FC<Project> = ({
    status,
    title,
    location,
    description,
    raised,
    goal,
    apy,
    imageUrl,
    projectType,
}) => {
    const percentage = Math.round((raised / goal) * 100);

    let statusBadge;
    if (status === 'Funding Open') {
        statusBadge = <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">{status}</div>;
    } else if (status === 'Fully Funded') {
        statusBadge = <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">{status}</div>;
    } else if (status === 'Active') {
        statusBadge = <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">{status}</div>;
    } else {
        statusBadge = <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">{status}</div>;
    }

    return (
        <div className="project-card bg-white rounded-lg shadow-md overflow-hidden transition duration-300">
            <div className="relative">
                <Image src={imageUrl} alt={title} width={600} height={400} className="w-full h-48 object-cover" />
                {statusBadge}
            </div>
            <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">{projectType}</span>
                </div>
                <p className="text-gray-600 mb-4">{description}</p>

                <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{percentage}% funded</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <p className="text-gray-500 text-sm">Location</p>
                        <p className="font-medium">{location}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Expected Return</p>
                        <p className="font-medium text-green-600">{apy}</p>
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-gray-500 text-sm">Goal</p>
                        <p className="font-medium">${(goal / 1000000).toFixed(1)}M</p>
                    </div>
                    <button className={`px-4 py-2 rounded text-white ${status === 'Fully Funded' || status === 'Completed' ? 'bg-gray-300 text-gray-700 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                        disabled={status === 'Fully Funded' || status === 'Completed'}
                    >
                        {status === 'Fully Funded' || status === 'Completed' ? 'View Details' : 'Invest Now'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BrowseProjectCard;
