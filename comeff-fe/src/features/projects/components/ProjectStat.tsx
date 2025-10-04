import { Coins, TrendingUp, Users } from 'lucide-react';

interface ProjectStatProps {
    projectStat: any;
}

const ProjectStat = ({projectStat}: ProjectStatProps) => {
    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
                <div className="text-center p-6 bg-card rounded-lg border border-border/50">
                    <div className="flex items-center justify-center mb-2">
                        <TrendingUp className="w-10 h-10 text-accent mr-2" />
                        <span className="text-3xl font-bold text-accent">{projectStat.totalActiveProjects}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Active Projects</p>
                </div>
                <div className="text-center p-6 bg-card rounded-lg border border-border/50">
                    <div className="flex items-center justify-center mb-2">
                        <Coins className="w-10 h-10 text-primary mr-2" />
                        <span className="text-3xl font-bold text-primary">{(projectStat.availableInvestment / 1000000).toFixed(1)} m</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Available Investment</p>
                </div>
                <div className="text-center p-6 bg-card rounded-lg border border-border/50">
                    <div className="flex items-center justify-center mb-2">
                        <Users className="w-10 h-10 text-success mr-2" />
                        <span className="text-3xl font-bold text-success">{projectStat.averageROI.toFixed(1)} %</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Average ROI</p>
                </div>
            </div>
        </div>
    )
}
export default ProjectStat

