import { Button } from "@/components/ui/button";
import { Hourglass, CheckCircle2, XCircle, Loader2 } from "lucide-react";

const page = () => {
    return (
        <div className="max-w-2xl mx-auto text-center">
            <div className="bg-primary/5 rounded-lg p-6 mb-8 text-center">
                <h2 className="text-xl font-semibold text-foreground mb-3">Next Step: Identity Verification</h2>
                <p className="text-muted-foreground mb-4">
                    To comply with financial regulations and ensure platform security, please complete a one-time identity verification (KYC). This is required before you can 'invest' : 'create projects'.
                </p>
                <Button size="lg" className="w-full sm:w-auto" >
                    <Hourglass className="mr-2 h-4 w-4 animate-spin" /> "Begin Verification"
                </Button>
            </div>
            <div className="bg-success/30 border-l-4 border-success rounded-lg p-6 mb-8 text-center">
                <div className="flex items-center">
                    <CheckCircle2 className="mr-3 h-20 w-20 text-emerald-700" />
                    <div>
                        <h2 className="text-xl font-semibold text-primary mb-3">Verification Successful!</h2>
                        <p className="text-emerald-700 mb-4">
                            Welcome! Your account is fully active. You can now invest in projects' : 'create your first project'.
                        </p>
                    </div>
                </div>
                <Button size="lg" className="w-full sm:w-auto">
                    Go to Dashboard
                </Button>
            </div>
            <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-6 mb-8 text-center">
                <div className="flex items-center">
                    <XCircle className="mr-3 h-20 w-20 text-destructive" />
                    <div>
                        <h2 className="text-xl font-semibold text-destructive mb-1">Verification Action Required</h2>
                        <p className="text-destructive/90 mb-4">
                            We were unable to verify your identity. Your wallet address has been sanctioned.
                        </p>
                        <div className="flex items-center gap-4">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default page