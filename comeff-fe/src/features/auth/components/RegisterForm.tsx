'use client';
import React, { useState } from "react";
import { useAccount, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { format } from "date-fns";
import { useRouter } from 'next/navigation'; 

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, Users, Building2, ArrowLeft, ArrowRight, Check, Wallet, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthProvider"; 
// import { useProvideAuth } from "../hooks/useProvideAuth";


const Register = () => {
  const router = useRouter(); 
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { register, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    dateOfBirth: undefined as Date | undefined,
    physicalAddress: "",
    idNumber: "",
    agreedToTerms: false,
  });

  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<"Investor" | "Project Creator" | null>(null);

  const handleRoleSelect = (role: "Investor " | "Project Creator") => {
    setSelectedRole(role);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const canProceedFromStep1 = selectedRole && address;
  const canProceedFromStep2 = formData.fullName && formData.email && formData.dateOfBirth && formData.physicalAddress && formData.idNumber;
  const canSubmit = canProceedFromStep2 && formData.agreedToTerms;

  const handleSubmit = async () => {
    if (!canSubmit || !selectedRole || !address) return;

    const registrationData = {
      full_name: formData.fullName,
      date_of_birth: format(formData.dateOfBirth, "yyyy-MM-dd"),
      address: formData.physicalAddress,
      identification_number: formData.idNumber,
      email: formData.email,
      wallet_address: address,
      role: selectedRole,
    };
    

    const result = await register(registrationData);

    if (result?.success) {
      alert('Registration successful! Please proceed to identity verification.');
      router.push('/pending-verification');
    } else {
      alert(`Registration failed: ${result?.error}`);
      console.error('Registration error:', result?.error);
    }

  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-lg font-medium transition-colors",
                    currentStep >= step
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}>
                    {step}
                  </div>
                  {step < 3 && (
                    <div className={cn(
                      "w-16 h-1 mx-2 transition-colors round",
                      currentStep > step ? "bg-primary" : "bg-muted"
                    )} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-emerald-900 mb-2">Create Your Account</h1>
            <p className="text-emerald-700">
              {currentStep === 1 && "Choose your role and connect your wallet"}
              {currentStep === 2 && "Enter your personal information"}
              {currentStep === 3 && "Review and accept terms"}
            </p>
          </div>

          <Card className="shadow-xl">
            <CardContent className="p-4">
              {/* Step 1: Role Selection & Wallet Connection */}
              {currentStep === 1 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl font-bold mb-6 text-center text-emerald-900">Select Your Role</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      <Card
                        className={cn(
                          "cursor-pointer transition-all duration-200 hover:shadow-2xl",
                          selectedRole === "Investor" ? "ring-2 ring-primary bg-primary/5" : ""
                        )}
                        onClick={() => handleRoleSelect("Investor")}
                      >
                        <CardContent className="p-2 text-center">
                          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="h-10 w-10 text-primary" />
                          </div>
                          <h3 className="text-lg font-semibold mb-2 text-emerald-950">I am an Investor</h3>
                          <p className="text-muted-foreground text-sm">
                            Browse and invest in vetted energy projects.
                          </p>
                        </CardContent>
                      </Card>

                      <Card
                        className={cn(
                          "cursor-pointer transition-all duration-200 hover:shadow-2xl",
                          selectedRole === "Project Creator" ? "ring-2 ring-primary bg-primary/5" : ""
                        )}
                        onClick={() => handleRoleSelect("Project Creator")}
                      >
                        <CardContent className="p-2 text-center">
                          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Building2 className="h-10 w-10 text-primary" />
                          </div>
                          <h3 className="text-lg font-semibold mb-2 text-emerald-950">I am a Project Creator</h3>
                          <p className="text-muted-foreground text-sm">
                            Raise capital for your energy efficiency upgrades.
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {selectedRole && (
                    <div className="text-center space-y-4">
                      <h3 className="text-lg font-semibold">Connect Your Wallet </h3>
                      {!isConnected ? (
                        <Button
                          onClick={() => { connect({ connector: injected() }); }}
                          size="lg"
                          className="w-auto"
                        >
                          <Wallet className="mr-2 w-5 h-5" />
                          Connect Your Wallet
                        </Button>
                      ) : (
                        <div className="bg-success/10 border border-success border-2 rounded-lg p-4">
                          <div className="flex items-center justify-center text-success">
                            <Check className="mr-2 h-7 w-7" />
                            <span className="font-medium">Wallet Connected: {address?.slice(0, 6)}...{address?.slice(-4)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Personal Information */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-6 text-center">Personal Information</h2>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange("fullName", e.target.value)}
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="Enter your email address"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Date of Birth *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.dateOfBirth && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.dateOfBirth ? format(formData.dateOfBirth, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={formData.dateOfBirth}
                            onSelect={(date) => handleInputChange("dateOfBirth", date)}
                            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="idNumber">Identification Number *</Label>
                      <Input
                        id="idNumber"
                        value={formData.idNumber}
                        onChange={(e) => handleInputChange("idNumber", e.target.value)}
                        placeholder="National ID, Driver's License, etc."
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Full Address *</Label>
                    <Textarea
                      id="physicalAddress"
                      value={formData.physicalAddress}
                      onChange={(e) => handleInputChange("physicalAddress", e.target.value)}
                      placeholder="Enter your complete physical address"
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Agreement and Submission */}
              {currentStep === 3 && (
                <div className="space-y-8">
                  <h2 className="text-xl font-semibold mb-6 text-center">Terms & Conditions</h2>

                  <div className="bg-muted/30 rounded-lg p-6">
                    <h3 className="font-semibold mb-3">Review Your Information</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Role:</span> {selectedRole === 'Investor' ? 'Investor' : 'Project Creator'}</p>
                      <p><span className="font-medium">Name:</span> {formData.fullName}</p>
                      <p><span className="font-medium">Email:</span> {formData.email}</p>
                      <p><span className="font-medium">Date of Birth:</span> {formData.dateOfBirth ? format(formData.dateOfBirth, "PPP") : ""}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="terms"
                      checked={formData.agreedToTerms}
                      onCheckedChange={(checked) => handleInputChange("agreedToTerms", checked)}
                    />
                    <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                      I agree to the <a href="#" className="text-primary hover:underline">CommEfficient Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                    </Label>
                  </div>
                  <p className="text-sm">
                    I understand that identity verification is required before I can use the platform.
                  </p>

                  <Button
                    onClick={handleSubmit}
                    disabled={!canSubmit|| isLoading}
                    size="lg"
                    className="w-full"
                  >
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Create Account'}
                  </Button>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
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
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Register;