'use client'
import { useState } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

import { CalendarIcon, Users, Building2, ArrowLeft, ArrowRight, Check, Wallet } from "lucide-react"; 1
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';


const Register = () => {
    const { address, isConnected } = useAccount();
    const { connect } = useConnect();
    const { disconnect } = useDisconnect();
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedRole, setSelectedRole] = useState<"investor" | "creator" | null>(null);
    // const [walletConnected, setWalletConnected] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        dateOfBirth: undefined as Date | undefined,
        address: "",
        idNumber: "",
        agreedToTerms: false,
    })
    const [showConfirmation, setShowConfirmation] = useState(false);

    const handleRoleSelect = (role: "investor" | "creator") => {
        setSelectedRole(role);
    };

    // const handleWalletConnect = () => {
    //     // Mock wallet connection
    //     setWalletConnected(true);
    // };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const canProceedFromStep1 = selectedRole && address;
    const canProceedFromStep2 = formData.fullName && formData.email && formData.dateOfBirth && formData.address && formData.idNumber;
    const canSubmit = canProceedFromStep2 && formData.agreedToTerms;

    const handleSubmit = () => {
        if (canSubmit) {
            setShowConfirmation(true);
        }
    };

    return (
        <section className='justify-center py-16'>
            <div className="container mx-auto mb-8">
                {/* Progress Indicator */}
                <div className="flex items-center justify-center mb-8 space-x-4">
                    {[1, 2, 3].map((step) => (
                        <div key={step} className="flex items-center">
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center text-md font-medium transition-colors",
                                currentStep >= step
                                    ? "bg-emerald-950 text-white"
                                    : "bg-emerald-600 opacity-50 text-white"
                            )}>
                                {step}
                            </div>
                            {step < 3 && (
                                <div className={cn(
                                    "w-16 h-0.5 mx-2 transition-colors",
                                    currentStep > step ? "bg-emerald-950" : "bg-emerald-600"
                                )} />
                            )}
                        </div>
                    ))}
                </div>

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-emerald-950 mb-2">Create Your Account</h1>
                    <p className="text-gray-600">
                        {currentStep === 1 && "Choose your role and connect your wallet"}
                        {currentStep === 2 && "Enter your personal information"}
                        {currentStep === 3 && "Review and accept terms"}
                    </p>
                </div>

                <div className="rounded-lg bg-zinc-100 text-emerald-950 shadow-lg border border-gray-300 max-w-4xl mx-auto">  {/* card */}
                    <div className='p-5'> {/* card content */}
                        {/* Step 1: Role Selection & Wallet Connection */}
                        {currentStep === 1 && (
                            <div className="space-y-8 text-center mx-auto">
                                <h2 className="text-xl font-semibold mb-6 text-center">Select Your Role</h2>
                                <div className="grid md:grid-cols-2 gap-6 ">
                                    <div
                                        className={cn(
                                            "max-w-md border border-gray-300 rounded-lg bg-zinc-100 text-emerald-950 shadow-xl cursor-pointer transition-all duration-200 hover:shadow-md",
                                            selectedRole === "investor" ? "ring-2 ring-emerald-950 bg-emerald-950/10" : "")}
                                        onClick={() => handleRoleSelect("investor")}>
                                        <div className='p-4'>
                                            <div className="w-16 h-16 bg-emerald-950/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Users className="h-10 w-10 text-emerald-950" />
                                            </div>
                                            <h3 className="text-lg font-semibold mb-2">I am an Investor.</h3>
                                            <p className="text-gray-900 text-sm">
                                                Browse and invest in vetted energy efficiency projects.
                                            </p>
                                        </div>
                                    </div>

                                    <div
                                        className={cn(
                                            "max-w-md border border-gray-300 rounded-lg bg-zinc-100 text-emerald-950 shadow-xl cursor-pointer transition-all duration-200 hover:shadow-md",
                                            selectedRole === "creator" ? "ring-2 ring-emerald-950 bg-emerald-950/10" : "")}
                                        onClick={() => handleRoleSelect("creator")}>
                                        <div className='p-4'>
                                            <div className="w-16 h-16 bg-emerald-950/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Building2 className="h-10 w-10 text-emerald-950" />
                                            </div>
                                            <h3 className="text-lg font-semibold mb-2">I am a Project Creator.</h3>
                                            <p className="text-gray-900 text-sm">
                                                Raise capital for your energy efficiency upgrades.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {selectedRole && (
                                    <div className="text-center space-y-2">
                                        <h3 className="text-xl font-semibold">Connect Your Wallet</h3>
                                        {!isConnected ? (
                                            <button
                                                onClick={() => {
                                                    connect({ connector: injected() });
                                                }}
                                                className="bg-[linear-gradient(135deg,_hsl(158,64%,25%),_hsl(158,45%,45%))] text-zinc-50 hover:scale-105 transition-bounce font-semibold shadow-lg h-12 rounded-md px-3 inline-flex items-center">
                                                <Wallet className="mr-2" size={25} />
                                                Connect Wallet
                                            </button>
                                        ) : (
                                            <div className="bg-emerald-950/10 border border-emerald-950/20 rounded-lg p-2 ring-1">
                                                <div className="flex items-center justify-center text-emerald-950">
                                                    <Check className="mr-2 h-8 w-8" />
                                                    <span className="text-lg font-semibold">Wallet Connected: {address?.slice(0, 6)}...{address?.slice(-4)}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-8 pt-6 border-t">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                                disabled={currentStep === 1}
                            >
                                <ArrowLeft className="mr-2 h-5 w-5" />
                                Back
                            </Button>

                            {currentStep < 3 && (
                                <Button
                                    onClick={() => setCurrentStep(prev => prev + 1)}
                                    disabled={
                                        (currentStep === 1 && !canProceedFromStep1) ||
                                        (currentStep === 2 && !canProceedFromStep2)
                                    }
                                >
                                    Next
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </section >
    )
}
export default Register