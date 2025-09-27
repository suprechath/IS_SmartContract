// src/features/admin/components/UserManagementTable.tsx
import { useMemo, useState, useEffect } from "react";
import { Card, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Edit, Loader2 } from "lucide-react";
import type { PlatformConfig } from "../types";
import api from '@/lib/api';
import { useAdminActions } from '../hooks/useAdminActions';
import { isAddress } from "viem"; // address checker from viem
import { is } from "date-fns/locale";

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
  const {
    deployFactoryContract, contractAddress, isDeploying,
    deploymUSDCContract, recordDeployment, mintUSDC, mintHash } = useAdminActions();
  const [editDialog, setEditDialog] = useState({ open: false, type: '', data: null });
  const [inputValue, setInputValue] = useState("");
  const [contractType, setContractType] = useState("");
  const configMap = useMemo(() => configsToMap(configs), [configs]);

  const [formData, setFormData] = useState({ address: "", mint: "" });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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

  const handleDeployment = async (type: string) => {
    setContractType(type);
    console.log("Starting deployment for type:", type);
    console.log("Current contractType state:", contractType);
    // Call deployment function based on type
    if (type === "PROJECT_FACTORY_ADDRESS") {
      console.log("Deploying Factory Contract...");
      await deployFactoryContract();
    } else if (type === "MOCK_USDC_CONTRACT_ADDRESS") {
      console.log("Deploying Mocked USDC Contract...");
      await deploymUSDCContract();
    }
  };

  const removeValue = async (key: string) => {
    try {
      const response = await api.patch(`/admin/configs/${key}`);
      if (response.status !== 200) throw new Error("Failed to remove configuration");
      onDataUpdate();
    } catch (error) {
      console.error(error);
    }
  };

  const handleMint = async () => {
    console.log("Minting USDC to address:", formData.address, "Amount:", formData.mint);
    const recipientAddress = formData.address;
    const amount = formData.mint;
    const usdcAddress = configMap["MOCK_USDC_CONTRACT_ADDRESS"];

    if (!isAddress(recipientAddress) || !amount || parseFloat(amount) <= 0) {
      alert("Please check recipient and amount");
      return;
    }
    await mintUSDC(usdcAddress as `0x${string}`, recipientAddress as `0x${string}`, amount);
  };

  useEffect(() => {
    if (contractAddress) {
      console.log("Recording deployed contract address:", contractAddress);
      recordDeployment(contractType, contractAddress);
      setContractType("");
      onDataUpdate();
    }
  }, [contractAddress]);

  useEffect(() => {
    if (mintHash) {
      console.log("Mint transaction sent! Hash:", mintHash);
      setFormData({ address: '', mintAmount: '' });
      alert('Mint successful!');
    }
  }, [mintHash]);

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
          <div className="p-3 border rounded-lg justify-between flex">
            <div>
              <div className="text-primary font-bold text-lg">Platform Factory Contract</div>
              {isAddress(configMap["PROJECT_FACTORY_ADDRESS"]) ? <div className="text-md text-muted-foreground font-bold">{configMap["PROJECT_FACTORY_ADDRESS"]}</div> : <div className="text-lg font-bold">Not Deployed</div>}
            </div>
            {!isAddress(configMap["PROJECT_FACTORY_ADDRESS"]) ?
              <Button variant="ghost" className="bg-emerald-600/20 text-emerald-700 hover:text-emerald-950 w-30 h-10 " onClick={() => handleDeployment("PROJECT_FACTORY_ADDRESS")}>
                {isDeploying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deploying... Check Wallet
                  </>
                ) : ("Deploy Factory Contract")}
              </Button> :
              <Button variant="ghost" className="bg-emerald-600/20 text-emerald-700 hover:text-emerald-950 w-30 h-10 " onClick={() => removeValue("PROJECT_FACTORY_ADDRESS")}>
                <Edit className="h-6 w-6" /> Remove
              </Button>}
          </div>
          <div className="p-3 border rounded-lg grid gap-4 grid-cols-2  ">
            <div>
              <div className="text-primary font-bold text-lg">Mocked USDC</div>
              {isAddress(configMap["MOCK_USDC_CONTRACT_ADDRESS"]) ? <div className="text-md text-muted-foreground font-bold">{configMap["MOCK_USDC_CONTRACT_ADDRESS"]}</div> : <div className="text-lg font-bold">Not Deployed</div>}
              {isAddress(configMap["MOCK_USDC_CONTRACT_ADDRESS"]) &&
                <div className="flex mt-4">
                  <Input
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder={`Enter recipient address for minting USDC`}
                  />
                  <Input
                    value={formData.mint}
                    onChange={(e) => handleInputChange("mint", e.target.value)}
                    placeholder={`Enter minted USDC amount`}
                    className="ml-2"
                  />
                  <Button className="ml-2" onClick={handleMint} disabled={!isAddress(formData.address) || !formData.mint}>
                    Mint
                  </Button>
                </div>
              }
            </div>
            {!isAddress(configMap["MOCK_USDC_CONTRACT_ADDRESS"]) ?
              <Button variant="ghost" className="bg-emerald-600/20 text-emerald-700 hover:text-emerald-950 w-30 h-10 " onClick={() => handleDeployment("MOCK_USDC_CONTRACT_ADDRESS")}>
                {isDeploying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deploying... Check Wallet
                  </>
                ) : ("Deploy Mocked USDC Contract")}
              </Button> :
              <div className="justify-self-end gap-4 flex">
                <Button variant="ghost" className="bg-emerald-600/20 text-emerald-700 hover:text-emerald-950 w-30 h-10 " onClick={() => removeValue("MOCK_USDC_CONTRACT_ADDRESS")}>
                  <Edit className="h-6 w-6" /> Remove
                </Button>
                <Button variant="ghost" className="bg-gray-100 text-emerald-700 hover:text-emerald-950 w-10 h-10" onClick={() => handleEdit('Mocked USDC', "MOCK_USDC_CONTRACT_ADDRESS")}>
                  <Edit className="h-6 w-6" />
                </Button>
              </div>}
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