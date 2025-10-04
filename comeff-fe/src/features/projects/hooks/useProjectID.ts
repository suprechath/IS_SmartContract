// src/features/projects/hooks/useProject.ts

import { useState, useEffect, useMemo } from 'react';
import api from '@/lib/api'; // Your centralized axios instance
import { Project } from '../types';

export const useProjectID = (projectId: string) => {
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
    // const fetchProject = useMemo (async () => {
        if (!projectId) return;
        console.log("Fetching project with ID (useProjectID):", projectId);

        const fetchProject = async () => {
            setLoading(true);
            setError(null);
            try {
                await new Promise(resolve => setTimeout(resolve, 200)); // delay to get token
                const response = await api.get(`/projects/id/${projectId}`);
                // console.log("Fetched project:", response.data.data);
                setProject(response.data.data);
            } catch (err) {
                console.error("Failed to fetch project:", err);
                setError('Failed to load project data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, []);

    return { project, loading, error };
};