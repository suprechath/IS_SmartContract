import { formatUnits } from 'viem'
import { formatCurrency } from '@/lib/utils'; // Assumes you have utility functions
import { differenceInDays, differenceInHours, parseISO } from 'date-fns';
import { useState } from 'react';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Project } from "../types";

import { InvestModal } from './InvestModal';

interface InvestmentSidebarProps {
    project: Project;
}

export const InvestmentSidebar = ({ project }: InvestmentSidebarProps) => {
    const fundingPercentage = project.funding_usdc_goal > 0 ? (Number(formatUnits(BigInt(project.total_contributions), 6)) / project.funding_usdc_goal) * 100 : 0;
    const projectCreateAtSeconds = Math.floor(parseISO(project.updated_at).getTime() / 1000);
    const projectEndAtSeconds = projectCreateAtSeconds + Number(project.funding_duration_second);
    const projectEndAtDate = new Date(projectEndAtSeconds * 1000);
    // console.log('Project End At Date:', projectEndAtDate);
    const daysRemaining = differenceInDays(projectEndAtDate, new Date());
    const totalHoursRemaining = differenceInHours(projectEndAtDate, new Date());
    const hoursRemaining = totalHoursRemaining % 24;

    const [isModalOpen, setIsModalOpen] = useState(false); // <-- Add state for modal
    // console.log('Project (Inv sidebar):', project);

    return (
        <>
            <div className="space-y-6 lg:sticky lg:top-24">
                <Card className="shadow-lg border-primary/20">
                    <CardHeader>
                        <CardTitle className="font-heading text-2xl text-primary">Investment Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Funding Progress */}
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Funding Progress</span>
                                <span className="font-medium">{fundingPercentage.toFixed(1)}%</span>
                            </div>
                            <Progress value={fundingPercentage} className="h-3" />
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                    {formatCurrency(Number(formatUnits(BigInt(project.total_contributions), 6)))} raised
                                </span>
                                <span className="text-muted-foreground">
                                    {formatCurrency(project.funding_usdc_goal)} goal
                                </span>
                            </div>
                        </div>

                        {/* Key Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                                <div className="text-lg font-semibold text-accent">{project.projected_roi}%</div>
                                <div className="text-xs text-muted-foreground">Projected ROI</div>
                            </div>
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                                <div className="text-lg font-semibold text-primary">{project.contributor_count}</div>
                                <div className="text-xs text-muted-foreground">Investor</div>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="space-y-3">
                            <Button size="lg" className="w-full hover:scale-105" disabled={project.project_status !== 'Funding'}
                                onClick={() => setIsModalOpen(true)}
                            >
                                Invest Now
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Time Remaining */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center space-y-2">
                            <div className="text-2xl font-bold text-foreground">
                                {project.project_status == 'Funding' ? `${daysRemaining} days ${hoursRemaining} hours` : (project.project_status == 'Active' || project.project_status == 'Succeeded' ? 'Campaign Ended' : 'Campaign not started')}
                            </div>
                            <div className="text-sm text-muted-foreground">Time remaining to invest</div>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <InvestModal
                project={project}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
};