import { useState } from 'react';
import { useWriteContract } from 'wagmi';
import ProjectManagementABI from '../../../abi/ProjectManagement.sol/ProjectManagement.json';
import { BaseError } from 'viem';

export const useInvestorActions = (onActionSuccess?: () => void) => {
    const [isClaiming, setIsClaiming] = useState(false);
    const { writeContractAsync } = useWriteContract();

    const handleClaimRewards = async (managementContractAddress: string) => {
        setIsClaiming(true);
        // toast.loading("Sending transaction to claim rewards...");

        try {
            const hash = await writeContractAsync({
                address: managementContractAddress as `0x${string}`,
                abi: ProjectManagementABI.abi,
                functionName: 'claimReward',
                args: [], // Your contract's claimReward() might not need arguments.
            });

            // toast.success("Claim transaction successful!", {
            //     description: "Your rewards are on the way to your wallet.",
            //     action: {
            //         label: "View Tx",
            //         onClick: () => window.open(`https://optimism-sepolia.etherscan.io/tx/${hash}`, '_blank'),
            //     },
            // });

            // If a success callback is provided, call it.
            if (onActionSuccess) {
                onActionSuccess();
            }

        } catch (error) {
            console.error("Failed to claim rewards:", error);
            const errorMessage = error instanceof BaseError ? error.shortMessage : "An unexpected error occurred.";
            // toast.error("Failed to claim rewards", {
            //     description: errorMessage,
            // });
        } finally {
            setIsClaiming(false);
        }
    };

    return {
        isClaiming,
        handleClaimRewards,
    };
};