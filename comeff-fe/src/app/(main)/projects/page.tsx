"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import ProjectStat from '@/features/projects/components/ProjectStat';
import { FilterControls } from '@/features/projects/components/FilterControls';

import { useProjectStat } from '@/features/projects/hooks/useProjectStat';
import { useProjects, ProjectFilters } from '@/features/projects/hooks/useProjectsData';

export default function ProjectsPage() {
    const { projectStats, isLoadingStat } = useProjectStat(); //Statistics at the top

    // --- Filter State Management ---
    const [filters, setFilters] = useState<ProjectFilters>({
        searchQuery: '',
        status: 'all',
        sortBy: 'newest',
    });

    // Derived state to check if any filters are active
    const hasActiveFilters = useMemo(() => {
        return filters.searchQuery !== '' || filters.status !== 'all';
    }, [filters]);


    const handleFilterChange = (key: keyof ProjectFilters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearAllFilters = () => {
        setFilters({
            searchQuery: '',
            status: 'all',
            sortBy: 'newest',
        });
    };
    // --- End Filter State Management ---

    const { allProjects, selectedProjects, isLoading, error } = useProjects(filters); // Fetch projects based on filters

    if (isLoadingStat) {
        return <DashboardLoadingSkeleton />;
    }
    return (
        <div>
            {/* Assuming a global Navigation component in the main layout */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Page Header */}
                <div className="text-center space-y-4 mt-12 mb-7">
                    <h1 className="font-heading text-4xl lg:text-5xl font-bold text-primary">
                        Invest in Vetted Energy Efficiency Projects
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                        Each project has been verified to deliver both financial returns and measurable environmental impact.
                    </p>
                    <div className="pt-2">
                        <Button variant="outline" size="lg" className='border-2 border-emerald-800' asChild>
                            <Link href="/register">
                                Have a project? Become a Creator
                            </Link>
                        </Button>
                    </div>
                </div>

                <ProjectStat
                    projectStat={projectStats}
                />

                <div className="my-8">
                    <FilterControls
                        searchQuery={filters.searchQuery!}
                        setSearchQuery={(value) => handleFilterChange('searchQuery', value)}
                        statusFilter={filters.status!}
                        setStatusFilter={(value) => handleFilterChange('status', value)}
                        sortBy={filters.sortBy!}
                        setSortBy={(value) => handleFilterChange('sortBy', value)}
                        onClearFilters={clearAllFilters}
                    />
                </div>

                {/* Results Count */}
                <div className="mb-6">
                    <p className="text-muted-foreground">
                        {isLoading ? 'Loading projects...' : `Showing ${selectedProjects.length} project${selectedProjects.length !== 1 ? 's' : ''}`}
                    </p>
                </div>


            </div>
        </div >
    );
};

const DashboardLoadingSkeleton = () => (
    <div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center space-y-4 mt-12 mb-12">
                <Skeleton className="h-12 w-3/4 mx-auto" />
                <Skeleton className="h-6 w-2/3 mx-auto" />
                <Skeleton className="h-10 w-48 mx-auto mt-4" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
                {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-24 w-full" />
                ))}
            </div>
        </div>
    </div>
);
