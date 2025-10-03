// src/features/admin/hooks/useAdminData.ts
import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api'; // Your centralized axios instance
import type { Project, User, PlatformStats, Transactions, PlatformConfig } from '@/features/admin/types';
import { useAuth } from '@/contexts/AuthProvider';
import { formatUnits } from 'viem';

// This function now lives inside the hook or can be in a utils file.
const calculatePlatformStats = (projects: Project[], users: User[], tx: Transactions[]): PlatformStats => {
  // User stats
  const totalUsers = users.length;
  const kycApproved = users.filter(u => u.sanction_status === 'Verified').length;
  const pendingKyc = users.filter(u => u.sanction_status === 'Pending').length;

  // Project stats
  const totalProjects = projects.length;
  const pendingProjects = projects.filter(p => p.project_status === 'Pending').length;
  // const approvedProjects = projects.filter(p => p.project_status === 'Approved').length;
  // const rejectedProjects = projects.filter(p => p.project_status === 'Rejected').length;
  const fundingProjects = projects.filter(p => p.project_status === 'Funding').length;
  // const SucceededProjects = projects.filter(p => p.project_status === 'Succeeded').length;
  // const FailedProjects = projects.filter(p => p.project_status === 'Failed').length;
  const activeProjects = projects.filter(p => p.project_status === 'Active').length;

  // Financial stats
  const dividendsDistributed = tx.reduce((acc, t) => acc + t.USDC_amount, 0);
  const totalValueLocked = projects.reduce((acc, p) => {
    const contributionInUsdc = parseFloat(formatUnits(BigInt(p.total_contributions), 6));
    return acc + contributionInUsdc;
  }, 0);
  
  return {
    totalUsers,
    kycApproved,
    pendingKyc,
    totalProjects,
    pendingProjects,
    fundingProjects,
    activeProjects,
    dividendsDistributed,
    totalValueLocked
  };
};


export const useAdminData = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [dividends, setDividends] = useState<Transactions[]>([]);
  const [configs, setConfigs] = useState<PlatformConfig[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { token } = useAuth();

  // useEffect(() => {
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      if (!token) { return null; }
      const [projectsRes, usersRes, dividends, configs] = await Promise.all([
        api.get('/projects?status=Pending&status=Approved&status=Rejected&status=Funding&status=Succeeded&status=Failed&status=Active'),
        api.get('/users/onchain'),
        api.get('transactions/dividends'),
        api.get('/admin/configs')
      ]);

      const fetchedProjects = projectsRes.data.data;
      const fetchedUsers = usersRes.data.data;
      const fetchedDividends = dividends.data.data;
      const fetchedConfigs = configs.data.data;

      console.log("Fetched Projects:", fetchedProjects);
      console.log("Fetched Users:", fetchedUsers);
      console.log("Fetched Dividends:", fetchedDividends);
      console.log("Fetched Configs:", fetchedConfigs);

      setProjects(fetchedProjects);
      setUsers(fetchedUsers);
      setDividends(fetchedDividends);
      setConfigs(fetchedConfigs);

      // Calculate stats after fetching
      const calculatedStats = calculatePlatformStats(fetchedProjects, fetchedUsers, fetchedDividends);
      setStats(calculatedStats);
      console.log("Fetch Data");

      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch admin data.');
      console.error("Data fetching error:", err);
    } finally {
      setLoading(false);
    }

    // }, [token]);
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  return { projects, users, dividends, configs, stats, loading, error, refetchData: fetchData };
};