// src/features/dashboard/components/ProjectManagementPanel.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";


import { Clock, Link2, TrendingUp, CheckCircle } from "lucide-react";

import { Project, ProjectStatus } from '@/features/ProjectCreator/types';

interface ProjectManagementPanelProps {
  project: Project;
  onWithdrawFunds: (projectId: string) => void;
  onDepositReward: (projectId: string, amount: number) => void;
  onPostUpdate: (projectId: string, updateText: string) => void;
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

export const ProjectManagementPanel = ({ project, onWithdrawFunds, onDepositReward, onPostUpdate }: ProjectManagementPanelProps) => {
  const [rewardAmount, setRewardAmount] = useState("");
  const [updateText, setUpdateText] = useState("");

  console.log("Rendering ProjectManagementPanel for project:", project);

  const handleDeposit = () => {
    if (rewardAmount) {
      onDepositReward(project.id, parseFloat(rewardAmount));
      setRewardAmount("");
    }
  };

  const handleUpdate = () => {
    if (updateText) {
      onPostUpdate(project.id, updateText);
      setUpdateText("");
    }
  };

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <div>
          <CardTitle className="text-primary text-lg font-bold">{project.title}
            {(Array.isArray(project.tags) ? project.tags : (project.tags || '').split(','))
              .map((tag: string, idx: number) => (
                <Badge key={idx} className="text-xs px-2 py-1 bg-primary/10 text-secondary ml-2">
                  {tag.trim().replace(/^{"/, "").replace(/"}$/, "")}
                </Badge>
              ))}
          </CardTitle>
          <a href="/" className="flex items-center text-primary hover:underline mt-1 text-sm"><Link2 className="h-4 w-4 mr-2" /> Project ID: {project.id}</a>
        </div>
        <Badge
          variant={getStatusBadgeVariant(project.project_status)}
          className="w-26 h-8 flex items-center justify-center text-md">
          {project.project_status}</Badge>
      </CardHeader>
      <CardContent >
        {/* Render different views based on project status */}
        {/* {project.project_status === 'Succeeded' && (
          <Button onClick={() => onWithdrawFunds(project.id)} size="lg" className="w-full">
            Withdraw Funds
          </Button>
        )}
        {project.project_status === 'Active' && (
          <div className="space-y-4">
            <div>
              <Label>USDC Amount</Label>
              <Input
                type="number"
                placeholder="Enter reward amount"
                value={rewardAmount}
                onChange={(e) => setRewardAmount(e.target.value)}
              />
              <Button onClick={handleDeposit} className="w-full mt-2">
                Deposit Reward
              </Button>
            </div>
            <div>
              <Label>Post an Update</Label>
              <Textarea
                placeholder="Share progress with your investors..."
                value={updateText}
                onChange={(e) => setUpdateText(e.target.value)}
              />
              <Button onClick={handleUpdate} variant="outline" className="w-full mt-2">
                Post Update
              </Button>
            </div>
          </div>
        )} */}
        {/* ... other status views ... */}

        <Tabs defaultValue="action" className="h-[600px] overflow-y-auto">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="action">Project Actions</TabsTrigger>
            <TabsTrigger value="details">Project Details</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>
          <TabsContent value="action">
            {project.project_status === "Pending" && (
              <div className="space-y-6">
                <div className="text-center p-6 border rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-yellow-600" />
                  <h3 className="text-lg font-semibold mb-2">Awaiting Admin Review</h3>
                  <p className="text-muted-foreground mb-2">
                    Your project has been submitted and is currently under review by our admin team.
                  </p>
                </div>
              </div>
            )}
            {project.project_status === "Approved" && (
              <div className="space-y-4">
                <div className="text-center p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
                  <TrendingUp className="h-16 w-16 mx-auto mb-2 text-green-600" />
                  <h3 className="text-lg font-semibold mb-2">Project Approved!</h3>
                  <p className="text-muted-foreground">
                    Your project has been approved. <br /> Deploy your smart contract to start fundraising.
                  </p>
                </div>

                {/* Contract Deployment Section */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold">Deploy Smart Contract</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Funding Goal</label>
                      <p className="text-lg font-semibold">{project.funding_usdc_goal.toLocaleString()} USDC</p>
                    </div>
                    <div>
                      <div className="text-muted-foreground font-semibold">Funding duration</div>
                      <div className="font-semibold">
                        {Math.floor(project.funding_duration_second / 86400)} days / {Math.floor((project.funding_duration_second % 86400) / 3600)} hours / {Math.floor((project.funding_duration_second % 3600) / 60)} minutes
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Platform Fee</label>
                      <p className="text-lg font-semibold">{project.platform_fee_percentage / 100}%</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Reward Fee</label>
                      <p className="text-lg font-semibold">{project.reward_fee_percentage / 100}%</p>
                    </div>
                  </div>

                  {!project.management_contract_address ? (
                    <div className="space-y-4">
                      {/* NOTE: Gas estimation would require a more complex setup, this is a placeholder */}
                      <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                        <div>
                          <p className="font-medium">Estimated Deployment Cost</p>
                          <p className="text-sm text-muted-foreground">Gas fees for contract deployment</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold">~0.05 OP</p>
                          <p className="text-xs text-muted-foreground">Network fees may vary</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Shows a confirmation if contracts ARE deployed
                    <div className="text-center p-6 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                      <h3 className="text-lg font-semibold mb-2">Contracts Deployed!</h3>
                      <p className="text-muted-foreground">
                        Your project contracts are live. The status will update to 'Funding' shortly.
                      </p>
                    </div>
                  )}

                  {/* Gas Fee Estimation */}
                  <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg mb-6">
                    <div>
                      <p className="font-medium">Estimated Deployment Cost</p>
                      <p className="text-sm text-muted-foreground">Gas fees for contract deployment</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">~0.05 MATIC</p>
                      <p className="text-xs text-muted-foreground">≈ $0.03 USD</p>
                    </div>
                  </div>

                  {/* Deployment Actions */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 border rounded-lg">
                      <div className="h-2 w-2 rounded-full bg-green-500 mt-2"></div>
                      <div className="flex-1">
                        <p className="font-medium">Wallet Connected</p>
                        <p className="text-sm text-muted-foreground">0x1234...5678</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 border rounded-lg">
                      <div className="h-2 w-2 rounded-full bg-green-500 mt-2"></div>
                      <div className="flex-1">
                        <p className="font-medium">Sufficient Balance</p>
                        <p className="text-sm text-muted-foreground">0.25 MATIC available</p>
                      </div>
                    </div>

                    <Button size="lg" className="w-full" onClick={() => console.log("Deploying contract...")}>
                      Deploy Smart Contract
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      Once deployed, your fundraising campaign will begin automatically
                    </p>
                  </div>
                </Card>
              </div>
            )}
          </TabsContent>
          <TabsContent value="details" className="space-y-4">
            <div className="space-y-2 text-sm">
              <div className="space-y-3">
                <h4 className="font-semibold text-base">Project Overview</h4>
                <p className="text-muted-foreground">{project.project_overview || "This is the project overview."}</p>
                <h4 className="font-semibold text-base mt-2">Proposed Solution</h4>
                <p className="text-muted-foreground">{project.proposed_solution || "This is a proposed solution."}</p>
                <hr />
              </div>
              <div className="grid grid-cols-2 gap-4 text ">
                <div className="p-3 border rounded-lg">
                  <div className="text-muted-foreground font-semibold">Funding duration</div>
                  <div className="mt-1 font-semibold">
                    {Math.floor(project.funding_duration_second / 86400)} days / {Math.floor((project.funding_duration_second % 86400) / 3600)} hours / {Math.floor((project.funding_duration_second % 3600) / 60)} minutes
                  </div>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="text-muted-foreground font-semibold">Funding goal</div>
                  <div className='mt-1 font-semibold'>{project.funding_usdc_goal.toLocaleString()} USDC</div>
                </div>
              </div>
              <hr />
              <div>
                <span className="text-muted-foreground font-semibold">Funding Progress</span>
                <div className="mt-2">
                  <Progress value={
                    project ? (project.total_contributions / project.funding_usdc_goal) * 100 : 0
                  } />
                  <div className="text-lg text-muted-foreground font-semibold mt-2">
                    <span className="font-medium text-primary">
                      ${project?.total_contributions.toLocaleString()}
                    </span> / ${project?.funding_usdc_goal.toLocaleString()}
                  </div>
                </div>
              </div>
              <hr />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-semibold">Management Contract</span>
                <span className="text-md mt-1 font-semibold">{project?.management_contract_address || 'Not Deployed Yet'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-semibold">Token Contract</span>
                <span className="text-md mt-1 font-semibold">{project?.token_contract_address || 'Not Deployed Yet'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-semibold">Receivable USDC Contract Address</span>
                <span className="text-md mt-1 font-semibold">{project?.usdc_contract_address || 'Not Found'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-semibold">Total Token Supply</span>
                <span className="text-md mt-1 font-semibold">{project?.token_total_supply || 'Not Found'}</span>
              </div>
              <hr />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-semibold">Location</span>
                <span className="text-md mt-1 font-semibold">{project?.location}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-semibold">Date Created</span>
                <span className="text-md mt-1 font-semibold">
                  {project && new Date(project.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="transactions">
            {/* ... transaction history ... */}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};