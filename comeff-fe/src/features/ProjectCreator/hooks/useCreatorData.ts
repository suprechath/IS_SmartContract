// src/features/dashboard/hooks/useCreatorData.ts
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAccount } from 'wagmi';
import api from '@/lib/api';
import { Project } from '@/features/ProjectCreator/types';

export const useCreatorData = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProjectTX, setSelectedProjectTX] = useState<any[]>([]); // Placeholder for transaction data

  const { address } = useAccount();

  const fetchCreatorProjects = useCallback(async () => {
    if (!address) {
      setProjects([]);
      setSelectedProject(null);
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
  }, [address]);

  useEffect(() => {
    fetchCreatorProjects();
  }, [fetchCreatorProjects]);

  useEffect(() => {
    const fetchProjectTransactions = async (projectId: number) => {
      try {
        const response = await api.get(`/transactions/project/${projectId}`);
        setSelectedProjectTX(response.data.data);
        console.log("Fetched transactions:", response.data.data);
      } catch (err) {
        console.error("Error fetching project transactions:", err);
      }
    };

    if (selectedProject) {
      fetchProjectTransactions(selectedProject.id);
    } else {
      setSelectedProjectTX([]);
    }
  }, [selectedProject]);

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
    fetchCreatorProjects,
    selectedProjectTX
  };
};