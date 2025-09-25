// src/app/(main)/admin/page.tsx
'use client';
import { PlatformOverview } from "@/features/admin/components/PlatformOverview";
import { AdminTabs } from "@/features/admin/components/AdminTabs";
import { useAdminData } from "@/features/admin/hooks/useAdminData";
import { Loader2 } from "lucide-react";

const AdminPage = () => {
  const {
    stats,
    projects,
    users,
    configs,
    loading,
    error,
    refetchData
  } = useAdminData();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-40 w-40 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center text-destructive">
        Error: {error}
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-emerald-900 mb-2">Admin Dashboard</h1>
          <p className="text-emerald-600">Manage the platform and monitor all activities</p>
        </div>

        <PlatformOverview stats={stats} />
        <AdminTabs projects={projects} users={users} configs={configs} onDataUpdate={refetchData} />
      </main>
    </div>
  );
};

export default AdminPage;