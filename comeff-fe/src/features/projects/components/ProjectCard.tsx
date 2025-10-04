import Link from 'next/link';
import { formatUnits } from 'viem';

import { Project } from '../types';
import { useProvideAuth } from '@/features/auth/hooks/useProvideAuth';

import { MapPin, HeartHandshake } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getStatusBadge } from '@/components/StatusBadge';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const fundingPercentage = (Number(formatUnits(BigInt(project.total_contributions), 6)) / project.funding_usdc_goal) * 100;
  const { token } = useProvideAuth();

  const handleCardClick = (e: React.MouseEvent) => {
    if (!token) {
      e.preventDefault();
      alert("You must be logged in to view project details.");
    }
  };

  return (
    <Link href={token ? `/projects/${project.id}` : '#'} passHref>
      <Card className="hover:shadow-xl hover:scale-110 transition-shadow duration-300 h-full flex flex-col"
        onClick={handleCardClick}
      >
        <div className="relative h-48 overflow-hidden rounded-t-lg bg-muted">
          {project.cover_image_url ? (
            <img
              src={project.cover_image_url}
              alt={project.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <span className="text-muted-foreground font-medium">Project Image</span>
            </div>
          )}
          <div className="absolute top-2 right-2">
            {getStatusBadge(project.project_status.toLocaleLowerCase())}
          </div>
        </div>
        <CardHeader className="space-y-3">
          <div className="space-y-2">
            <CardTitle className="font-heading text-xl leading-tight group-hover:text-primary transition-colors">
              {project.title}
            </CardTitle>
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 mr-1.5" />
              {project.location}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Funding Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Funding Progress</span>
              <span className="font-semibold">{fundingPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={fundingPercentage} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>${Number(formatUnits(BigInt(project.total_contributions), 6))} raised</span>
              <span>${project.funding_usdc_goal} goal</span>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-3 border-border/50">
            <div className="text-center">
              <div className="text-lg font-bold text-accent">{project.projected_roi}%</div>
              <div className="text-xs text-muted-foreground">Projected ROI</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-primary">{project.projected_payback_period_months}</div>
              <div className="text-xs text-muted-foreground">Payback (months)</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center text-lg font-bold text-foreground">
                <HeartHandshake className="w-4 h-4 mr-1" />
                <span className="text-sm">{project.co2_reduction}</span>
              </div>
              <div className="text-xs text-muted-foreground">Emission Reduction</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};