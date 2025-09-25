// src/features/admin/components/UserManagementTable.tsx
import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getStatusBadge, getRoleBadge } from "@/components/StatusBadge";

import { Eye, FileSpreadsheet, Search, User as UserIcon, CheckCircle, XCircle } from "lucide-react";
import { useAdminActions } from "../hooks/useAdminActions";
import type { PlatformConfig } from "../types";

interface OneTimeDeployment {
  configs: PlatformConfig[];
  onDataUpdate: () => void;
}

const configsToMap = (configs: PlatformConfig[]) => {
  return configs.reduce((acc, config) => {
    acc[config.config_key] = config.config_value;
    return acc;
  }, {} as Record<string, string | null>);
};

export const OneTimeDeployment = ({ configs, onDataUpdate }: OneTimeDeployment) => {
    const configMap = useMemo(() => configsToMap(configs), [configs]);
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="mb-2 text-xl text-emerald-950 texl-bold"><object data="Factory Contract" type="">Platform Factory Contract Management</object></CardTitle>
              <CardDescription className="text-emerald-950">Manage and monitor platform's configuration</CardDescription>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="p-3 border rounded-lg">
              <div className="text-primary font-bold text-lg">Platform Factory Contract</div>
              {configMap["PROJECT_FACTORY_ADDRESS"] ? <div className="text-md text-muted-foreground font-bold">{configMap["PROJECT_FACTORY_ADDRESS"]}</div> : <div className="text-lg font-bold">Not Deployed</div>}
            </div>
            <div className="p-3 border rounded-lg">
              <div className="text-primary font-bold text-lg">Mock USDC</div>
              {configMap["MOCK_USDC_CONTRACT_ADDRESS"] ? <div className="text-md text-muted-foreground font-bold">{configMap["MOCK_USDC_CONTRACT_ADDRESS"]}</div> : <div className="text-lg font-bold">Not Deployed</div>}
            </div>
            <div className="p-3 border rounded-lg">
              <div className="text-primary font-bold text-lg">Default Platform Fee</div>
              {configMap["FUNDING_FEE"] ? <div className="text-md text-muted-foreground font-bold">{configMap["FUNDING_FEE"]} %</div> : <div className="text-lg font-bold">Null</div>}
            </div>
            <div className="p-3 border rounded-lg">
              <div className="text-primary font-bold text-lg">Default Platform Dividend Fee</div>
              {configMap["DIVIDEND_FEE"] ? <div className="text-md text-muted-foreground font-bold">{configMap["DIVIDEND_FEE"]} %</div> : <div className="text-lg font-bold">Null</div>}
            </div>
          </div>

        </CardHeader>
      </Card>
    </>
  );
};