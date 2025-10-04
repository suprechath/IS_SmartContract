export type ProjectStatus = 'Pending' | 'Approved' | 'Rejected' | 'Funding' | 'Succeeded' | 'Failed' | 'Active';

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
    co2_reduction: number | null;
    projected_roi: number;
    projected_payback_period_months: number;
    project_plan_url: string;
    technical_specifications_urls: string[];
    third_party_verification_urls: string[];
    created_at: string;
    updated_at: string;
    contributor_count: number;
}