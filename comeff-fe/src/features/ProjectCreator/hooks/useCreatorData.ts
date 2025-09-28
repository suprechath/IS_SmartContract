// src/features/dashboard/hooks/useCreatorData.ts
import { useState, useEffect, useMemo } from 'react';
import { useAccount } from 'wagmi';
import api from '@/lib/api';
import { Project } from '@/features/ProjectCreator/types';

export const useCreatorData = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { address } = useAccount();

  useEffect(() => {
    const fetchCreatorProjects = async () => {
      if (!address) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await api.get('/projects/my');
        const fetchedProjects: Project[] = response.data.data;
        setProjects(fetchedProjects);

        if (fetchedProjects.length > 0) {
          setSelectedProject(fetchedProjects[0]);
        }
      } catch (err) {
        setError('Failed to fetch your projects.');
        console.error("Error fetching creator projects:", err);
      } finally {
        setIsLoading(false);
      }
    };


    fetchCreatorProjects();
  }, [address]);

  // Use useMemo to prevent recalculating on every render
  const summaryStats = useMemo(() => {
    const totalFundsRaised = projects
      .filter(p => ['Funding', 'Succeeded', 'Active'].includes(p.project_status))
      .reduce((sum, p) => sum + (Number(p.total_contributions) || 0), 0);
    const projectsInFunding = projects.filter(p => p.project_status === 'Funding').length;
    const activeProjects = projects.filter(p => p.project_status === 'Active').length;
    return { totalFundsRaised, projectsInFunding, activeProjects };
  }, [projects]);

  return {
    projects,
    selectedProject,
    setSelectedProject,
    isLoading,
    error,
    summaryStats,
  };
};