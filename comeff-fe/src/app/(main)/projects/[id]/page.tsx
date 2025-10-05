"use client";

import { useParams } from 'next/navigation';
import Link from 'next/link';

import { useProjectID } from '@/features/projects/hooks/useProjectID';
import { InvestmentSidebar } from '@/features/projects/components/InvestmentSidebar';
import { ProjectDetailTabs } from '@/features/projects/components/ProjectDetailTabs';
import { getStatusBadge } from '@/components/StatusBadge';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, MapPin, AlertCircle } from 'lucide-react';


// Loading Skeleton Component
const ProjectDetailSkeleton = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <div className="space-y-4">
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-20 w-full" />
                </div>
                <div>
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-64 w-full mt-6" />
                </div>
            </div>
            <div className="space-y-6">
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        </div>
    </div>
);

// Main Page Component
export default function ProjectDetailsPage() {
    const params = useParams();
    const projectId = params.id as string;
    const { project, loading, error } = useProjectID(projectId);
    // console.log('Project (page):', project);

    // Add validation for projectId
    if (!projectId) {
        return (
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-5 w-5" />
                    <AlertTitle className="ml-2">Error</AlertTitle>
                    <AlertDescription className="ml-2">
                        Invalid project ID.
                    </AlertDescription>
                </Alert>
                <Button variant="outline" className='border-2' asChild>
                    <Link href="/projects">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Projects
                    </Link>
                </Button>
            </div>
        );
    }

    // const { project, loading, error } = useProjectID(projectId);

    // Add debug logging
    // console.log("Project ID:", projectId);
    // console.log("Loading:", loading);
    // console.log("Error:", error);
    // console.log("Project:", project);

    if (loading) {
        return <ProjectDetailSkeleton />;
    }

    if (error || !project) {
        return (
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-5 w-5" />
                    <AlertTitle className="ml-2">Error</AlertTitle>
                    <AlertDescription className="ml-2">
                        {error || 'Project not found.'}
                    </AlertDescription>
                </Alert>
                <Button variant="outline" className='border-2' asChild>
                    <Link href="/projects">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Projects
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
                <Button variant="outline" className='border-2' asChild>
                    <Link href="/projects">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Projects
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Header */}
                    <div className="space-y-4">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <h1 className="font-heading text-3xl font-bold text-primary">{project.title}</h1>
                                <div className="flex items-center text-muted-foreground">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    {project.location}
                                </div>
                            </div>
                            {getStatusBadge(project.project_status.toLocaleLowerCase())}
                        </div>
                    </div>

                    {/* Detailed Information Tabs */}
                    <ProjectDetailTabs project={project} />
                </div>

                {/* Investment Sidebar */}
                <InvestmentSidebar project={project} />
            </div>
        </main>
    );
}