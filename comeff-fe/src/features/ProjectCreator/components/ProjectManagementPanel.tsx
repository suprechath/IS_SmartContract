// src/features/dashboard/components/ProjectManagementPanel.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { Clock, Link2, TrendingUp, CheckCircle, Loader2, ExternalLink } from "lucide-react";

import { Project, ProjectStatus } from '@/features/ProjectCreator/types';
import { getTXStatusBadge } from '@/components/StatusBadge';
import { formatUnits } from 'viem';



interface ProjectManagementPanelProps {
  project: Project;
  onDeployContracts: (projectId: string) => void;
  isDeploying: boolean;
  estimateDeploymentCost: (projectId: string) => void;
  isEstimating: boolean;
  estimatedCost: string | null;
  onMintTokens: (projectId: string) => void;
  onWithdrawFunds: (projectId: string) => void;
  onDepositReward: (projectId: string, amount: number) => void;
  transactions: any[];
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

export const ProjectManagementPanel = ({
  project, onDeployContracts, isDeploying, estimateDeploymentCost, isEstimating, estimatedCost,
  onMintTokens, onWithdrawFunds, onDepositReward, transactions }: ProjectManagementPanelProps
) => {

  useEffect(() => {
    if (project.project_status === "Approved" && !project.management_contract_address) {
      estimateDeploymentCost(project.id);
    }
  }, [project.project_status]); //project.id, project.project_status

  const [rewardAmount, setRewardAmount] = useState("");

  console.log("Rendering ProjectManagementPanel for project:", project);

  const handleMintTokens = () => {
    onMintTokens(project.id);
  };
  const handleWithdrawFunds = () => {
    onWithdrawFunds(project.id);
  };
  const handleDeposit = () => {
    if (rewardAmount) {
      onDepositReward(project.id, parseFloat(rewardAmount));
      setRewardAmount("");
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
                  {tag.trim().replace(/^{"/, "").replace(/"}$/, "").replace(/"/, "")}
                </Badge>
              ))}
          </CardTitle>
          <a href={`/projects/${project.id}`} className="flex items-center text-primary hover:underline mt-1 text-sm"><Link2 className="h-4 w-4 mr-2" /> Project ID: {project.id}</a>
        </div>
        <Badge
          variant={getStatusBadgeVariant(project.project_status)}
          className="w-26 h-8 flex items-center justify-center text-md">
          {project.project_status}</Badge>
      </CardHeader>
      <CardContent >
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
                          <p className="text-lg font-medium">Estimated Deployment Cost</p>
                          <p className="text-xs text-muted-foreground">Network gas fees for project contract deployment</p>
                        </div>
                        <div className="text-right">
                          {isEstimating && (
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <p className="text-md font-semibold">Estimating...</p>
                            </div>
                          )}
                          {estimatedCost && !isEstimating && (
                            <>
                              <p className="text-lg font-semibold">~{parseFloat(estimatedCost).toFixed(5)}</p>
                              <p className="text-xs text-muted-foreground">Network fees may vary</p>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Deployment Actions */}
                      <div className="space-y-4">

                        <Button size="lg" className="w-full" onClick={() => onDeployContracts(project.id)} disabled={isDeploying || isEstimating}>
                          {isDeploying ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Deploying... Check Wallet
                            </>
                          ) : "Deploy Smart Contracts"}
                        </Button>

                        <p className="text-xs text-center text-muted-foreground">
                          Once deployed, your fundraising campaign will begin automatically
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-6 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                      <h3 className="text-lg font-semibold mb-2">Contracts Deployed!</h3>
                      <p className="text-muted-foreground">
                        Your project contracts are live. The status will update to 'Funding' shortly.
                      </p>
                    </div>
                  )}
                </Card>
              </div>
            )}
            {project.project_status === "Rejected" && (
              <div className="space-y-6">
                <div className="text-center p-6 border rounded-lg bg-red-50 dark:bg-red-950/20">
                  <div className="h-12 w-12 mx-auto mb-4 bg-red-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xl">✕</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Project Not Approved</h3>
                  <p className="text-muted-foreground mb-4">
                    Unfortunately, your project did not meet our approval criteria at this time.
                  </p>
                </div>
              </div>
            )}
            {project.project_status === "Funding" && (
              <div className="space-y-6">
                <div className="text-center p-6 border rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Real-time Funding Tracker</h3>
                  <Progress value={(Number(formatUnits(BigInt(project.total_contributions), 6)) / project.funding_usdc_goal) * 100} className="h-4 mb-2" />
                  <div className="flex justify-between text-sm text-muted-foreground mb-4">
                    <span>${Number(formatUnits(BigInt(project.total_contributions), 6)).toLocaleString()} raised</span>
                    <span>{((Number(formatUnits(BigInt(project.total_contributions), 6)) / project.funding_usdc_goal) * 100).toFixed(2)} %</span>
                  </div>
                  <div className="text-center">
                    {/* <p className="text-2xl font-bold">{project.investors} investors</p> */}
                    <p className="text-sm text-muted-foreground">
                      End{" "}
                      {new Date(
                        new Date(project.updated_at).getTime() + project.funding_duration_second * 1000
                      ).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}
            {project.project_status === "Succeeded" && (
              <div className="space-y-6">
                <div className="text-center p-6 border rounded-lg">
                  <h3 className="text-lg font-semibold mb-2 text-primary">Congratulations!</h3>
                  <p className="text-muted-foreground mb-4">
                    Your project has successfully met its funding goal. <br />You can now mint tokens for your investors.
                  </p>
                  <p className="text-3xl font-bold text-green-600 mb-4">
                    ${Number(formatUnits(BigInt(project.total_contributions), 6)).toLocaleString()}
                  </p>
                  <Button
                    onClick={handleMintTokens}
                    size="lg" className="w-full">
                    Mint Project Tokens
                  </Button>
                </div>
              </div>
            )}
            {project.project_status === "Active" && (
              <div className="space-y-6">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-bold mb-4 text-secondary"> Withdraw Funds</h3>
                  <div className="space-y-4">
                    <Button
                      onClick={handleWithdrawFunds}
                      className="w-full bg-secondary text-white hover:bg-secondary/90">
                      Withdraw Available Funds
                    </Button>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-bold mb-4 text-primary">Deposit Reward</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-primary">USDC Amount</label>
                      <Input
                        type="number"
                        placeholder="Enter reward amount"
                        value={rewardAmount}
                        onChange={(e) => setRewardAmount(e.target.value)}
                      />
                    </div>
                    <Button
                      onClick={handleDeposit} 
                      className="w-full">
                      Deposit Reward
                    </Button>
                  </div>
                </div>
              </div>
            )}
            {project.project_status === "Failed" && (
              <div className="space-y-6">
                <div className="text-center p-6 border rounded-lg bg-red-50 dark:bg-red-950/20">
                  <div className="h-12 w-12 mx-auto mb-4 bg-red-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xl">✕</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Funding Goal Not Met</h3>
                  <p className="text-muted-foreground mb-4">
                    Unfortunately, this project did not reach its funding goal by the deadline.
                  </p>
                  <div className="space-y-4">
                    <div className="p-4 border rounded bg-muted/50">
                      <p className="text-sm">
                        <strong>Final Amount Raised:</strong> ${Number(formatUnits(BigInt(project.total_contributions), 6)).toLocaleString()}
                      </p>
                      <p className="text-sm">
                        <strong>Goal:</strong> ${project.funding_usdc_goal.toLocaleString()}
                      </p>
                      <p className="text-sm">
                        <strong>Investors: </strong>
                        funds will be allowed to withdraw
                      </p>
                    </div>
                  </div>
                </div>
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
                    project ? (Number(formatUnits(BigInt(project.total_contributions), 6)) / project.funding_usdc_goal) * 100 : 0
                  } />
                  <div className="text-lg text-muted-foreground font-semibold mt-2">
                    <span className="font-medium text-primary">
                      ${Number(formatUnits(BigInt(project.total_contributions), 6)).toLocaleString()}
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
                <span className="text-md mt-1 font-semibold">{Number(formatUnits(BigInt(project.token_total_supply), 6)) || 'Not Found'}</span>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='text-center'>Type</TableHead>
                  <TableHead className='text-center'>Amount(USDC)</TableHead>
                  <TableHead className='text-center'>Date</TableHead>
                  <TableHead className='text-center'>Who</TableHead>
                  <TableHead className='text-center'>Hash</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className='text-center'>
                {transactions.map((tx) => (
                  <TableRow key={tx.transaction_hash}>
                    <TableCell className='w-[100px]'>{getTXStatusBadge(tx.transaction_type)}</TableCell>
                    <TableCell className='w-[50px]'>{Number(formatUnits(BigInt(tx.usdc_amount), 6)).toLocaleString()}</TableCell>
                    <TableCell>{new Date(tx.created_at).toLocaleString()}</TableCell>
                    <TableCell>...{tx.wallet_address.substring(tx.wallet_address.length - 4)}</TableCell>
                    <TableCell><a
                      href={`https://sepolia-optimism.etherscan.io/tx/${tx.transaction_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="items-center gap-1 text-blue-500 hover:underline justify-self-center flex"
                    >
                      <ExternalLink size={16} />
                    </a></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};