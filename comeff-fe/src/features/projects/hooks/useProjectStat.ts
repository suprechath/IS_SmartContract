import { useState, useEffect, useMemo } from 'react';
import { Project } from '../types';
import api from '@/lib/api';

const calculateProjectsStats = (projects: Project[]) => {
    const totalActiveProjects = projects.filter(p => p.project_status === 'Active').length;
    const availableInvestment = projects
        .filter(p => p.project_status === 'Funding' || p.project_status === 'Succeeded' || p.project_status === 'Active')
        .reduce((acc, p) => acc + (Number(p.funding_usdc_goal)), 0);
    const averageROI = (() => {
        const filteredProjects = projects.filter(p => p.project_status === 'Funding' || p.project_status === 'Succeeded' || p.project_status === 'Active');
        return filteredProjects.length > 0 ?
            filteredProjects.reduce((acc, p) => acc + (Number(p.projected_roi) || 0), 0) / filteredProjects.length : 0;
    })();
    return { totalActiveProjects, availableInvestment, averageROI };
}

export const useProjectStat = () => {
    const [projectStats, setProjectsStats] = useState<any>(null);
    const [isLoadingStat, setIsLoading] = useState<boolean>(true);

    const fetchData = useMemo(async () => {
        // useEffect(() => {
        // const fetchData = async () => {
        try {
            setIsLoading(true);
            const projectResponse = await api.get('/projects?status=Pending&status=Approved&status=Rejected&status=Funding&status=Succeeded&status=Failed&status=Active');
            // console.log("Fetched Projects:", projectResponse.data.data);
            const calculatedStats = calculateProjectsStats(projectResponse.data.data);
            setProjectsStats(calculatedStats);
            // console.log("Calculated Project Stats:", projectStats);
        } catch (err: any) {
            console.error("Data fetching error:", err);
        } finally {
            setIsLoading(false);
        }
        // }
        // fetchData();
    }, []);

    return { projectStats, isLoadingStat };
}
