// src/features/admin/hooks/useAdminData.ts
import { useState, useEffect } from 'react';
import api from '@/lib/api'; // Your centralized axios instance
import type { Project, User, PlatformStats, Transactions } from '@/features/admin/types';

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
  const totalValueLocked = projects.reduce((acc, p) => acc + p.total_contributions, 0);


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
  const [stats, setStats] = useState<PlatformStats | null>(null);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [projectsRes, usersRes, dividends] = await Promise.all([
          api.get('/projects?status=Pending&status=Approved&status=Rejected&status=Funding&status=Succeeded&status=Failed&status=Active'), 
          api.get('/users/onchain'),
          api.get('transactions/dividends')
        ]);

        const fetchedProjects = projectsRes.data.data;
        const fetchedUsers = usersRes.data.data;
        const fetchedDividends = dividends.data.data;

        // console.log("Fetched Projects:", fetchedProjects);
        // console.log("Fetched Users:", fetchedUsers);
        // console.log("Fetched Dividends:", fetchedDividends);

        setProjects(fetchedProjects);
        setUsers(fetchedUsers);
        setDividends(fetchedDividends);
        
        // Calculate stats after fetching
        const calculatedStats = calculatePlatformStats(fetchedProjects, fetchedUsers, fetchedDividends);
        setStats(calculatedStats);
        
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch admin data.');
        console.error("Data fetching error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { projects, users, dividends, stats, loading, error };
};