import React from 'react';
import Image from 'next/image';
import { Project } from '@/data/projects';

const ProjectCard: React.FC<Project> = ({
  status,
  title,
  location,
  description,
  raised,
  goal,
  apy,
  minInvestment,
  term,
  investors,
  daysLeft,
  imageUrl,
}) => {
  const percentage = Math.round((raised / goal) * 100);

  let statusBadge;
  if (status === 'New') {
    statusBadge = <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{status}</span>;
  } else if (status === 'Fully Funded') {
    statusBadge = <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">{status}</span>;
  } else {
    statusBadge = <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">{status}</span>;
  }

  return (
    <div className="project-card bg-white rounded-xl overflow-hidden shadow-sm">
      <div className="relative">
        <Image
          src={imageUrl}
          alt="Project Image"
          width={600}
          height={400}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-medium shadow">
          <i className="fas fa-check-circle text-green-500 mr-1"></i> KYC Verified
        </div>
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          {statusBadge}
        </div>
        <div className="flex items-center text-gray-600 mb-4">
          <i className="fas fa-map-marker-alt mr-2"></i>
          <span>{location}</span>
        </div>
        <p className="text-gray-600 mb-6">{description}</p>

        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>${raised.toLocaleString()} raised</span>
            <span>{percentage}% of ${goal.toLocaleString()}</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${percentage}%` }}></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <div className="text-sm text-gray-500">Estimated APY</div>
            <div className="font-bold text-green-600">{apy}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Min. Investment</div>
            <div className="font-bold">${minInvestment.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Term</div>
            <div className="font-bold">{term}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Investors</div>
            <div className="font-bold">{investors}</div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          {daysLeft !== undefined ? (
            <div className="text-sm text-gray-600">
              <i className="far fa-clock mr-1"></i> {daysLeft} days left
            </div>
          ) : (
            <div className="text-sm text-gray-600">
              <i className="fas fa-check-circle text-green-500 mr-1"></i> Funded
            </div>
          )}
          <button className={`px-4 py-2 text-white rounded-lg transition-colors ${
            status === 'Fully Funded' ? 'bg-gray-200 text-gray-700 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
          disabled={status === 'Fully Funded'}
          >
            {status === 'Fully Funded' ? 'View Details' : 'Invest Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
