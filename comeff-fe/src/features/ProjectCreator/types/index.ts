// src/features/projects/types/index.ts
export type ProjectStatus =
    | "Pending"      // Awaiting admin approval
    | "Approved"     // Approved but not yet funding
    | "Rejected"     // Not approved by admin
    | "Funding"      // Approved and actively collecting funds
    | "Succeeded"    // Funding goal met, awaiting fund withdrawal
    | "Failed"       // Did not meet funding goal by the deadline
    | "Active";      // Funds withdrawn, project is in progress

// Represents a single investment made by a user into a project.
export interface Investment {
    investorAddress: string;
    amount: number;
    timestamp: string;
}

// Represents a transaction related to the project's funds.
export interface ProjectTransaction {
    id: string;
    type: "Contribution" | "Withdrawal" | "RewardDeposit" | "RewardClaim";
    amount: number;
    date: string;
    transactionHash: string;
}

export interface Project {
    id: string;
    user_onchain_id: string;
    project_offchain_id: string;
    funding_usdc_goal: number;
    funding_duration_seconds: number;
    management_contract_address: string | null;
    token_contract_address: string | null;
    usdc_contract_address: string | null;
    platform_fee_percentage: number;
    reward_fee_percentage: number;
    project_status: ProjectStatus;
    total_contributions: number;
    token_total_supply: number;
    tokens_minted: boolean;

    title: string;
    project_overview: string;
    proposed_solution: string;
    location: string;
    cover_image_url: string;
    tags: string[];
    CO2_reduction: number | null;
    projected_roi: number;
    projected_payback_period_months: number;
    project_plan_url: string;
    technical_specifications_urls: string[];
    third_party_verification_urls: string[];
    created_at: string;
    updated_at: string;
}