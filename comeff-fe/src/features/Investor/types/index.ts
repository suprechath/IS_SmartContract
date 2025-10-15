// src/features/projects/types/index.ts
export type ProjectStatus =
    | "Pending"      // Awaiting admin approval
    | "Approved"     // Approved but not yet funding
    | "Rejected"     // Not approved by admin
    | "Funding"      // Approved and actively collecting funds
    | "Succeeded"    // Funding goal met, awaiting fund withdrawal
    | "Failed"       // Did not meet funding goal by the deadline
    | "Active";      // Funds withdrawn, project is in progress

export type TransactionType =
    | "Investment"
    | "Withdrawal"
    | "RewardDeposit"
    | "RewardClaim"
    | "Refund";

export interface Transactions {
    project_onchain_id: string;
    project_offchain_id: string;
    project_title: string;
    project_status: string
    token_contract_address: string;
    management_contract_address: string;
    usdc_contract_address: string;
    id: string;
    user_onchain_id: string;
    usdc_amount: number;
    transaction_type: TransactionType;
    transaction_hash: string;
    related_transaction_hash: string;
    platform_fee: number;
    created_at: string;
    wallet_address: string;
}

export interface Project {
    id: string;
    user_onchain_id: string;
    project_offchain_id: string;
    funding_usdc_goal: number;
    funding_duration_second: number;
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

    onchain_id: string;
}

export interface ProjectWithBalance {
    onchain_id: string;
    title: string;
    project_status: string;
    token_contract_address: string;
    management_contract_address: string;
    tokenBalance: string | number; // Can be a string for error messages or a number for the balance
    rewardsAvailable?: string | number; // Optional field for available rewards
}