// src/features/admin/hooks/useAdminActions.ts
import { useState } from 'react';
import api from '@/lib/api';

export const useAdminActions = () => {
    const [projectSearch, setProjectSearch] = useState("");
    const [userSearch, setUserSearch] = useState("");

    const reviewProject = async (
        projectId: string,
        status: 'Approved' | 'Rejected',
        onSuccess: () => void
    ) => {
        try {
            const payload = { projectId, status };
            const response = await api.post('/admin/projects/review', payload);
            if (response.status === 200) {
                alert(`Project has been ${status.toLowerCase()}.`);
            }
            onSuccess();
        } catch (error: any) {
            console.error(`Failed to ${status.toLowerCase()} project`, error);
            alert(error.response?.data?.message || 'An unexpected error occurred.');
        }
    };

    const reviewUser = async (
        id: string,
        sanction_status: 'Verified' | 'Rejected',
        onSuccess: () => void
    ) => {
        try {
            const payload = { id, sanction_status };
            const response = await api.post('/admin/verify-user', payload);
            if (response.status === 200) {
                alert(`User has been ${sanction_status.toLowerCase()}.`);
            }
            onSuccess(); 
        } catch (error: any) {
            console.error(`Failed to ${sanction_status.toLowerCase()} user`, error);
            alert(error.response?.data?.message || 'An unexpected error occurred.');
        }
    };

    const exportData = (type: 'projects' | 'users') => {
        console.log(`Exporting ${type} data...`);
        alert(`Exporting ${type} data... (feature coming soon)`);
    };

    return {
        projectSearch,
        setProjectSearch,
        userSearch,
        setUserSearch,
        reviewProject,
        reviewUser,
        exportData
    };
};