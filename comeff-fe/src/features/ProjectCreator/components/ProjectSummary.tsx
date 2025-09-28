// src/features/dashboard/components/ProjectSummary.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Building2, Clock } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/utils";

interface ProjectSummaryProps {
  totalFundsRaised: number;
  projectsInFunding: number;
  activeProjects: number;
}

export const ProjectSummary = ({ totalFundsRaised, projectsInFunding, activeProjects }: ProjectSummaryProps) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    <Card className="grid grid-cols-2">
      <div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-bold whitespace-nowrap text-primary">Total Funds Raised</CardTitle>

        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-2 text-emerald-900">{formatCurrency(totalFundsRaised, 'USD')}</div>
          <p className="text-sm text-muted-foreground whitespace-nowrap">Across all active and succeeded projects</p>
        </CardContent>
      </div>
      <DollarSign className="h-16 w-16 text-green-600 place-items-center justify-self-end mr-5" />
    </Card>

    <Card className="grid grid-cols-2">
      <div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-bold whitespace-nowrap text-primary">Projects in Funding</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-2 text-emerald-900">{projectsInFunding}</div>
          <p className="text-sm text-muted-foreground whitespace-nowrap">Currently accepting investments</p>
        </CardContent>
      </div>
      <Clock className="h-16 w-16 text-blue-600 place-items-center justify-self-end mr-5" />

    </Card>

    <Card className="grid grid-cols-2">
      <div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-bold whitespace-nowrap text-primary">Active Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-2 text-emerald-900">{activeProjects}</div>
          <p className="text-sm text-muted-foreground whitespace-nowrap">Successfully funded and operational</p>
        </CardContent>
      </div>
      <Building2 className="h-16 w-16 text-green-900 place-items-center justify-self-end mr-5" />
    </Card>
  </div>
);