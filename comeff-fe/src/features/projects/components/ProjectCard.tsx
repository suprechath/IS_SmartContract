"use client";

import Link from 'next/link';
import { Project } from '../types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface ProjectCardProps {
  project: Project;
}

// A placeholder for status styling
const getStatusVariant = (status: string) => {
  switch (status) {
    case 'active': return 'default';
    case 'successful': return 'success';
    case 'completed': return 'secondary';
    default: return 'outline';
  }
};

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const fundingPercentage = (project.current_funding / project.funding_goal) * 100;

  return (
    <Link href={`/projects/${project.id}`} passHref>
      <Card className="hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
        <CardHeader>
          {/* You can add an Image component here */}
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-bold">{project.title}</CardTitle>
            <Badge variant={getStatusVariant(project.status)}>{project.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
            {project.description}
          </p>
          <div>
            <div className="flex justify-between items-end mb-1">
              <span className="text-sm font-medium text-foreground">
                ${project.current_funding.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground">
                Goal: ${project.funding_goal.toLocaleString()}
              </span>
            </div>
            <Progress value={fundingPercentage} className="w-full" />
          </div>
        </CardContent>
        <CardFooter className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <div className="font-bold">{project.targetROI}%</div>
            <div className="text-xs text-muted-foreground">Target ROI</div>
          </div>
           <div className="text-center">
            {/* Logic to calculate time remaining */}
            <div className="font-bold">15 Days</div>
            <div className="text-xs text-muted-foreground">Remaining</div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};