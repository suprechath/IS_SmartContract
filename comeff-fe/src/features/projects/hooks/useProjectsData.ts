import { useState, useEffect, useMemo, use } from 'react';
import { Project } from '../types';
import api from '@/lib/api';

export interface ProjectFilters {
  searchQuery?: string;
  status?: string;
  sortBy?: string;
}

export const useProjects = (filters: ProjectFilters) => {
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // const fetchAllProjects = useMemo(async () => {
  useEffect(() => {
    const fetchAllProjects = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const projectResponse = await api.get('/projects?status=Pending&status=Approved&status=Rejected&status=Funding&status=Succeeded&status=Failed&status=Active');
        // console.log("Fetched projects:", projectResponse.data.data);
        setAllProjects(projectResponse.data.data);
      } catch (err: any) {
        console.error("Data fetching error:", err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }; fetchAllProjects();
  }, []);

  useEffect(() => {
    const applyFilters = () => {
      setIsLoading(true);
      setError(null);
      let filtered = [...allProjects];
      // Apply search filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        // console.log("Search Query:", query);
        filtered = filtered.filter(project =>
          project.title.toLowerCase().includes(query) ||
          project.location.toLowerCase().includes(query) ||
          (project.tags && Array.isArray(project.tags) && project.tags.some(tag => tag.toLowerCase().includes(query)))

          // project.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }
      // Apply status filter
      if (filters.status && filters.status !== 'all') {
        // console.log("Status Filter:", filters.status);
        filtered = filtered.filter(project => project.project_status === filters.status);
      }
      // Apply sorting
      if (filters.sortBy) {
        if (filters.sortBy === 'newest') {
          filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        } else if (filters.sortBy === 'oldest') {
          filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        } else if (filters.sortBy === 'highest_funding') {
          filtered.sort((a, b) => b.funding_usdc_goal - a.funding_usdc_goal);
        } else if (filters.sortBy === 'lowest_funding') {
          filtered.sort((a, b) => a.funding_usdc_goal - b.funding_usdc_goal);
        } else if (filters.sortBy === 'highest_roi') {
          filtered.sort((a, b) => b.projected_roi - a.projected_roi);
        } else if (filters.sortBy === 'lowest_roi') {
          filtered.sort((a, b) => a.projected_roi - b.projected_roi);
        } // Add more sorting options as needed
      } else {
        // Default sorting by newest
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }
      setSelectedProjects(filtered);
      setIsLoading(false);
      console.log("Filtered projects:", selectedProjects);
    };
    applyFilters();
  }, [allProjects, filters]);

  return { allProjects, selectedProjects, isLoading, error };
};