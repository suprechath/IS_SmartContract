// src/features/dashboard/hooks/useCreatorActions.ts
import api from '@/lib/api';
import ProjectFactoryABI from '../../../abi/ProjectFactory.sol/ProjectFactory.json';
import ProjectTokenABI from '../../../abi/ProjectToken.sol/ProjectToken.json';
import ProjectManagementABI from '../../../abi/ProjectManagement.sol/ProjectManagement.json';
import MockedUSDCABI from '../../../abi/MockedUSDC.sol/MockedUSCD.json';

import { useState, useEffect, use } from 'react';
import { usePublicClient, useWalletClient, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'; // useWalletClient is for sending the tx
import { formatEther, parseEventLogs, getContract, formatUnits, parseUnits } from 'viem';
import { set } from 'date-fns';

export const useCreatorActions = (onActionComplete: () => void) => {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient(); // Get the user's wallet signer
  const [isEstimating, setIsEstimating] = useState(false);
  const [estimatedCost, setEstimatedCost] = useState<string | null>(null);

  const { writeContractAsync, data: txHash, isPending: isSubmitting } = useWriteContract();

  // --- Deployment State ---
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployTxHash, setDeployTxHash] = useState<`0x${string}` | undefined>(undefined);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { data: receipt, isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: deployTxHash, });

  // --- Minting State ---
  const [mintTxHash, setMintTxHash] = useState<`0x${string}` | undefined>(undefined);
  const { data: mintReceipt, isSuccess: isMintConfirmed } = useWaitForTransactionReceipt({ hash: mintTxHash });

  // --- Withdraw Funds State ---\
  const [withdrawTxHash, setWithdrawTxHash] = useState<`0x${string}` | undefined>(undefined);
  const { data: withdrawReceipt, isSuccess: isWithdrawConfirmed } = useWaitForTransactionReceipt({ hash: withdrawTxHash });

  // --- Deposit Reward State ---
  const [depositPayload, setDepositPayload] = useState(null);
  const [approveTxHash, setApproveTxHash] = useState<`0x${string}` | undefined>(undefined);
  const [depositTxHash, setDepositTxHash] = useState<`0x${string}` | undefined>(undefined);
  const { data: depositReceipt, isSuccess: isDepositConfirmed } = useWaitForTransactionReceipt({ hash: depositTxHash });

  const createProject = async (projectData: any) => {
    setIsCreating(true);
    console.log("Creating project with data:", projectData);
    const configs = await api.get('/admin/configs');
    const usdcConfig = configs.data.data.find((config: any) => config.config_key === 'MOCK_USDC_CONTRACT_ADDRESS');
    const platformFeeConfig = configs.data.data.find((config: any) => config.config_key === 'FUNDING_FEE');
    const rewardFeeConfig = configs.data.data.find((config: any) => config.config_key === 'DIVIDEND_FEE');
    const payload = {
      ...projectData,
      usdc_contract_address: usdcConfig.config_value,
      platform_fee_percentage: platformFeeConfig.config_value,
      reward_fee_percentage: rewardFeeConfig.config_value
    };
    try {
      const response = await api.post('/projects', payload);
      if (response.status === 201) {
        alert('Project created successfully!');
        return true;
      }
    } catch (error: any) {
      console.error("Failed to create project:", error);
      alert(`Error: ${error.response?.data?.message || 'Could not create project.'}`);
      return false;
    } finally {
      setIsCreating(false);
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

          await api.post('/projects/deploy/onboard', {
            projectId: activeProjectId,
            tokenContractAddress: tokenContract,
            managementContractAddress: managementContract
          });

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

  const handleMintTokens = async (projectId: string, batchLimit: number = 2) => {
    console.log(`Preparing to mint tokens for project ${projectId} with batch limit ${batchLimit}`);
    if (!walletClient) {
      alert("Wallet not connected");
      return;
    }

    try {
      const response = await api.post('/projects/mint/prepare', {
        projectId: projectId,
        batchLimit: batchLimit
      });
      const { unsignedTx } = response.data.data;
      console.log("Received unsigned mint transaction:", unsignedTx);

      const txHash = await walletClient.sendTransaction({
        to: unsignedTx.to,
        data: unsignedTx.data,
      });

      setMintTxHash(txHash);
      alert("Token minting transaction sent! Please wait for confirmation.");
    } catch (error: any) {
      console.error("Token minting failed:", error);
      alert(`Token Minting Failed: ${error.response?.data?.message || error.message || "An unexpected error occurred."}`);
    }
  };

  useEffect(() => {
    const recordMintTransaction = async () => {
      if (isMintConfirmed && mintReceipt) {
        console.log("Minting Transaction Confirmed!", mintReceipt);
        try {
          await api.post('/transactions/record', {
            project_onchain_id: activeProjectId,
            USDC_amount: 0, // Or the actual amount if applicable
            transaction_type: 'TokenMint', // A specific type for minting
            transaction_hash: mintReceipt.transactionHash,
          });
          console.log("Minting transaction successfully recorded on the backend.");
        } catch (apiError: any) {
          // Handle potential API errors
          console.error("Failed to record minting transaction:", apiError);
          // Optionally, show an error to the user
          alert("Your token mint was successful, but there was an issue saving it to your transaction history.");
        }
        alert("✅ Token minting successful!");
        setMintTxHash(undefined);
        onActionComplete(); // Refresh project data to show updated token counts
      }
    };
    recordMintTransaction();
  }, [isMintConfirmed, mintReceipt, onActionComplete]);

  const handleWithdrawFunds = async (projectId: string) => {
    console.log("Action: Withdrawing funds for project:", projectId);
    const projectRes = await api.get(`projects/onchain/id/${projectId}`);
    console.log("Fetched on-chain project data:", projectRes.data);
    if (!projectRes.data.data.management_contract_address) {
      alert("Error fetching project on-chain data: " + projectRes.data.message);
      throw new Error("Could not find the smart contract address for this project.");
    }
    const managementContractAddress = projectRes.data.data.management_contract_address;
    console.log("Management Contract Address:", managementContractAddress);
    console.log("USDC Contract Address:", projectRes.data.data.usdc_contract_address);

    try {
      const usdcBalance = await publicClient.readContract({
        address: projectRes.data.data.usdc_contract_address,
        abi: [
          {
            "inputs": [{ "name": "account", "type": "address" }],
            "name": "balanceOf",
            "outputs": [{ "name": "", "type": "uint256" }],
            "stateMutability": "view",
            "type": "function"
          }
        ],
        functionName: 'balanceOf',
        args: [managementContractAddress],
      });
      const contractUSDCBalance = Number(formatUnits(usdcBalance as bigint, 6));
      console.log("On-chain Contract USDC Balance:", contractUSDCBalance);
      console.log("Funding Goal:", projectRes.data.data.funding_usdc_goal);
      if (projectRes.data.data.funding_usdc_goal - contractUSDCBalance >= 100) {
        alert("Raised fund was already withdrawn.");
        return;
      }
      const txHash = await writeContractAsync({
        address: managementContractAddress,
        abi: ProjectManagementABI.abi,
        functionName: 'withdrawFunds',
      });
      setWithdrawTxHash(txHash);
      alert("Your withdrawal transaction has been submitted. Please wait for confirmation.");
    } catch (error) {
      console.error("Failed to fetch on-chain USDC balance:", error);
    }
  };

  useEffect(() => {
    if (isWithdrawConfirmed && withdrawReceipt) {
      console.log("Withdrawal Transaction Confirmed!", withdrawReceipt);
      alert("✅ Withdrawal successful!");
      setWithdrawTxHash(undefined);
      onActionComplete(); // Refresh project data to show updated balances
    }
  }, [isWithdrawConfirmed, withdrawReceipt, onActionComplete]);

  const handleDepositReward = async (projectId: string, amount: number) => {
    console.log(`Action: Depositing ${amount} USDC reward for project:`, projectId);
    if (amount <= 0 || isNaN(amount) || !projectId) {
      alert("Please enter a valid amount greater than 0.");
      return;
    }
    const depositRes = await api.post('/deposits', { projectId, amount });
    // console.log("Deposit response:", depositRes);
    const { management_contract_address, usdc_address } = depositRes.data.data;
    setDepositPayload(depositRes.data.data);
    const amountInWei = parseUnits(amount.toString(), 6); // USDC uses 6 decimals
    console.log(`Depositing ${amount} USDC (${amountInWei} in wei) to management contract at ${management_contract_address}`);
    try {
      alert("Please approve the USDC spending in your wallet.");
      const approveTxHash = await writeContractAsync({
        address: usdc_address,
        abi: MockedUSDCABI.abi,
        functionName: 'approve',
        args: [management_contract_address, amountInWei],
      });
      console.log("Approval transaction hash:", approveTxHash);
      if (!approveTxHash) {
        alert("Approval transaction failed to send.");
        return;
      }
      setApproveTxHash(approveTxHash);
    } catch (error: any) {
      console.error("Error during the approval step:", error);
      alert("Approval Failed: " + (error.response?.data?.message || error.message || "An unexpected error occurred."));
    }
  };

  useEffect(() => {
    const depositReward = async () => {
      if (!depositPayload) {
        console.error("No deposit payload available.");
        return;
      }
      console.log("Deposit Payload:", depositPayload);
      if (!walletClient) {
        alert("Wallet not connected. Please connect your wallet.");
        return;
      }
      try {
        alert("Approval confirmed! Now sending the deposit transaction. Please confirm in your wallet.");
        const { unsignedTx } = depositPayload;
        // console.log("Received unsigned mint transaction:", unsignedTx);
        const txHash = await walletClient.sendTransaction({
          to: unsignedTx.to,
          data: unsignedTx.data,
        });
        console.log("Deposit transaction hash:", txHash);
        if (!txHash) {
          alert("Deposit transaction failed to send.");
          return;
        }
        setDepositTxHash(txHash);
        alert("Deposit transaction sent! Please wait for confirmation.");
      } catch (error: any) {
        console.error("Deposit transaction failed:", error);
        alert(`Deposit Failed: ${error.response?.data?.message || error.message || "An unexpected error occurred."}`);
        return;
      } finally {
        setApproveTxHash(undefined);
        setDepositPayload(null);
      }
    }
    if (approveTxHash) {
      depositReward();
    }
  }, [approveTxHash, onActionComplete]);

  useEffect(() => {
    if (isDepositConfirmed && depositReceipt) {
      console.log("Deposit Transaction Confirmed!", depositReceipt);
      alert("✅ Reward deposit successful!");
      setApproveTxHash(undefined);
      setDepositTxHash(undefined);
      onActionComplete(); // Refresh project data to show updated balances
    }
  }, [isDepositConfirmed, depositReceipt, onActionComplete]);

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

  return {
    handleWithdrawFunds,
    handleDepositReward,
    handlePostUpdate,
    isDeploying: isDeploying || isConfirming || isOnboarding,
    isEstimating,
    estimatedCost,
    handleDeployContracts,
    estimateDeploymentCost,
    createProject,
    isCreating,
    handleMintTokens,
  };
};