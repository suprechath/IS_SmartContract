// src/features/projects/components/ProjectList.tsx
'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api';
import { Project } from '../types';
import { ProjectCard } from './ProjectCard';

export function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await apiClient.get('/projects?status=Funding&status=Active');
        
        // --- FIX IS HERE ---
        // Check if the response data is an array before setting the state.
        // If it's not, default to an empty array.
        const projectsData = response.data.data;
        if (Array.isArray(projectsData)) {
          setProjects(projectsData);
        } else {
          console.warn("API did not return an array of projects. Defaulting to empty array.");
          setProjects([]);
        }
        // --- END FIX ---

      } catch (err) {
        setError('Failed to fetch projects. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (isLoading) return <p className="text-center py-10">Loading projects...</p>;
  if (error) return <p className="text-center py-10 text-red-500">{error}</p>;
  
  if (projects.length === 0) {
    return <p className="text-center py-10 text-gray-500">No active projects found.</p>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}

// // src/features/projects/components/ProjectList.tsx
// 'use client';

// import { useEffect, useState } from 'react';
// import apiClient from '@/lib/api';
// import { Project } from '../types';
// import { ProjectCard } from './ProjectCard';

// export const ProjectList = () => {
//   const [projects, setProjects] = useState<Project[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchProjects = async () => {
//       try {
//         const response = await apiClient.get('/projects?status=Funding&status=Active');
//         setProjects(response.data.data);
//       } catch (err) {
//         setError('Failed to fetch projects. Please try again later.');
//         console.error(err);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchProjects();
//   }, []);

//   if (isLoading) return <p>Loading projects...</p>;
//   if (error) return <p className="text-red-500">{error}</p>;

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//       {projects.map((project) => (
//         <ProjectCard key={project.id} project={project} />
//       ))}
//     </div>
//   );
// }