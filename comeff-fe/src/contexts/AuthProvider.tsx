'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useProvideAuth } from '../features/auth/hooks/useProvideAuth'; // We will create this hook next

// Define the shape of the context data
interface AuthContextType {
  user: any; // Replace 'any' with your User interface if available
  token: string | null;
  register: (formData: any) => Promise<any>;
  login: () => Promise<any>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  verifySanctionStatus: () => Promise<any>;
}

// Create the context with a default undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useProvideAuth(); // This hook will contain all the logic
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

// Create a hook to easily consume the context in other components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};