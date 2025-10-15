import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Link2, ExternalLink, Coins } from "lucide-react";

import { ProjectWithBalance, Project, ProjectStatus } from "@/features/Investor/types";
import { getTXStatusBadge } from "@/components/StatusBadge";
import { InvestModal } from "@/features/projects/components/InvestModal";
import { useInvestorActions } from '../hooks/useInvestorActions';
import { calculateMyRefund } from '../services/investorStat';


import { formatUnits } from "viem";
import { useAccount } from 'wagmi';
import { useState } from "react";
import { tr } from "date-fns/locale";


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

interface InvestorManagementPanelProps {
    selectedProject: ProjectWithBalance;
    project: Project;
    transactions: any[];
    // onClaimRewards: (managementContractAddress: string) => void;
    // isClaiming: boolean;
    // onClearSelection: () => void;
}

export const InvestorManagementPanel = ({ selectedProject, project, transactions }: InvestorManagementPanelProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false); // <-- Add state for modal

    const { claimRewards, refundInvestment, isClaiming } = useInvestorActions();

    if (!selectedProject || !project || !transactions) {
        return null; // Or a fallback UI
    }

    const { address } = useAccount();
    const canClaim = Number(selectedProject.rewardsAvailable) > 0;
    // console.log(transactions);

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
                    <a href={`/projects/${project.onchain_id}`} className="flex items-center text-primary hover:underline mt-1 text-sm"><Link2 className="h-4 w-4 mr-2" /> Project ID: {project.onchain_id}</a>
                </div>
                <Badge
                    variant={getStatusBadgeVariant(project.project_status)}
                    className="w-26 h-8 flex items-center justify-center text-md">
                    {project.project_status}</Badge>
            </CardHeader>
            <CardContent >
                <Tabs defaultValue="action" className="h-[600px] overflow-y-auto">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="action">Investor Actions</TabsTrigger>
                        <TabsTrigger value="details">Project Details</TabsTrigger>
                        <TabsTrigger value="transactions">Transactions</TabsTrigger>
                    </TabsList>
                    <TabsContent value="action">
                        {project.project_status === "Funding" && (
                            <div className="space-y-6">
                                <div className="text-center p-6 border rounded-lg">
                                    <h3 className="text-lg font-semibold mb-2 text-primary">Real-time Funding Tracker</h3>
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
                                    <Button
                                        onClick={() => setIsModalOpen(true)}
                                        size="lg" className="w-full mt-5 hover:scale-105">
                                        More Invest...
                                    </Button>
                                </div>
                                <InvestModal
                                    project={project}
                                    isOpen={isModalOpen}
                                    onClose={() => setIsModalOpen(false)}
                                />
                            </div>
                        )}
                        {project.project_status === "Succeeded" && (
                            <div className="space-y-6">
                                <div className="text-center p-6 border rounded-lg bg-green-50 border-green-800 border-2">
                                    <h3 className="text-lg font-semibold mb-2 text-primary">Congratulations!</h3>
                                    <p className="text-muted-foreground mb-4">
                                        This project has successfully reached its funding goal. <br /> Please stay tuned for updates on token distribution.
                                    </p>
                                </div>
                            </div>
                        )}
                        {project.project_status === "Active" && (
                            <div className="space-y-6">
                                <div className="p-4 border rounded-lg bg-primary/10 border-border border-2">
                                    <h1 className="font-bold mb-4 text-primary text-center text-xl"> Claim reward</h1>
                                    <div className="flex justify-between items-center mt-4">
                                        <span className="text-muted-foreground">My Project Tokens</span>
                                        <span className="font-mono text-lg font-semibold">{Number(formatUnits(BigInt(selectedProject.tokenBalance), 6)).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center mt-4">
                                        <span className="text-muted-foreground">Available Rewards (USDC)</span>
                                        <span className="font-mono text-lg font-semibold">$ {Number(formatUnits(BigInt(selectedProject.rewardsAvailable), 6)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between items-center mt-4">
                                        <div>
                                            <p className="font-medium">Claim Your Rewards</p>
                                            <p className="text-sm text-muted-foreground">Transfer your earned USDC to your wallet.</p>
                                        </div>
                                        <Button
                                            onClick={() => claimRewards(project.onchain_id, project.management_contract_address)}
                                            disabled={!canClaim || isClaiming}
                                            size="lg"
                                        >
                                            <Coins className="mr-2 h-4 w-4" />
                                            {isClaiming ? 'Claiming...' : 'Claim Rewards'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                        {project.project_status === "Failed" && (
                            <div className="space-y-6">
                                <div className="p-4 border rounded-lg bg-red-50 border-red-800 border-2">
                                    <h3 className="text-xl text-center font-bold mb-4 text-destructive">Funding Unsuccessful</h3>
                                    <p className="text-muted-foreground text-center mb-4">
                                        Unfortunately, this project did not reach its funding goal. <br /> You can withdraw your investment.
                                    </p>
                                    <p className="text-destructive text-center mb-4">
                                        Available to withdraw: <span className="font-bold text-lg">{calculateMyRefund(address, transactions)} USDC</span>
                                    </p>
                                    <Button
                                        onClick={() => refundInvestment(project.onchain_id, project.management_contract_address)}
                                        size="lg" 
                                        className="w-full bg-red-600 hover:bg-red-700"
                                        disabled={isClaiming || calculateMyRefund(address, transactions) <= 0}
                                    >
                                        {isClaiming ? 'Withdrawing...' : 'Withdraw Investment'}       
                                    </Button>
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