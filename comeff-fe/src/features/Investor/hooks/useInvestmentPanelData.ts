import { useState, useCallback, useEffect } from 'react';
import api from '@/lib/api';
import { Project } from '@/features/Investor/types';

interface UseInvestmentManagementPanelDataProps {
    projectId: string;
}

export function useInvestmentManagementPanelData({ projectId }: UseInvestmentManagementPanelDataProps) {
    const [projectDetail, setProjectDetail] = useState<Project | null>(null);
    const [selectedProjectTX, setSelectedProjectTX] = useState<any[]>([]); // Placeholder for transaction data

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProjectDetail = useCallback(async (id: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const [responseProject, responseTx] = await Promise.all([
                api.get(`/projects/id/${id}`), // Assumes an endpoint like /api/projects/:id
                api.get(`/transactions/project/${projectId}`) // Assumes an endpoint like /api/transactions/project/:id
            ]);
            // console.log("Fetched project detail:", responseProject.data.data);
            // console.log("Fetched transactions:", responseTx.data.data);
            setProjectDetail(responseProject.data.data);
            setSelectedProjectTX(responseTx.data.data);
        } catch (err) {
            console.error("Failed to fetch project details:", err);
            setError('Could not load project details.');
        } finally {
            setIsLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        // console.log("projectId changed (useData):", projectId);
        if (projectId) {
            fetchProjectDetail(projectId);
        }
    }, [fetchProjectDetail]);

    return {
        projectDetail,
        isLoading,
        error,
        selectedProjectTX,
        setSelectedProjectTX
    };
}