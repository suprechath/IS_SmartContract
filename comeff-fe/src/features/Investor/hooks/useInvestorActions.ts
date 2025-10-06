import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Address } from 'viem';
import { useEffect } from 'react';

import ProjectManagementABI  from '@/abi/ProjectManagement.sol/ProjectManagement.json';

export const useInvestorActions = () => {
  const {
    data: hash,
    error: writeError,
    isPending: isClaiming,
    writeContract,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isConfirmed) {
      alert('Rewards claimed successfully!');
      window.location.reload();
    }
    if (writeError || receiptError) {
        alert(`Error: ${writeError?.message || receiptError?.message}`); // Simple alert for user feedback
    }
  }, [isConfirmed, writeError, receiptError]);

  const claimRewards = (contractAddress: Address) => {
    writeContract({
      address: contractAddress,
      abi: ProjectManagementABI.abi,
      functionName: 'claimReward',
    });
  };

  return {
    claimRewards,
    isClaiming: isClaiming || isConfirming,
    isConfirmed,
    error: writeError || receiptError,
    hash,
  };
};