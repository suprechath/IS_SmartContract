// src/features/auth/components/RegistrationPending.tsx
'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthProvider";
import {
  VerificationNotStarted,
  VerificationApproved,
  VerificationRejected
} from './VerificationViews';

interface RegistrationPendingProps {
  role: 'Investor' | 'Project Creator' | null;
  kycStatus: 'Pending' | 'Verified' | 'Rejected' | null;
}

const RegistrationPending: React.FC<RegistrationPendingProps> = ({ role, kycStatus: initialKycStatus }) => {
  const { logout, isLoading, verifySanctionStatus } = useAuth();
  const [kycStatus, setKycStatus] = React.useState(initialKycStatus);

  React.useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userObj = JSON.parse(storedUser);
      if (userObj.sanction_status && userObj.sanction_status !== kycStatus) {
        setKycStatus(userObj.sanction_status);
      }
    }
  }, []);

  const handleBeginVerification = async () => {
    await verifySanctionStatus();
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userObj = JSON.parse(storedUser);
      setKycStatus(userObj.sanction_status);
    }
  };

  // Conditionally render the correct verification component
  const renderVerificationStatus = () => {
    switch (kycStatus) {
      case 'Verified':
        return <VerificationApproved
          role={role}
        />;
      case 'Rejected':
        return <VerificationRejected />;
      case 'Pending':
      default:
        return <VerificationNotStarted
          role={role}
          onBeginVerification={handleBeginVerification} //<--- correct heres
          isLoading={isLoading}
        />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-background rounded-lg p-8 shadow-elegant">
            {kycStatus !== 'Rejected' && (
              <div>
                <div className="w-32 h-32 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="h-20 w-20 text-success" />
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-4">Account Created Successfully!</h1>
                <p className="text-emerald-950 font-bold mb-8">
                  You're one step closer to {role === 'Investor' ? 'investing in sustainable projects' : 'funding your energy project'}.
                </p>
              </div>
            )}

            {renderVerificationStatus()}

            {kycStatus == 'Pending' && (<Button variant="outline" onClick={() => {
              logout();
              window.location.href = '/';
            }}>
              Return to Homepage
            </Button>)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPending;