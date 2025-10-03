// src/features/admin/components/ProjectVettingTable.tsx
import { useState, useMemo, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Textarea } from "@/components/ui/textarea";
// import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, FileSpreadsheet, Plus, Search, CheckCircle, XCircle, Loader2, Link2 } from "lucide-react";

import { useAdminActions } from "../hooks/useAdminActions";
import { getStatusBadge } from "@/components/StatusBadge";
import type { Project } from "../types";
import api from '@/lib/api';
import { formatUnits } from "viem";

interface ProjectTableProps {
  projects: Project[];
  onDataUpdate: () => void;
}

type ReviewAction = 'Approved' | 'Rejected';

const transformDetailedProjectData = (rawProject: any): Project => {
  let parsedTags: string[] = [];
  if (rawProject.tags) {
    if (Array.isArray(rawProject.tags)) {
      parsedTags = rawProject.tags;
    } else if (typeof rawProject.tags === 'string') {
      try {
        parsedTags = JSON.parse(rawProject.tags);
      } catch (e) {
        console.warn("Could not parse tags as valid JSON, attempting to fix:", rawProject.tags);
        const fixedString = rawProject.tags
          .replace(/^{/, '[')  // Replace leading { with [
          .replace(/}$/, ']'); // Replace trailing } with ]
        try {
          parsedTags = JSON.parse(fixedString);
        } catch (finalError) {
          console.error("Failed to fix and parse tags:", finalError);
          parsedTags = [];
        }
      }
    }
  }
  return {
    ...rawProject,
    // Use the safely parsed tags
    tags: parsedTags,
    funding_usdc_goal: Number(rawProject.funding_usdc_goal),
    total_contributions: Number(rawProject.total_contributions),
    funding_duration_second: Number(rawProject.funding_duration_second),
    platform_fee_percentage: Number(rawProject.platform_fee_percentage),
    reward_fee_percentage: Number(rawProject.reward_fee_percentage),
    token_total_supply: Number(rawProject.token_total_supply),
    projected_payback_period_months: Number(rawProject.projected_payback_period_months),
    projected_roi: Number(rawProject.projected_roi),
  };
};

export const ProjectVettingTable = ({ projects, onDataUpdate }: ProjectTableProps) => {
  const { projectSearch, setProjectSearch, reviewProject, exportData } = useAdminActions();

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [reviewAction, setReviewAction] = useState<ReviewAction>("Rejected");
  const [isReviewOpen, setReviewOpen] = useState(false);
  // const [rejectionReason, setRejectionReason] = useState("");
  const [isDetailsOpen, setDetailsOpen] = useState(false);

  const [detailedProjectData, setDetailedProjectData] = useState<Project | null>(null);
  const [isDetailsLoading, setDetailsLoading] = useState<boolean>(false);

  const filteredProjects = useMemo(() =>
    projects.filter(p =>
      p.title.toLowerCase().includes(projectSearch.toLowerCase()) ||
      p.id.toLowerCase().includes(projectSearch.toLowerCase())
    ), [projects, projectSearch]);

  const handleReviewClick = (project: Project, action: ReviewAction) => {
    setSelectedProject(project);
    setReviewAction(action);
    // setRejectionReason("");
    setReviewOpen(true);
  };

  const handleConfirmReview = async () => {
    if (!selectedProject) return;
    // await reviewProject(selectedProject.id, reviewAction, rejectionReason);
    await reviewProject(selectedProject.id, reviewAction, onDataUpdate);
    setSelectedProject(null);
    // setRejectionReason("");
    setReviewOpen(false);
  };

  // const handleViewDetailsClick = (project: Project) => {
  //   setSelectedProject(project);
  //   setDetailsOpen(true);
  // };

  const handleViewDetailsClick = async (project: Project) => {
    setSelectedProject(project);
    setDetailsOpen(true);
    setDetailsLoading(true);
    setDetailedProjectData(null);
    try {
      const response = await api.get(`/projects/id/${project.id}`);
      console.log("Raw detailed project data:", response.data.data);
      // Use the transformer on the detailed data
      setDetailedProjectData(transformDetailedProjectData(response.data.data));
      console.log("Updated detailedProjectData:", detailedProjectData)
    } catch (error) {
      console.error("Failed to fetch project details:", error);
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="mb-2 text-xl text-emerald-950 texl-bold">Project Management</CardTitle>
              <CardDescription className="text-emerald-950">Manage and monitor all platform projects</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => exportData('projects')}>
                <FileSpreadsheet className="h-4 w-4 mr-2" /> Export
              </Button>
              <Button disabled>
                <Plus className="h-4 w-4 mr-2" /> Create
              </Button>
            </div>
          </div>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects by name or ID"
              value={projectSearch}
              onChange={(e) => setProjectSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table className="text-center">
            <TableHeader>
              <TableRow>
                <TableHead className="text-center w-[200px]">Project Title</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Funding Goal</TableHead>
                <TableHead className="text-center">Creator</TableHead>
                <TableHead className="text-center">Created</TableHead>
                <TableHead className="text-center w-[200px]">Funding Progress</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project) => {
                const fundingPercentage = project.funding_usdc_goal > 0
                  ? (Number(formatUnits(BigInt(project.total_contributions),6)) / project.funding_usdc_goal) * 100
                  : 0;
                return (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium text-start">{project.title}<br /><span className="text-muted-foreground">Project ID: {project.id.slice(0, 4)}...{project.id.slice(-4)}</span></TableCell>
                    <TableCell>{getStatusBadge(project.project_status.toLowerCase())}</TableCell>
                    <TableCell>{project.funding_usdc_goal.toLocaleString()}</TableCell>
                    <TableCell>{project.user_onchain_id.slice(0, 6)}...{project.user_onchain_id.slice(-6)}</TableCell>
                    <TableCell>{new Date(project.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        <Progress value={fundingPercentage} />
                        <div className="text-xs text-muted-foreground">
                          <span className="font-medium text-primary">
                            {formatUnits(BigInt(project.total_contributions),6).toLocaleString()}
                          </span> / {project.funding_usdc_goal.toLocaleString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleViewDetailsClick(project)}><Eye className="h-4 w-4" /></Button>
                        {project.project_status === 'Pending' && (
                          <>
                            <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700" onClick={() => handleReviewClick(project, 'Approved')}>
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700" onClick={() => handleReviewClick(project, 'Rejected')}>
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isReviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="text-emerald-950">
          <DialogHeader>
            <DialogTitle>Confirm Project "{reviewAction}"</DialogTitle>
            <DialogDescription>
              You are about to {reviewAction.toLowerCase()} the project "{selectedProject?.title}". <br />
              This action will be logged.
            </DialogDescription>
          </DialogHeader>
          {/* {reviewAction === 'Rejected' && (
            <div className="grid gap-4 py-4">
              <Label htmlFor="rejection-reason">Reason for Rejection (Required)</Label>
              <Textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Provide a clear reason for the project creator."
              />
            </div>
          )} */}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewOpen(false)}>Cancel</Button>
            <Button
              onClick={handleConfirmReview}
              // disabled={reviewAction === 'Rejected' && !rejectionReason.trim()}
              className={reviewAction === 'Rejected' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
            >
              Confirm {reviewAction}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto text-emerald-950 font-bold">
          <DialogHeader>
            <DialogTitle className="text-xl gap-10 flex items-center sticky top-0">
              {selectedProject?.title}
              {selectedProject?.project_status == "Pending" &&
                <div>
                  <Button variant="ghost" size="icon" className="text-green-600 bg-gray-200 hover:text-green-700 w-28" onClick={() => handleReviewClick(selectedProject, 'Approved')}>
                    <CheckCircle className="h-16 w-16" /> Approve
                  </Button>
                  <Button variant="ghost" size="icon" className="text-red-600 bg-gray-200 hover:text-red-700 w-28 ml-5" onClick={() => handleReviewClick(selectedProject, 'Rejected')}>
                    <XCircle className="h-16 w-16" /> Reject
                  </Button>
                </div>
              }
            </DialogTitle>
            <DialogDescription>
              Project ID: {selectedProject?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-md min-h-[400px]">
            {isDetailsLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-40 w-40 animate-spin text-muted-foreground" />
              </div>
            ) : detailedProjectData ? (
              <div className="space-y-2 text-sm">

                {/* --- OVERVIEW SECTION --- */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-base">Project Overview</h4>
                  <p className="text-muted-foreground">{detailedProjectData.project_overview}</p>
                  <h4 className="font-semibold text-base mt-2">Proposed Solution</h4>
                  <p className="text-muted-foreground">{detailedProjectData.proposed_solution}</p>
                  <hr />
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Status</span>
                    {selectedProject && getStatusBadge(selectedProject.project_status.toLowerCase())}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Owner ID</span>
                    <span className="text-md">{selectedProject?.user_onchain_id}</span>
                  </div>
                  <hr />
                </div>

                {/* --- FINANCIALS & IMPACT --- */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 border rounded-lg">
                    <div className="text-muted-foreground">Projected ROI</div>
                    <div className="text-lg font-bold">{detailedProjectData.projected_roi}%</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="text-muted-foreground">Payback Period</div>
                    <div className="text-lg font-bold">{detailedProjectData.projected_payback_period_months} months</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="text-muted-foreground">CO₂ Reduction</div>
                    <div className="text-lg font-bold">
                      {detailedProjectData.co2_reduction ? `${detailedProjectData.co2_reduction} tons/year` : 'N/A'}
                    </div>
                  </div>
                </div>

                {/* --- DOCUMENTATION SECTION --- */}
                <div className="grid grid-cols-3 gap-4 text ">
                  <div className="p-3 border rounded-lg">
                    <div className="text-muted-foreground">Project Plan Document</div>
                    <a href={detailedProjectData.project_plan_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-primary hover:underline mt-1">
                      <Link2 className="h-4 w-4 mr-2" /> View Project Plan
                    </a>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="text-muted-foreground">Technical Specifications</div>
                    <ul className="list-disc pl-5 mt-1">
                      {detailedProjectData.technical_specifications_urls.map((url, index) => (
                        <li key={index}>
                          <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            Document {index + 1}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="text-muted-foreground">3rd Party Verification</div>
                    <ul className="list-disc pl-5 mt-1">
                      {detailedProjectData.third_party_verification_urls.map((url, index) => (
                        <li key={index}>
                          <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            Verification Report {index + 1}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Onchain & Funding Details */}
                <>
                  <hr />
                  <div>
                    <span className="text-muted-foreground">Funding Progress</span>
                    <div className="mt-2">
                      <Progress value={
                        selectedProject ? (Number(formatUnits(BigInt(selectedProject.total_contributions),6)) / selectedProject.funding_usdc_goal) * 100 : 0
                      } />
                      <div className="text-lg text-muted-foreground mt-2">
                        <span className="font-medium text-primary">
                          ${Number(formatUnits(BigInt(selectedProject?.total_contributions),6)).toLocaleString()}
                        </span> / ${selectedProject?.funding_usdc_goal.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <hr />
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Management Contract</span>
                    <span className="text-md">{selectedProject?.management_contract_address || 'Not Deployed Yet'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Token Contract</span>
                    <span className="text-md">{selectedProject?.token_contract_address || 'Not Deployed Yet'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Token Supply</span>
                    <span className="text-md">{selectedProject?.token_total_supply || 'Not Found'}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Location</span>
                    <span className="font-medium">{selectedProject?.location}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Date Created</span>
                    <span className="font-medium">
                      {selectedProject && new Date(selectedProject.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Tags</span>
                    <span className="font-medium">
                      {Array.isArray(detailedProjectData.tags)
                        ? detailedProjectData.tags.join(", ")
                        : detailedProjectData.tags}
                    </span>
                  </div>
                </>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Could not load project details.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog >
    </>
  );
};