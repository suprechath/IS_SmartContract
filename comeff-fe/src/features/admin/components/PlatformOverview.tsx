// src/features/admin/components/PlatformOverview.tsx
import { Users, Lock, FolderCheck, DollarSign } from "lucide-react";
import { StatCard } from "./StatCard";
import type { PlatformStats } from "../types";
import { formatCurrency, formatNumber } from "@/lib/utils";

interface PlatformOverviewProps {
  stats: PlatformStats | null;
}

export const PlatformOverview = ({ stats }: PlatformOverviewProps) => {
  // console.log("PlatformOverview - stats:", stats);
  if (!stats) {
    // You can return a loading skeleton here for better UX
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-40 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
      <StatCard
        icon={Users}
        title="Total Users"
        value={formatNumber(stats.totalUsers)}
        iconBgColor="bg-blue-100"
        iconColor="text-blue-600"
        footer={
          <div className="flex justify-between">
            <div>
              <p className="text-gray-500 text-xs">KYC Approved</p>
              <p className="text-green-600 font-medium">{formatNumber(stats.kycApproved)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Pending</p>
              <p className="text-yellow-600 font-medium">{formatNumber(stats.pendingKyc)}</p>
            </div>
          </div>
        }
      />
      <StatCard
        icon={Lock}
        title="Total Value Locked"
        value={formatCurrency(stats.totalValueLocked)}
        iconBgColor="bg-green-100"
        iconColor="text-green-600"
        footer={<p className="text-gray-500 text-xs">Across all projects</p>}
      />
      <StatCard
        icon={FolderCheck}
        title="Projects"
        value={formatNumber(stats.totalProjects)}
        iconBgColor="bg-purple-100"
        iconColor="text-purple-600"
        footer={
          <div className="flex justify-between">
            <div>
              <p className="text-gray-500 text-xs">Pending</p>
              <p className="text-green-600 font-medium">{formatNumber(stats.pendingProjects)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Funding</p>
              <p className="text-yellow-600 font-medium">{formatNumber(stats.fundingProjects)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Completed</p>
              <p className="text-blue-600 font-medium">{formatNumber(stats.activeProjects)}</p>
            </div>
          </div>
        }
      />
      <StatCard
        icon={DollarSign}
        title="Dividends Distributed"
        value={formatCurrency(stats.dividendsDistributed)}
        iconBgColor="bg-yellow-100"
        iconColor="text-yellow-600"
        footer={<p className="text-gray-500 text-xs">Platform-wide</p>}
      />
    </div>
  );
};