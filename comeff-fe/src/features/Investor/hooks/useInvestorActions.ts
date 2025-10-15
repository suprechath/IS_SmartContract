import { useWriteContract, usePublicClient } from 'wagmi';
import { Address, parseEventLogs } from 'viem';
import api from '@/lib/api';
import { useState } from 'react';

import ProjectManagementABI from '@/abi/ProjectManagement.sol/ProjectManagement.json';

export const useInvestorActions = () => {
  const [isPending, setIsPending] = useState(false);
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  const claimRewards = async (projectId: string, contractAddress: Address) => {
    setIsPending(true);
    console.log('Claiming rewards for project ID:', projectId, 'using contract:', contractAddress);
    if (!publicClient) {
      throw new Error('Public client not available');
    }
    try {
      const txHash = await writeContractAsync({
        address: contractAddress,
        abi: ProjectManagementABI.abi,
        functionName: 'claimReward',
      });
      console.log('Transaction hash:', txHash);

      const claimRewardsReceipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
      });
      console.log('Transaction confirmed:', claimRewardsReceipt);
      if (claimRewardsReceipt.status !== 'success') {
        throw new Error('Transaction failed');
      }

      const logs = parseEventLogs({
        abi: ProjectManagementABI.abi,
        logs: claimRewardsReceipt.logs,
        eventName: 'RewardClaimed',
      });
      const amount = logs[0]?.args.amount;

      await api.post('/transactions/record', {
        project_onchain_id: projectId,
        USDC_amount: amount.toString(),
        transaction_type: "RewardClaim",
        transaction_hash: claimRewardsReceipt.transactionHash.toString(),
      });

      window.open(`https://sepolia-optimism.etherscan.io/tx/${claimRewardsReceipt.transactionHash}`, '_blank');
      alert('Rewards claimed successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Error claiming rewards:', error);
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  const refundInvestment = async (projectId: string, contractAddress: Address) => {
    setIsPending(true);
    console.log('Refunding investment for project ID:', projectId, 'using contract:', contractAddress);
    if (!publicClient) {
      throw new Error('Public client not available');
    }
    try {
      const txHash = await writeContractAsync({
        address: contractAddress,
        abi: ProjectManagementABI.abi,
        functionName: 'claimRefund',
      });
      console.log('Transaction hash:', txHash);
      const refundReceipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
      });
      console.log('Transaction confirmed:', refundReceipt);
      if (refundReceipt.status !== 'success') {
        throw new Error('Transaction failed');
      }
      const logs = parseEventLogs({
        abi: ProjectManagementABI.abi,
        logs: refundReceipt.logs,
        eventName: 'Refunded',
      });
      const amount = logs[0]?.args.amount;
      await api.post('/transactions/record', {
        project_onchain_id: projectId,
        USDC_amount: amount.toString(),
        transaction_type: "Refund",
        transaction_hash: refundReceipt.transactionHash.toString(),
      });
      window.open(`https://sepolia-optimism.etherscan.io/tx/${refundReceipt.transactionHash}`, '_blank');
      alert('Investment refunded successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Error refunding investment:', error);
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  return {
    claimRewards,
    refundInvestment,
    isClaiming: isPending,
  };
};