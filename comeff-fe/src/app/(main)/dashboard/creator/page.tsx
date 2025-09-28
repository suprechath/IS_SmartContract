'use client';

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { ProjectSummary } from '@/features/ProjectCreator/components/ProjectSummary';
import { ProjectList } from '@/features/ProjectCreator/components/ProjectList';
import { ProjectManagementPanel } from '@/features/ProjectCreator/components/ProjectManagementPanel';
import { useCreatorData } from '@/features/ProjectCreator/hooks/useCreatorData';
import { useCreatorActions } from '@/features/ProjectCreator/hooks/useCreatorActions';

export default function CreatorDashboardPage() {
    const {
        projects, selectedProject, setSelectedProject, isLoading, error, summaryStats,
    } = useCreatorData();

    const { handleWithdrawFunds, handleDepositReward, handlePostUpdate,} = useCreatorActions();

    if (isLoading) {
        return <DashboardLoadingSkeleton />; // Or a simple "Loading..." message
    }
    if (error) {
        return <div className="text-center py-10 text-destructive">{error}</div>;
    }

    return (
        <div className="min-h-screen bg-background">
            <main className="container mx-auto px-4 py-8">
                <div className="flex items-center gap-4 mb-8 text-primary">
                    <div>
                        <h1 className="text-3xl font-bold">Project Creator Dashboard</h1>
                        <p className="text-primary/80">Manage your projects and track performance</p>
                    </div>
                </div>

                <ProjectSummary {...summaryStats} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[600px]">
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
        </div>
    )
};

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