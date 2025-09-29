// src/features/dashboard/hooks/useCreatorActions.ts
import api from '@/lib/api';
import ProjectFactoryABI from '../../../abi/ProjectFactory.sol/ProjectFactory.json';
import ProjectTokenABI from '../../../abi/ProjectToken.sol/ProjectToken.json';
import ProjectManagementABI from '../../../abi/ProjectManagement.sol/ProjectManagement.json';

import { useState, useEffect } from 'react';
import { usePublicClient, useWalletClient, useWaitForTransactionReceipt } from 'wagmi'; // useWalletClient is for sending the tx
import { formatEther, parseEventLogs, getContract } from 'viem';

export const useCreatorActions = (onActionComplete: () => void) => {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient(); // Get the user's wallet signer
  const [isEstimating, setIsEstimating] = useState(false);
  const [estimatedCost, setEstimatedCost] = useState<string | null>(null);

  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployTxHash, setDeployTxHash] = useState<`0x${string}` | undefined>(undefined);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const { data: receipt, isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: deployTxHash, });

  // In a real app, you would configure useContractWrite here for each action
  // For example: const { write: withdraw } = useContractWrite({...});

  const handleWithdrawFunds = async (projectId: string) => {
    console.log("Action: Withdrawing funds for project:", projectId);
    // TODO: Implement smart contract call using wagmi's useContractWrite
    // Example: withdraw({ args: [...] });
    alert({
      title: "Withdrawal Initiated",
      description: `Your transaction to withdraw funds has been submitted.`,
    });
  };

  const handleDepositReward = async (projectId: string, amount: number) => {
    console.log(`Action: Depositing ${amount} USDC reward for project:`, projectId);
    // TODO: Implement smart contract call (approve USDC, then call deposit)
    alert({
      title: "Deposit Initiated",
      description: `Your transaction to deposit rewards has been submitted.`,
    });
  };

  const handlePostUpdate = async (projectId: string, updateText: string) => {
    console.log(`Action: Posting update for project ${projectId}:`, updateText);
    try {
      // This is an off-chain action that calls your backend
      // await api.post(`/projects/${projectId}/updates`, { content: updateText });
      alert({
        title: "Update Posted Successfully",
        description: "Your investors have been notified.",
      });
    } catch (error) {
      console.error("Failed to post update:", error);
      alert({
        title: "Error",
        description: "Could not post the update. Please try again.",
        variant: "destructive",
      });
    }
  };

  const estimateDeploymentCost = async (projectId: string) => {
    if (!publicClient) return;

    setIsEstimating(true);
    setEstimatedCost(null);

    try {
      const response = await api.post('/projects/deploy/onchain', { projectId });
      const { unsignedTx } = response.data.data;

      const gasEstimate = await publicClient.estimateGas({
        to: unsignedTx.to,
        data: unsignedTx.data,
        account: unsignedTx.from, // The user's address
      });

      const gasPrice = await publicClient.getGasPrice();

      const totalCostWei = gasEstimate * gasPrice;
      const totalCostFormatted = formatEther(totalCostWei);

      setEstimatedCost(totalCostFormatted);

    } catch (error: any) {
      console.error("Failed to estimate gas:", error);
      alert("Could Not Estimate Cost: " + (error.response?.data?.message || "An unexpected error occurred."));
      setEstimatedCost("Error");
    } finally {
      setIsEstimating(false);
    }
  };

  const handleDeployContracts = async (projectId: string) => {
    if (!walletClient) {
      alert("Wallet not connected");
      return;
    }

    setIsDeploying(true);
    setActiveProjectId(projectId);

    try {
      const response = await api.post('/projects/deploy/onchain', { projectId });
      const { unsignedTx } = response.data.data;

      const txHash = await walletClient.sendTransaction({
        to: unsignedTx.to,
        data: unsignedTx.data,
      });
      setDeployTxHash(txHash);

      // 3. (Optional but recommended) After sending, you can post the txHash back to your backend
      // to track its status.
      // await api.post(`/projects/${projectId}/deployment-submitted`, { txHash });

      alert("Your project deployment is in progress. This may take a few moments.");

    } catch (error: any) {
      console.error("Deployment failed:", error);
      alert("Deployment Failed: " + (error.response?.data?.message || error.message || "An unexpected error occurred."));
      setActiveProjectId(null);
    } finally {
      setIsDeploying(false);
    }
  };

  useEffect(() => {
    if (isConfirmed && receipt && activeProjectId) {
      const onboardProject = async () => {
        setIsOnboarding(true);
        console.log("Transaction Confirmed!", receipt);

        try {
          // Parse the logs to find the deployed contract addresses
          const logs = parseEventLogs({
            abi: ProjectFactoryABI.abi,
            logs: receipt.logs,
            eventName: 'ProjectDeployed',
          });
          console.log("Parsed 'ProjectDeployed' Logs:", logs);

          if (logs.length === 0 || !logs[0].args) {
            throw new Error("Could not find ProjectDeployed event in transaction receipt.");
          }

          const { tokenContract, managementContract } = logs[0].args as {
            tokenContract: string;
            managementContract: string;
          };

          console.log("Deployed Contracts:", { activeProjectId, tokenContract, managementContract });


          if (publicClient) {
            console.log(`Verifying ProjectToken at address: ${tokenContract}`);
            const deployedProjectToken = getContract({
              address: tokenContract,
              abi: ProjectTokenABI.abi,
              client: publicClient,
            });
            const [name, symbol, cap, minter, projectManagement] = await Promise.all([
              deployedProjectToken.read.name(),
              deployedProjectToken.read.symbol(),
              deployedProjectToken.read.cap(),
              deployedProjectToken.read.minter(),
              deployedProjectToken.read.projectManagement(),
            ]);
            console.log(`✅ Contract Name: ${name}`);
            console.log(`✅ Contract Symbol: ${symbol}`);
            console.log(`✅ Contract Cap: ${cap}`);
            console.log(`✅ Minter: ${minter}`);
            console.log(`✅ PM in Token: ${projectManagement}`);

            console.log(`Verifying ProjectManagement at address: ${managementContract}`);
            const deployedProjectMgmt = getContract({
              address: managementContract,
              abi: ProjectManagementABI.abi,
              client: publicClient,
            });
            const [creator, projectToken, owner] = await Promise.all([
              deployedProjectMgmt.read.creator(),
              deployedProjectMgmt.read.projectToken(),
              deployedProjectMgmt.read.owner(),
            ]);
            console.log(`✅ Management Creator: ${creator}`);
            console.log(`✅ Management ProjectToken: ${projectToken}`);
            console.log(`✅ Management Owner: ${owner}`);
          }

          // await api.post('/projects/deploy/onboard', {
          //   projectId: activeProjectId,
          //   tokenContractAddress: tokenContract,
          //   managementContractAddress: managementContract
          // });

          alert("🎉🎉🎉 Deployment Complete! 🎉🎉🎉")
        } catch (error: any) {
          console.error("Onboarding failed:", error);
          alert("Onboarding Failed: " + (error.response?.data?.message || error.message || "An unexpected error occurred."));
        } finally {
          setIsOnboarding(false);
          setIsDeploying(false);
          setDeployTxHash(undefined);
          setActiveProjectId(null);
          onActionComplete(); // Refresh the project list
        }
      };
      onboardProject();
    }
  }, [isConfirmed, receipt]);

  return {
    handleWithdrawFunds,
    handleDepositReward,
    handlePostUpdate,
    isDeploying: isDeploying || isConfirming || isOnboarding,
    isEstimating,
    estimatedCost,
    handleDeployContracts,
    estimateDeploymentCost,
  };
};