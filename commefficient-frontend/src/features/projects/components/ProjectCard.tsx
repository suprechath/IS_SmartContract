// src/features/projects/components/ProjectCard.tsx
'use client';

import { ethers } from 'ethers';
import { Project } from '../types';
import Link from 'next/link';

interface ProjectCardProps {
    project: Project;
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
    const fundingGoal = parseFloat(ethers.formatUnits(project.funding_usdc_goal, 6));
    const contributions = parseFloat(ethers.formatUnits(project.total_contributions || '0', 6));
    const progress = fundingGoal > 0 ? (contributions / fundingGoal) * 100 : 0;

    return (
        <Link href={`/projects/${project.id}`} className='block border rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300'>
            <img src={project.cover_image_url || '/images/default-project.jpg'} alt={project.title} className="w-full h-48 object-cover rounded-t-lg" />
            <div className="p-4">
                <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                <p className="text-gray-600 mb-4">{project.location}</p>
                <div>
                    <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{progress.toFixed(2)}% Funded</span>
                        <span className="text-sm font-medium text-gray-700">{contributions.toLocaleString()} / {fundingGoal.toLocaleString()} USDC</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            </div>
        </Link>
    );
};