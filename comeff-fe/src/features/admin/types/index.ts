// src/features/admin/types/index.ts

export interface Project {
  // Core Identifiers
  id: string; // The primary key from your database
  project_offchain_id: string;
  user_onchain_id: string;

  // Project Details
  title: string;
  cover_image_url: string;
  location: string;
  tags: string[]; // We'll parse the JSON string into an array

  // Status & Timestamps
  project_status: 'Pending' | 'Approved' | 'Rejected' | 'Funding' | 'Succeeded' | 'Failed' | 'Active';
  created_at: string; // ISO date string
  updated_at: string; // ISO date string

  // Funding Details
  funding_usdc_goal: number;
  total_contributions: number;
  funding_duration_second: number;

  // Fees
  platform_fee_percentage: number;
  reward_fee_percentage: number;

  // On-Chain Data
  management_contract_address: string | null;
  token_contract_address: string | null;
  usdc_contract_address: string | null;
  token_total_supply: number;
  tokens_minted: boolean;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  identification_number: string;
  role: 'Platform Operator' | 'Investor' | 'Project Creator'; // Expanded to include the new role
  sanction_status: 'Verified' | 'Pending' | 'Rejected'; // Matches backend status
  wallet_address: string;
}

export interface PlatformStats {
  totalUsers: number;
  kycApproved: number;
  pendingKyc: number;
  totalValueLocked: number;
  totalProjects: number;
  activeProjects: number;
  fundingProjects: number;
  completedProjects: number;
  dividendsDistributed: number;
}

export interface Transactions {
  id: string;
  user_onchain_id: string;
  project_onchain_id: string;
  USDC_amount: number;
  transaction_type: 'Contribution' | 'Dividend' | 'Refund' | 'Fee';
  transaction_hash: string;
  related_transaction_hash?: string;
  platform_fee: number;
  created_at: string;
}

export interface SystemStatus {
  projectFactory: 'Operational' | 'Down';
  rewardDistribution: 'Operational' | 'Down';
  votingSystem: 'Operational' | 'Down';
  kycProvider: 'Connected' | 'Disconnected';
}