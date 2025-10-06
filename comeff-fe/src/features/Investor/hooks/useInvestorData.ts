// src/features/dashboard/hooks/useCreatorData.ts
import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import api from '@/lib/api';
import { Transactions } from '@/features/Investor/types';

export const useInvestorData = () => {
    // basic state
    const [allTx, setAllTx] = useState<Transactions[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { address } = useAccount();

    const fetchInvestorProjects = useCallback(async () => {
        if (!address) {
            setAllTx([]);
            setIsLoading(false);
            setError(null);
            return;
        }

        try {
            setIsLoading(true);
            const response = await api.get('/projects/myInvestments');
            setAllTx(response.data.data);
        } catch (err) {
            setError('Failed to fetch your projects.');
            console.error("Error fetching creator projects:", err);
        } finally {
            setIsLoading(false);
        }
    }, [address]);

    useEffect(() => {
        fetchInvestorProjects();
    }, [fetchInvestorProjects]);

    useEffect(() => {
        if (allTx.length > 0)
            console.log("allTx updated:", allTx);
    }, [allTx]);

    return {
        allTx,
        isLoading,
        error,
        fetchInvestorProjects
    };
};