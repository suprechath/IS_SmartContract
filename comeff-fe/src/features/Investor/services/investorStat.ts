import { Transactions } from '../types';
import { formatUnits } from 'viem';

export function calculateInvestorStats (Transactions: Transactions[]) {
    const totalInvested =
        Transactions.filter(tx => tx.transaction_type === 'Investment')
            .reduce((acc, tx) => acc + Number(formatUnits(BigInt(tx.usdc_amount),6)), 0)
        -
        Transactions.filter(tx => tx.transaction_type === 'Refund')
            .reduce((acc, tx) => acc + Number(formatUnits(BigInt(tx.usdc_amount),6)), 0);
    
    const totalRewardsClaimed =
        Transactions.filter(tx => tx.transaction_type === 'RewardClaim')
            .reduce((acc, tx) => acc + Number(formatUnits(BigInt(tx.usdc_amount),6)), 0);

    const activeInvestments = Array.from(new Set(
        Transactions
            .filter(tx => tx.transaction_type === 'Investment' && (tx.project_status === 'Funding' || tx.project_status === 'Active' || tx.project_status === 'Succeeded'))
            .map(tx => tx.project_onchain_id)
    )).length;
    return { totalInvested, totalRewardsClaimed, activeInvestments };
}

export function calculateMyRefund (walletAddress: string ,Transactions: Transactions[]) {
    const totalMyInvested =
        Transactions.filter(tx => tx.transaction_type === 'Investment')
            .filter(tx => tx.wallet_address === walletAddress)
            .reduce((acc, tx) => acc + Number(formatUnits(BigInt(tx.usdc_amount),6)), 0);
    return totalMyInvested;
}

