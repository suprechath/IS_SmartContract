'use client';

import { Skeleton } from "@/components/ui/skeleton";

import { useState } from "react";

import { ProjectSummary } from '@/features/ProjectCreator/components/ProjectSummary';
import { ProjectList } from '@/features/ProjectCreator/components/ProjectList';
import { ProjectManagementPanel } from '@/features/ProjectCreator/components/ProjectManagementPanel';
import { useCreatorData } from '@/features/ProjectCreator/hooks/useCreatorData';
import { useCreatorActions } from '@/features/ProjectCreator/hooks/useCreatorActions';
import { CreateProjectDialog } from "@/features/ProjectCreator/components/CreateProjectDialog";



export default function CreatorDashboardPage() {
    const {
        projects, selectedProject, setSelectedProject, isLoading, error, summaryStats, 
        fetchCreatorProjects, selectedProjectTX
    } = useCreatorData();

    const {
        handleWithdrawFunds, handleDepositReward, handlePostUpdate, isDeploying,
        isEstimating, estimatedCost, handleDeployContracts, estimateDeploymentCost, 
        handleMintTokens
    } = useCreatorActions(fetchCreatorProjects);

    const [isCreateProjectOpen, setCreateProjectOpen] = useState(false);

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
                        setCreateProject={setCreateProjectOpen}
                        isOpen={isCreateProjectOpen}
                    />

                    {selectedProject ? (
                        <ProjectManagementPanel
                            project={selectedProject}
                            onDeployContracts={handleDeployContracts}
                            isDeploying={isDeploying}
                            estimateDeploymentCost={estimateDeploymentCost}
                            isEstimating={isEstimating}
                            estimatedCost={estimatedCost}
                            onMintTokens={handleMintTokens}
                            onWithdrawFunds={handleWithdrawFunds}
                            onDepositReward={handleDepositReward}
                            onPostUpdate={handlePostUpdate}
                            transactions={selectedProjectTX}
                        />
                    ) : (
                        <div className="text-center py-10">Select a project to manage.</div>
                    )}
                </div>
                <CreateProjectDialog
                    isOpen={isCreateProjectOpen}
                    setIsOpen={setCreateProjectOpen}
                    onProjectCreated={fetchCreatorProjects}
                />
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