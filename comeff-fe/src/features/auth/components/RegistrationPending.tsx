// src/features/auth/components/RegistrationPending.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { Hourglass, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthProvider";


// Define the props the component will accept
interface RegistrationPendingProps {
  selectedRole: 'Investor' | 'Project Creator' | null;
}

const RegistrationPending: React.FC<RegistrationPendingProps> = ({ selectedRole }) => {
  const { logout } = useAuth();
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-background rounded-lg p-8 shadow-elegant">
            <div className="w-32 h-32 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="h-20 w-20 text-success" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">Account Created Successfully!</h1>
            <p className="text-muted-foreground">
              Welcome!
            </p>
            <p className="text-emerald-950 font-bold mb-8">
              Your account has been created and you're one step closer to {user.role === 'Investor' ? 'investing in sustainable projects' : 'raising capital for your energy projects'}.
            </p>


            <div className="bg-primary/5 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-3">Next Step: Identity Verification</h2>
              <p className="text-muted-foreground mb-4">
                To comply with financial regulations and ensure the security of our platform, all users are required to complete a one-time identity verification (KYC). This is a necessary step before you can {selectedRole === 'investor' ? 'invest' : 'create projects'}.
              </p>
              <Button size="lg" className="w-full sm:w-auto">
                Begin Verification
              </Button>
            </div>

            <Button variant="outline" onClick={() => {
              logout();
              window.location.href = '/';
            }}>
              Return to Homepage
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPending;