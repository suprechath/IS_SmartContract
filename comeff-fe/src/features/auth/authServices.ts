// src/features/auth/authServices.ts
import api from '@/lib/api';

export const register = async (): Promise<Project[]> => {
  try {
    const response = await api.get('/projects');
    return response.data;
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    // Re-throw or return a default value
    throw error;
  }
};

// Function to get a single project by its ID
export const getProjectById = async (projectId: string): Promise<Project> => {
  try {
    const response = await api.get(`/projects/${projectId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch project ${projectId}:`, error);
    throw error;
  }
};

// You can add more functions here like createProject, updateProject, etc.