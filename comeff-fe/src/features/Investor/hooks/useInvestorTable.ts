import { useState, useEffect } from 'react';
import { Transactions } from '../types';
import { usePublicClient, useAccount } from 'wagmi';
import { formatUnits, getContract } from 'viem';

import { ProjectWithBalance } from '../types';
import ProjectTokenABI from '../../../abi/ProjectToken.sol/ProjectToken.json';
import ProjectManagementABI from '../../../abi/ProjectManagement.sol/ProjectManagement.json';
import MockedUSDCABI from '../../../abi/MockedUSDC.sol/MockedUSCD.json';

async function getTokensOwned(
    userAddress: string,
    tokenAddress: string,
    publicClient: any
): Promise<string | number> {
    if (!publicClient) return "Error: Public client not available";
    try {
        const tokensBalance = await publicClient.readContract({
            address: tokenAddress as `0x${string}`,
            abi: ProjectTokenABI.abi,
            functionName: 'balanceOf',
            args: [userAddress],
        });
        return tokensBalance;
    } catch (error) {
        console.error(`Error fetching token balance for ${tokenAddress}:`, error);
        return 'Error';
    }
}

async function getAvailableRewards(
    userAddress: string,
    managementAddress: string,
    publicClient: any
): Promise<string | number> {
    if (!publicClient) return "Error: Public client not available";
    try {
        const ProjectMgmtContract = getContract({
            address: managementAddress as `0x${string}`,
            abi: ProjectManagementABI.abi,
            client: publicClient,
        });
        const rewards = await ProjectMgmtContract.read.earned([userAddress]);
        // console.log("Calculated rewards:", rewards);
        return rewards;
    } catch (error) {
        console.error(`Error fetching available rewards for ${managementAddress}:`, error);
        return 'Error';
    }
}

export const useInvestorTable = (transactions:  Transactions[]) => {
    const [projects, setProjects] = useState<ProjectWithBalance[]>([]);
    const [selectedProject, setSelectedProject] = useState<ProjectWithBalance | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const publicClient = usePublicClient();
    const { address: userAddress } = useAccount();

    useEffect(() => {
        const processTransactions = async () => {
            if (!transactions || transactions.length === 0 || !publicClient || !userAddress) {
                setProjects([]);
                return;
            }

            setIsLoading(true);

            const projectMap = new Map<string, Omit<ProjectWithBalance, 'tokenBalance' | 'rewardsAvailable'>>();

            transactions.forEach(tx => {
                if (!projectMap.has(tx.project_onchain_id)) {
                    projectMap.set(tx.project_onchain_id, {
                        onchain_id: tx.project_onchain_id,
                        title: tx.project_title,
                        project_status: tx.project_status,
                        token_contract_address: tx.token_contract_address,
                        management_contract_address: tx.management_contract_address,
                    });
                }
            });

            const uniqueProjects = Array.from(projectMap.values());

            try {
                const results = await Promise.all(
                    uniqueProjects.map(async (project) => {
                        const [tokenBalance, rewardsAvailable] = await Promise.all([
                            getTokensOwned(userAddress, project.token_contract_address, publicClient),
                            getAvailableRewards(userAddress, project.management_contract_address, publicClient)
                        ]);
                        return {
                            ...project,
                            tokenBalance,
                            rewardsAvailable,
                        };
                    })
                );

                setProjects(results);
                if (results.length > 0) {
                    setSelectedProject(results[0]);
                }
            } catch (error) {
                console.error("Failed to fetch token balances:", error);
                // You could set an error state here to display in the UI
            } finally {
                setIsLoading(false);
            }
        };

        processTransactions();
    }, [transactions, publicClient]);

    return { projects, isLoading, selectedProject, setSelectedProject };
};