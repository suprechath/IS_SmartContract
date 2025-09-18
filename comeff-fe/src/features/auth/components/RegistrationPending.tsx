// src/features/auth/components/RegistrationPending.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { Hourglass } from "lucide-react";

// Define the props the component will accept
interface RegistrationPendingProps {
  selectedRole: 'Investor' | 'Project Creator' | null;
}

const RegistrationPending: React.FC<RegistrationPendingProps> = ({ selectedRole }) => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-background rounded-lg p-8 shadow-elegant">
            <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Hourglass className="h-8 w-8 text-amber-500" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">Registration Submitted!</h1>
            <p className="text-muted-foreground mb-8">
              Welcome to CommEfficient! Your account has been created and is now pending verification. This is a crucial step to ensure the security and integrity of our platform.
            </p>

            <div className="bg-primary/5 rounded-lg p-6 mb-8 text-left">
              <h2 className="text-xl font-semibold text-foreground mb-3 text-center">What Happens Next?</h2>
              <ul className="space-y-3 text-muted-foreground list-disc list-inside">
                <li>
                  <span className="font-semibold text-foreground">Verification in Progress:</span> Our system is now automatically conducting the necessary KYC (Know Your Customer) and sanction checks.
                </li>
                <li>
                  <span className="font-semibold text-foreground">Notification:</span> You will receive an email notification as soon as your account is approved. This process is typically quick but can take up to 24 hours.
                </li>
                <li>
                  <span className="font-semibold text-foreground">Next Steps:</span> Once approved, you will gain full access to the platform to {selectedRole === 'Investor' ? 'invest in projects' : 'create your first project'}.
                </li>
              </ul>
            </div>
            
            <p className="text-sm text-muted-foreground mb-6">You can now close this page. We'll be in touch shortly!</p>

            <Button variant="outline" onClick={() => window.location.href = '/'}>
              Return to Homepage
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPending;