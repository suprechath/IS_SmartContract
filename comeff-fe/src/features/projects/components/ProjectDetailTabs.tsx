import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Leaf, ShieldCheck, FileText } from "lucide-react";

import { Project } from "../types";
import { formatCurrency } from "@/lib/utils";

interface ProjectDetailTabsProps {
    project: Project;
}

// A simple component for a single info item
const InfoItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div>
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className="font-medium">{value}</div>
    </div>
);

export const ProjectDetailTabs = ({ project }: ProjectDetailTabsProps) => {
    const documents = [
        ...(project.project_plan_url ? [{ name: "Project Plan", url: project.project_plan_url }] : []),
        ...(project.technical_specifications_urls?.map((url, index) => ({
            name: `Technical Specifications ${index + 1}`,
            url: url
        })) || []),
        ...(project.third_party_verification_urls?.map((url, index) => ({
            name: `Third-Party Verification ${index + 1}`,
            url: url
        })) || [])
    ];

     // Mock LEED certification levels
    const leedLevels = ['Certified', 'Silver', 'Gold', 'Platinum'];
    const leedColors = {
        'Certified': 'text-gray-600',
        'Silver': 'text-gray-500',
        'Gold': 'text-yellow-600',
        'Platinum': 'text-green-600'
    };
    const randomLeedLevel = leedLevels[Math.floor(Math.random() * leedLevels.length)];


    return (
        <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-500/40">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="financials">Financials</TabsTrigger>
                <TabsTrigger value="sustainability">Sustainability</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-primary text-2xl">Project Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <InfoItem label="Background" value={project.project_overview} />
                        <InfoItem label="Solution" value={project.proposed_solution} />
                    </CardContent>
                </Card>
            </TabsContent>

            {/* Financials Tab */}
            <TabsContent value="financials" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-primary text-2xl">Investment Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-4">
                        <InfoItem label="Projected Returns (ROI)" value={<span className="text-green-600">{project.projected_roi} %</span>} />
                        <InfoItem label="Payback Period" value={<span className="text-accent">{project.projected_payback_period_months} months</span>} />
                        <InfoItem label="Distribution Frequency" value="Monthly" />
                        <InfoItem label="Hold Period" value="10 Years" />
                    </CardContent>
                </Card>
            </TabsContent>

            {/* Sustainability Tab */}
            <TabsContent value="sustainability" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-primary text-2xl">
                            <Leaf className="w-6 h-6 mr-2 text-green-600" />
                            Environmental Impact
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-4">
                        <InfoItem label="Energy Reduction" value={`${Math.floor(Math.random() * 21)}% vs baseline`} />
                        <InfoItem label="Emission Reduction" value={project.co2_reduction} />
                        <InfoItem label="LEED Rating" value={<span className={leedColors[randomLeedLevel]}>{randomLeedLevel}</span>} />
                    </CardContent>
                </Card>
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-primary text-2xl">
                            <ShieldCheck className="w-6 h-6 mr-2 text-primary" />
                            Verification Documents
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {documents.length > 0 ? (
                            documents.map((doc, index) => (
                                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center">
                                        <FileText className="w-4 h-4 mr-3 text-muted-foreground" />
                                        <span className="text-sm font-medium">{doc.name}</span>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => window.open(doc.url, '_blank')}
                                    >
                                        View
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-muted-foreground py-8">
                                No documents available
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
};