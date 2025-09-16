import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, Users, Building2, ArrowLeft, ArrowRight, Check, Wallet } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const Register = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<"investor" | "creator" | null>(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    dateOfBirth: undefined as Date | undefined,
    address: "",
    idNumber: "",
    agreedToTerms: false,
  });
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleRoleSelect = (role: "investor" | "creator") => {
    setSelectedRole(role);
  };

  const handleWalletConnect = () => {
    // Mock wallet connection
    setWalletConnected(true);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const canProceedFromStep1 = selectedRole && walletConnected;
  const canProceedFromStep2 = formData.fullName && formData.email && formData.dateOfBirth && formData.address && formData.idNumber;
  const canSubmit = canProceedFromStep2 && formData.agreedToTerms;

  const handleSubmit = () => {
    if (canSubmit) {
      setShowConfirmation(true);
    }
  };

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-background rounded-lg p-8 shadow-elegant">
              <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="h-8 w-8 text-success" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-4">Account Created Successfully!</h1>
              <p className="text-muted-foreground mb-8">
                Welcome to CommEfficient! Your account has been created and you're one step closer to {selectedRole === 'investor' ? 'investing in sustainable projects' : 'raising capital for your energy efficiency projects'}.
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

              <Button variant="outline" onClick={() => window.location.href = '/'}>
                Return to Homepage
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                    currentStep >= step
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}>
                    {step}
                  </div>
                  {step < 3 && (
                    <div className={cn(
                      "w-16 h-0.5 mx-2 transition-colors",
                      currentStep > step ? "bg-primary" : "bg-muted"
                    )} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Create Your Account</h1>
            <p className="text-muted-foreground">
              {currentStep === 1 && "Choose your role and connect your wallet"}
              {currentStep === 2 && "Enter your personal information"}
              {currentStep === 3 && "Review and accept terms"}
            </p>
          </div>

          <Card className="shadow-elegant">
            <CardContent className="p-8">
              {/* Step 1: Role Selection & Wallet Connection */}
              {currentStep === 1 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl font-semibold mb-6 text-center">Select Your Role</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      <Card
                        className={cn(
                          "cursor-pointer transition-all duration-200 hover:shadow-md",
                          selectedRole === "investor" ? "ring-2 ring-primary bg-primary/5" : ""
                        )}
                        onClick={() => handleRoleSelect("investor")}
                      >
                        <CardContent className="p-6 text-center">
                          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="h-8 w-8 text-primary" />
                          </div>
                          <h3 className="text-lg font-semibold mb-2">I am an Investor</h3>
                          <p className="text-muted-foreground text-sm">
                            Browse and invest in vetted energy efficiency projects.
                          </p>
                        </CardContent>
                      </Card>

                      <Card
                        className={cn(
                          "cursor-pointer transition-all duration-200 hover:shadow-md",
                          selectedRole === "creator" ? "ring-2 ring-primary bg-primary/5" : ""
                        )}
                        onClick={() => handleRoleSelect("creator")}
                      >
                        <CardContent className="p-6 text-center">
                          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Building2 className="h-8 w-8 text-primary" />
                          </div>
                          <h3 className="text-lg font-semibold mb-2">I am a Project Creator</h3>
                          <p className="text-muted-foreground text-sm">
                            Raise capital for your energy efficiency upgrades.
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {selectedRole && (
                    <div className="text-center space-y-4">
                      <h3 className="text-lg font-semibold">Connect Your Wallet</h3>
                      {!walletConnected ? (
                        <Button
                          onClick={handleWalletConnect}
                          size="lg"
                          className="w-full sm:w-auto"
                        >
                          <Wallet className="mr-2 h-5 w-5" />
                          Connect Your Wallet
                        </Button>
                      ) : (
                        <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                          <div className="flex items-center justify-center text-success">
                            <Check className="mr-2 h-5 w-5" />
                            <span className="font-medium">Wallet Connected: 0x123...abc</span>
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
                        <PopoverContent className="w-auto p-0" align="start">
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
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
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
                      <p><span className="font-medium">Role:</span> {selectedRole === 'investor' ? 'Investor' : 'Project Creator'}</p>
                      <p><span className="font-medium">Name:</span> {formData.fullName}</p>
                      <p><span className="font-medium">Email:</span> {formData.email}</p>
                      <p><span className="font-medium">Date of Birth:</span> {formData.dateOfBirth ? format(formData.dateOfBirth, "PPP") : ""}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="terms"
                      checked={formData.agreedToTerms}
                      onCheckedChange={(checked) => handleInputChange("agreedToTerms", checked)}
                    />
                    <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                      I agree to the <a href="#" className="text-primary hover:underline">CommEfficient Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>. I understand that identity verification is required before I can use the platform.
                    </Label>
                  </div>

                  <Button
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    size="lg"
                    className="w-full"
                  >
                    Create Account
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