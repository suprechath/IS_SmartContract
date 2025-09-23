// src/app/(main)/admin/page.tsx
'use client';
import { PlatformOverview } from "@/features/admin/components/PlatformOverview";
// import { SystemHealth } from "@/features/admin/components/SystemHealth";
// import { QuickActions } from "@/features/admin/components/QuickActions";
// import { AdminTabs } from "@/features/admin/components/AdminTabs";
import { useAdminData } from "@/features/admin/hooks/useAdminData";

const AdminPage = () => {
  const {
    stats,
//     // systemStatus,
//     // projects,
//     // users,
//     // loading,
//     // error
  } = useAdminData();

//   if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
//   if (error) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-emerald-900 mb-2">Admin Dashboard</h1>
          <p className="text-emerald-600">Manage the platform and monitor all activities</p>
        </div>

        <PlatformOverview stats={stats} />
        {/* <SystemHealth systemStatus={systemStatus} />
        <QuickActions />
        <AdminTabs projects={projects} users={users} /> */}
      </main>
    </div>
  );
};

export default AdminPage;