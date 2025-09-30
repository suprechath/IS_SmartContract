// src/features/dashboard/components/ProjectList.tsx

import { Card, CardContent, CardHeader, CardTitle, } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users } from "lucide-react";

import { Project, ProjectStatus } from "@/features/ProjectCreator/types";
import { cn, formatCurrency } from "@/lib/utils";
import { CreateProjectDialog } from "@/features/ProjectCreator/components/CreateProjectDialog";
import { formatUnits } from 'viem';

interface ProjectListProps {
    projects: Project[];
    selectedProject: Project | null;
    onSelectProject: (project: Project) => void;
    setCreateProject: (isOpen: boolean) => void;
    isOpen: boolean;
}

const getStatusBadgeVariant = (
    status: ProjectStatus
): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
        case "Funding":
        case "Active":
            return "default";
        case "Failed":
        case "Rejected":
            return "destructive";
        case "Pending":
            return "outline";
        case "Approved":
        case "Succeeded":
            return "secondary";
    }
};

export const ProjectList = ({ projects, selectedProject, onSelectProject, setCreateProject, isOpen }: ProjectListProps) => {

    return (
        <Card className="h-full overflow-y-auto">
            <CardHeader className="flex items-center justify-between">
                <CardTitle className="text-primary text-lg font-bold">My Projects</CardTitle>
                <CreateProjectDialog isOpen={isOpen} setIsOpen={setCreateProject} onProjectCreated={() => {}} />
                {/* <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Create Project
                </Button> */}
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-muted-foreground font-bold text-center">Project</TableHead>
                            <TableHead className="w-[100px] text-muted-foreground font-bold text-center">Status</TableHead>
                            <TableHead className="w-[200px] text-muted-foreground font-bold text-center">Progress</TableHead>
                            <TableHead className="w-[100px] text-muted-foreground font-bold text-center">Investors</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="text-primary text-center item-center">
                        {projects.length > 0 ? (
                            projects.map((project) => (
                                <TableRow
                                    key={project.id}
                                    className={cn(
                                        "cursor-pointer hover:bg-muted/50",
                                        selectedProject?.id === project.id && "bg-gray-200"
                                    )}
                                    onClick={() => onSelectProject(project)}
                                >
                                    <TableCell className="font-medium text-start">{project.title}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={getStatusBadgeVariant(project.project_status)}
                                            className="w-20 h-6 flex items-center justify-center">
                                            {project.project_status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <Progress
                                                value={
                                                    (Number(formatUnits(project.total_contributions,6)) / project.funding_usdc_goal) * 100
                                                }
                                                className="h-3"
                                            />
                                            <div className="text-xs text-muted-foreground">
                                                {formatCurrency(Number(formatUnits(project.total_contributions,6)))} /{" "}
                                                {formatCurrency(project.funding_usdc_goal)}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-center gap-2">
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                            <span>{project.contributor_count ?? 0}</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-warning">
                                    You haven't created any projects yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};