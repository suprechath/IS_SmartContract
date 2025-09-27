// src/features/admin/hooks/useAdminActions.ts
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useSendTransaction, useWaitForTransactionReceipt, useWriteContract} from 'wagmi';
import { parseUnits } from 'viem';
import { abi as mUSDCAbi } from '@/abi/MockedUSDC.sol/MockedUSCD.json';

export const useAdminActions = () => {
    const [projectSearch, setProjectSearch] = useState("");
    const [userSearch, setUserSearch] = useState("");

    const { data: hash, error, isPending, sendTransaction } = useSendTransaction();
    const { data: mintHash, writeContract } = useWriteContract();
    const { data: receipt } = useWaitForTransactionReceipt({ hash: hash || mintHash });

    const reviewProject = async (
        projectId: string,
        status: 'Approved' | 'Rejected',
        onSuccess: () => void
    ) => {
        try {
            const payload = { projectId, status };
            const response = await api.post('/admin/projects/review', payload);
            if (response.status === 200) {
                alert(`Project has been ${status.toLowerCase()}.`);
            }
            onSuccess();
        } catch (error: any) {
            console.error(`Failed to ${status.toLowerCase()} project`, error);
            alert(error.response?.data?.message || 'An unexpected error occurred.');
        }
    };

    const reviewUser = async (
        id: string,
        sanction_status: 'Verified' | 'Rejected',
        onSuccess: () => void
    ) => {
        try {
            const payload = { id, sanction_status };
            const response = await api.post('/admin/verify-user', payload);
            if (response.status === 200) {
                alert(`User has been ${sanction_status.toLowerCase()}.`);
            }
            onSuccess();
        } catch (error: any) {
            console.error(`Failed to ${sanction_status.toLowerCase()} user`, error);
            alert(error.response?.data?.message || 'An unexpected error occurred.');
        }
    };

    const exportData = (type: 'projects' | 'users') => {
        console.log(`Exporting ${type} data...`);
        alert(`Exporting ${type} data... (feature coming soon)`);
    };

    const deployFactoryContract = async () => {
        try {
            console.log("Preparing to deploy factory contract...");
            const response = await api.post("/admin/deploy-factory/prepare", {});
            // console.log("Received response from server:", response);
            const { unsignedTx } = response.data.data;
            console.log("Unsigned transaction data:", unsignedTx);
            if (!unsignedTx) {
                throw new Error("No unsigned transaction received from the server.");
            }
            //Wagmi's sendTransaction requires a serialized transaction
            // const serializedTx = parseTransaction(unsignedTx);
            sendTransaction(unsignedTx);
        } catch (apiError) {
            console.error("Failed to prepare or send transaction:", apiError);
            console.error("Error details:", error);
        }
    };

    const deploymUSDCContract = async () => {
        try {
            console.log("Preparing to deploy mUSDC contract...");
            const response = await api.post("/admin/deploy-mUSDC/prepare", {});
            // console.log("Received response from server:", response);
            const { unsignedTx } = response.data.data;
            console.log("Unsigned transaction data:", unsignedTx);
            if (!unsignedTx) {
                throw new Error("No unsigned transaction received from the server.");
            }
            //Wagmi's sendTransaction requires a serialized transaction
            // const serializedTx = parseTransaction(unsignedTx);
            sendTransaction(unsignedTx);
        } catch (apiError) {
            console.error("Failed to prepare or send transaction:", apiError);
            console.error("Error details:", error);
        }
    };

    const recordDeployment = async (contractType: string, contractAddress: string) => {
        try {
            console.log(`Recording deployment for ${contractType} at address ${contractAddress}...`);
            let response;
            if (contractType === "PROJECT_FACTORY_ADDRESS") {
                response = await api.post("/admin/deploy-factory/record", { factoryAddress: contractAddress });
            } else if (contractType === "MOCK_USDC_CONTRACT_ADDRESS") {
                const payload = { recordKey: contractType, address: contractAddress };
                response = await api.post("/admin/deploy/record", payload);
            }
            if (response && response.status === 200) {
                console.log(`${contractType} address recorded successfully.`);
            } else {
                console.error(`Failed to record ${contractType} address.`);
            }
        } catch (error) {
            console.error(`Error recording ${contractType} address:`, error);
        }
    };

    const mintUSDC = async (tokenAddress: `0x${string}`, recipientAddress: `0x${string}`, amount: string) => {
        try {
            const amountInSmallestUnit = parseUnits(amount, 6); // Assuming 6 decimals for USDC
            writeContract({
                address: tokenAddress,
                abi: mUSDCAbi,
                functionName: 'mint',
                args: [recipientAddress, amountInSmallestUnit],
            });
        } catch (e) {
            console.error("Error preparing mint transaction:", e);
            alert("Failed to prepare mint transaction. See console for details.");
        }
    };

    useEffect(() => {
        if (hash) {
            console.log('Transaction sent! Hash:', hash);
        }
        if (receipt) {
            console.log('Transaction confirmed! Receipt:', receipt);
            console.log('Deployed Contract Address:', receipt.contractAddress);
        }
        if (mintHash) {
             console.log('Mint transaction sent! Hash:', mintHash);
        }
    }, [hash, receipt, mintHash]);

    return {
        projectSearch,
        setProjectSearch,
        userSearch,
        setUserSearch,
        reviewProject,
        reviewUser,
        exportData,
        deployFactoryContract,
        receipt,
        contractAddress: receipt?.contractAddress,
        isDeploying: isPending,
        deploymUSDCContract,
        recordDeployment,
        mintUSDC,
        mintHash
    };
};