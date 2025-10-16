// src/features/projects/hooks/useProject.ts

import { useState, useEffect, useMemo } from 'react';
import api from '@/lib/api'; // Your centralized axios instance
import { Project } from '../types';

import { usePublicClient } from 'wagmi';
import ProjectManagementABI from '../../../abi/ProjectManagement.sol/ProjectManagement.json';

export const useProjectID = (projectId: string) => {
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const publicClient = usePublicClient();

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
                if (response.data.data.management_contract_address && publicClient) {
                    const address = response.data.data.management_contract_address as `0x${string}`;
                    const deadlineRaw = await publicClient.readContract({
                        address,
                        abi: ProjectManagementABI.abi,
                        functionName: 'deadline',
                    });
                    const deadline =
                        typeof deadlineRaw === 'bigint' ? Number(deadlineRaw) : (deadlineRaw as number);
                    response.data.data.deadline = deadline;
                    console.log("Project with deadline:", response.data.data.deadline);
                }
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