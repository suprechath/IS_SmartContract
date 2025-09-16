// src/features/projects/types/index.ts
export interface Project {
  id: string;
  title: string;
  tags: string[];
  location: string;
  cover_image_url: string;
  funding_usdc_goal: string;
  total_contributions: string;
  project_status: 'Funding' | 'Active' | 'Succeeded' | 'Failed';
  // Add other fields from your projectModel as needed
}