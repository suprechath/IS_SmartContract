// src/features/admin/hooks/useAdminActions.ts
import { useState } from 'react';
import api from '@/lib/api';

export const useAdminActions = () => {
    const [projectSearch, setProjectSearch] = useState("");
    const [userSearch, setUserSearch] = useState("");

    const reviewProject = async (projectId: string, status: 'Approved' | 'Rejected') => {
        try {
            const response = await api.post('/admin/projects/review', { projectId, status });
            console.log(`Project ${projectId} review status updated to ${status}`, response.data);
            // Here you would typically refetch or update the state
            alert(`Project successfully ${status.toLowerCase()}.`);
        } catch (error: any) {
            console.error(`Failed to ${status.toLowerCase()} project ${projectId}`, error);
            alert(`Error: ${error.response?.data?.message || 'An unexpected error occurred.'}`);
        }
    };
    
    const exportData = (type: 'projects' | 'users') => {
        console.log(`Exporting ${type} data...`);
        // Placeholder for future CSV export functionality
        alert(`Exporting ${type} data...`);
    };

    return {
        projectSearch,
        setProjectSearch,
        userSearch,
        setUserSearch,
        reviewProject,
        exportData
    };
};