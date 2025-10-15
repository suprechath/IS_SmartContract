'use client';

import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

import { InvestorSummary } from '@/features/Investor/components/InvestorSummary';
import { InvestmentTable } from '@/features/Investor/components/InvestmentTable';
import { useInvestorData } from '@/features/Investor/hooks/useInvestorData';
import { calculateInvestorStats } from '@/features/Investor/services/investorStat';
import { useInvestorTable } from '@/features/Investor/hooks/useInvestorTable';

import { useInvestmentManagementPanelData } from "@/features/Investor/hooks/useInvestmentPanelData";
import { InvestorManagementPanel } from "@/features/Investor/components/InvestorManagementPanel";

import { Project, ProjectWithBalance } from '@/features/Investor/types';

export default function InvestorDashboardPage() {
    // const [selectedProject, setSelectedProject] = useState<ProjectWithBalance | null>(null);

    const {
        allTx, isLoading: isInvestorDataLoading, error: investorDataError, fetchInvestorProjects
    } = useInvestorData();
    const { totalInvested, totalRewardsClaimed, activeInvestments } = calculateInvestorStats(allTx);
    const { 
        projects, isLoading: isTableDataLoading, selectedProject, setSelectedProject } = useInvestorTable(allTx);

    const { 
        projectDetail, isLoading: isPanelLoading, error: panelError, 
        selectedProjectTX,
    } = useInvestmentManagementPanelData({
        projectId: selectedProject?.onchain_id || null,
    });


    if (isInvestorDataLoading || isTableDataLoading || isPanelLoading) {
        return <DashboardLoadingSkeleton />;
    }
    if (investorDataError || panelError) {
        return <div className="text-center py-10 text-destructive">{investorDataError || panelError}</div>;
    }

    return (
        <div className="min-h-screen bg-background">
            <main className="container mx-auto px-4 py-8">
                <div className="flex items-center gap-4 mb-8 text-primary">
                    <div>
                        <h1 className="text-3xl font-bold">Investor Dashboard</h1>
                        <p className="text-primary/80">Your personal portfolio hub for managing investments and rewards</p>
                    </div>
                </div>

                <InvestorSummary {...{ totalInvested, totalRewardsClaimed, activeInvestments }} />


                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[600px]">
                    <InvestmentTable
                        projects={projects}
                        selectedProject={selectedProject}
                        onSelectProject={setSelectedProject}
                    />
                    {selectedProject ? (
                        <InvestorManagementPanel
                            selectedProject={selectedProject as ProjectWithBalance} // Pass the selected project, not the array
                            project={projectDetail as Project}
                            transactions={selectedProjectTX as any[]}
                        />
                    ) : (
                        <Card className="h-full flex items-center justify-center bg-secondary/50">
                            <div className="text-center text-muted-foreground">
                                <p>Select a project from the table to see details and actions.</p>
                            </div>
                        </Card>
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