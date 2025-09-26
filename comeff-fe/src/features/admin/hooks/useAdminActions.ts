// src/features/admin/hooks/useAdminActions.ts
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';


export const useAdminActions = () => {
    const [projectSearch, setProjectSearch] = useState("");
    const [userSearch, setUserSearch] = useState("");

    const { data: hash, error, isPending, sendTransaction } = useSendTransaction();
    const {
        data: receipt,
    } = useWaitForTransactionReceipt({ hash });

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

    useEffect(() => {
        if (hash) {
            console.log('Transaction sent! Hash:', hash);
        }
        if (receipt) {
            console.log('Transaction confirmed! Receipt:', receipt);
            console.log('Deployed Contract Address:', receipt.contractAddress);
            // api.post("/admin/deploy-factory/record", {factoryAddress: receipt.contractAddress});
        }
    }, [hash, receipt]);



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
        isDeploying: isPending,
        deploymUSDCContract,
    };
};