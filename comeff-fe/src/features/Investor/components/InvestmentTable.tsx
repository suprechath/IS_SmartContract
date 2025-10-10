import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";

import { getStatusBadge } from "@/components/StatusBadge";


import { cn } from "@/lib/utils";
import { ProjectWithBalance } from "../types";
import { useState } from "react";
import { formatUnits } from "viem";

interface InvestorSummaryProps {
    projects: ProjectWithBalance[];
    selectedProject: ProjectWithBalance | null;
    onSelectProject: (project: ProjectWithBalance) => void;
}

export const InvestmentTable = ({ projects, selectedProject, onSelectProject }: InvestorSummaryProps) => {
    const [tokensOwned, setTokensOwned] = useState<number | null>(null);
    const [availableRewards, setAvailableRewards] = useState<number | null>(null);

    return (
        <Card className="h-full overflow-y-auto">
            <CardHeader className="flex items-center justify-between">
                <CardTitle className="text-primary text-lg font-bold">My Investment</CardTitle>
                <CardDescription>Manage your portfolio and claim available rewards</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-muted-foreground font-bold text-center">Project</TableHead>
                            <TableHead className="w-[100px] text-muted-foreground font-bold text-center">Status</TableHead>
                            <TableHead className="w-[200px] text-muted-foreground font-bold text-center">Tokens Owned</TableHead>
                            <TableHead className="w-[100px] text-muted-foreground font-bold text-center">Available Reward</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="text-primary text-center item-center">
                        {projects.length > 0 ? (
                            projects.map((project) => (
                                <TableRow
                                    key={project.onchain_id}
                                    className={cn(
                                        "cursor-pointer hover:bg-muted/50",
                                        selectedProject?.onchain_id === project.onchain_id && "bg-gray-200"
                                    )}
                                    onClick={() => onSelectProject(project)}
                                >
                                    <TableCell className="font-medium text-start">{project.title}</TableCell>
                                    <TableCell>{getStatusBadge(project.project_status.toLowerCase())}</TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            {formatUnits(BigInt(project.tokenBalance),6)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-center gap-2">
                                            {BigInt(project.rewardsAvailable) > 0 ? (
                                                <span className="bg-green-500 text-white px-3 py-1 rounded-full font-bold animate-pulse shadow-lg">
                                                    {formatUnits(BigInt(project.rewardsAvailable), 6)} USDC
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground">
                                                    {formatUnits(BigInt(project.rewardsAvailable), 6)}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-warning">
                                    You haven't contributed any projects yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};