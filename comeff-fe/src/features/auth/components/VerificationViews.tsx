// src/features/auth/components/VerificationViews.tsx
import { Button } from "@/components/ui/button";
import { Hourglass, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useProvideAuth } from "../hooks/useProvideAuth";

interface VerificationProps {
  role: 'Investor' | 'Project Creator' | null;
  onBeginVerification: () => void;
  isLoading: boolean;
}

// Pending
export const VerificationNotStarted = ({ role, onBeginVerification, isLoading }: VerificationProps) => (
  <div className="bg-primary/5 rounded-lg p-6 mb-8 text-center">
    <h2 className="text-xl font-semibold text-foreground mb-3">Next Step: Identity Verification</h2>
    <p className="text-muted-foreground mb-4">
      To comply with financial regulations and ensure platform security, please complete a one-time identity verification (KYC). This is required before you can {role === 'Investor' ? 'invest' : 'create projects'}.
    </p>
    <Button size="lg" className="w-full sm:w-auto" onClick={onBeginVerification} disabled={isLoading}>
      {isLoading ? <Hourglass className="mr-2 h-4 w-4 animate-spin" /> : "Begin Verification"}
    </Button>
  </div>
);

// Verified
export const VerificationApproved = ({ role }: { role: string | null }) => {
  const { logout } = useProvideAuth();
  const router = useRouter();
  return (
    <div className="bg-success/30 border-l-4 border-success rounded-lg p-6 mb-8 text-center">
      <div className="flex items-center">
        <CheckCircle2 className="mr-3 h-20 w-20 text-emerald-700" />
        <div>
          <h2 className="text-xl font-semibold text-primary mb-3">Verification Successful!</h2>
          <p className="text-emerald-700 mb-4">
            Welcome! Your account is fully active. You can now {role === 'Investor' ? 'invest in projects' : 'create your first project'}.
          </p>
          <Button size="lg" className="w-full sm:w-auto" onClick={() => {logout(); router.push('/');}}>
            Please re-login to continue.
          </Button>
        </div>
      </div>
    </div >
  );
};

// State 4: Verification failed
export const VerificationRejected = () => (
  <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-6 mb-8 text-left">
    <div className="flex items-center">
      <XCircle className="mr-3 h-20 w-20 text-destructive" />
      <div>
        <h2 className="ml-5 text-xl font-semibold text-destructive mb-1">Your wallet address has been sanctioned!!!</h2>
      </div>
    </div>
  </div>
);