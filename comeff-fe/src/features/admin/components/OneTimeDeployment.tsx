// src/features/admin/components/UserManagementTable.tsx
import { useMemo, useState } from "react";
import { Card, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Edit } from "lucide-react";
import type { PlatformConfig } from "../types";
import api from '@/lib/api';

interface OneTimeDeployment {
  configs: PlatformConfig[];
  onDataUpdate: () => void;
}

const configsToMap = (configs: PlatformConfig[]) => {
  let map: Record<string, string> = {};
  configs.forEach(config => {
    map[config.config_key] = config.config_value;
  });
  return map;
};

export const OneTimeDeployment = ({ configs, onDataUpdate }: OneTimeDeployment) => {
  const [editDialog, setEditDialog] = useState({ open: false, type: '', data: null });
  const [inputValue, setInputValue] = useState("");
  const configMap = useMemo(() => configsToMap(configs), [configs]);

  const handleEdit = (type: string, data: any) => {
    setEditDialog({ open: true, type, data });
  };

  const handleSave = async () => {
    try {
      const payload = {
        recordKey: editDialog.data,
        address: inputValue
      }

      const response = await api.post("/admin/deploy/record", payload);
      if (response.status !== 200) throw new Error("Failed to update configuration");

      setEditDialog({ open: false, type: '', data: null });
      setInputValue("");
      onDataUpdate();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <CardTitle className="mb-2 text-xl text-emerald-950 texl-bold"><object data="Factory Contract" type="">Platform Factory Contract Management</object></CardTitle>
              <CardDescription className="text-emerald-950">Manage and monitor platform's configuration</CardDescription>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="p-3 border rounded-lg justify-between flex">
              <div>
                <div className="text-primary font-bold text-lg">Platform Factory Contract</div>
                {configMap["PROJECT_FACTORY_ADDRESS"] ? <div className="text-md text-muted-foreground font-bold">{configMap["PROJECT_FACTORY_ADDRESS"]}</div> : <div className="text-lg font-bold">Not Deployed</div>}
              </div>
              <Button variant="ghost" className="bg-gray-100 text-emerald-700 hover:text-emerald-950 w-10 h-10" onClick={() => handleEdit('Platform Factory Contract', "PROJECT_FACTORY_ADDRESS")}>
                <Edit className="h-6 w-6" />
              </Button>

            </div>
            <div className="p-3 border rounded-lg justify-between flex">
              <div>
                <div className="text-primary font-bold text-lg">Mocked USDC</div>
                {configMap["MOCK_USDC_CONTRACT_ADDRESS"] ? <div className="text-md text-muted-foreground font-bold">{configMap["MOCK_USDC_CONTRACT_ADDRESS"]}</div> : <div className="text-lg font-bold">Not Deployed</div>}
              </div>
              <Button variant="ghost" className="bg-gray-100 text-emerald-700 hover:text-emerald-950 w-10 h-10" onClick={() => handleEdit('Mocked USDC Contract', "MOCK_USDC_CONTRACT_ADDRESS")}>
                <Edit className="h-6 w-6" />
              </Button>
            </div>
            <div className="p-3 border rounded-lg justify-between flex">
              <div>
                <div className="text-primary font-bold text-lg">Default Platform Fee</div>
                {configMap["FUNDING_FEE"] ? <div className="text-md text-muted-foreground font-bold">{configMap["FUNDING_FEE"] / 100} %</div> : <div className="text-lg font-bold">Null</div>}
              </div>
              <Button variant="ghost" className="bg-gray-100 text-emerald-700 hover:text-emerald-950 w-10 h-10" onClick={() => handleEdit('Funding fee', "FUNDING_FEE")}>
                <Edit className="h-6 w-6" />
              </Button>
            </div>
            <div className="p-3 border rounded-lg justify-between flex">
              <div>
                <div className="text-primary font-bold text-lg">Default Platform Dividend Fee</div>
                {configMap["DIVIDEND_FEE"] ? <div className="text-md text-muted-foreground font-bold">{configMap["DIVIDEND_FEE"] / 100} %</div> : <div className="text-lg font-bold">Null</div>}
              </div>
              <Button variant="ghost" className="bg-gray-100 text-emerald-700 hover:text-emerald-950 w-10 h-10" onClick={() => handleEdit('Platform dividend', "DIVIDEND_FEE")}>
                <Edit className="h-6 w-6" />
              </Button>
            </div>
          </div>

        </CardHeader>
      </Card>


      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog({ ...editDialog, open })}>
        <DialogContent className="w-[1000px]">
          <DialogHeader>
            <DialogTitle>Edit {editDialog.type}</DialogTitle>
            <DialogDescription>
              Make changes to the {editDialog.type} data below.
            </DialogDescription>
          </DialogHeader>
          <div className="gap-4 py-4">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={`Enter new value for ${editDialog.type}`}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog({ open: false, type: '', data: null })}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog >
    </>
  );
};