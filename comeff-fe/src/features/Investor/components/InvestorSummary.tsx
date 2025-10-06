import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Building2, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface InvestorSummaryProps {
  totalInvested: number;
  totalRewardsClaimed: number;
  activeInvestments: number;
}

export const InvestorSummary = ({ totalInvested, totalRewardsClaimed, activeInvestments }: InvestorSummaryProps) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    <Card className="grid grid-cols-2">
      <div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-bold whitespace-nowrap text-primary">Total Invested</CardTitle>

        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-2 text-emerald-900">{formatCurrency(totalInvested, 'USD')}</div>
          <p className="text-sm text-muted-foreground whitespace-nowrap">Across all projects</p>
        </CardContent>
      </div>
      <DollarSign className="h-16 w-16 text-green-600 place-items-center justify-self-end mr-5" />
    </Card>

    <Card className="grid grid-cols-2">
      <div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-bold whitespace-nowrap text-primary">Total Rewards Claimed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-2 text-emerald-900">{formatCurrency(totalRewardsClaimed, 'USD')}</div>
          <p className="text-sm text-muted-foreground whitespace-nowrap">Lifetime earnings</p>
        </CardContent>
      </div>
      <TrendingUp className="h-16 w-16 text-blue-600 place-items-center justify-self-end mr-5" />

    </Card>

    <Card className="grid grid-cols-2">
      <div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-bold whitespace-nowrap text-primary">Active Investments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-2 text-emerald-900">{activeInvestments}</div>
          <p className="text-sm text-muted-foreground whitespace-nowrap">Current projects</p>
        </CardContent>
      </div>
      <Building2 className="h-16 w-16 text-green-900 place-items-center justify-self-end mr-5" />
    </Card>
  </div>
);