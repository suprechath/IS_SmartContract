// src/app/(main)/dashboard/creator/page.tsx
'use client';

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCreatorData } from '@/features/dashboard/hooks/useCreatorData';
import { useCreatorActions } from '@/features/dashboard/hooks/useCreatorActions';
import { ProjectList } from '@/features/dashboard/components/ProjectList';
import { ProjectSummary } from '@/features/dashboard/components/ProjectSummary';
import { ProjectManagementPanel } from '@/features/dashboard/components/ProjectManagementPanel';
import { Skeleton } from "@/components/ui/skeleton"; // For loading states

export default function CreatorDashboardPage() {
  // 1. Get data and state from the data hook
  const {
    projects,
    selectedProject,
    setSelectedProject,
    isLoading,
    error,
    summaryStats,
  } = useCreatorData();

  // 2. Get actions from the actions hook
  const {
    handleWithdrawFunds,
    handleDepositReward,
    handlePostUpdate,
  } = useCreatorActions();

  // 3. Render UI based on the state
  if (isLoading) {
    return <DashboardLoadingSkeleton />; // Or a simple "Loading..." message
  }

  if (error) {
    return <div className="text-center py-10 text-destructive">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Project Creator Dashboard</h1>
            <p className="text-muted-foreground">Manage your projects and track performance</p>
          </div>
        </div>

        <ProjectSummary {...summaryStats} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ProjectList
            projects={projects}
            selectedProject={selectedProject}
            onSelectProject={setSelectedProject}
          />

          {selectedProject ? (
            <ProjectManagementPanel
              project={selectedProject}
              onWithdrawFunds={handleWithdrawFunds}
              onDepositReward={handleDepositReward}
              onPostUpdate={handlePostUpdate}
            />
          ) : (
             <div className="text-center py-10">Select a project to manage.</div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Optional: A loading skeleton component for better UX
const DashboardLoadingSkeleton = () => (
    <div className="container mx-auto px-4 py-8">
        {/* Simplified skeleton for brevity */}
        <Skeleton className="h-12 w-1/2 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
        </div>
    </div>
);