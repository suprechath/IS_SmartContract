import { useState } from "react";
import { useAccount, useWriteContract, useSendTransaction } from "wagmi";
import { parseUnits, isAddress, formatUnits } from "viem";

import { Project } from "../types";
import api from "@/lib/api";
import MockedUSDCABI from '../../../abi/MockedUSDC.sol/MockedUSCD.json';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";

interface InvestModalProps {
    project: Project;
    isOpen: boolean;
    onClose: () => void;
}

type StatusStep = 'idle' | 'checking' | 'approving' | 'sending' | 'success' | 'error';

export const InvestModal = ({ project, isOpen, onClose }: InvestModalProps) => {
    const [amount, setAmount] = useState('');
    const [status, setStatus] = useState<StatusStep>('idle');
    const [error, setError] = useState<string | null>(null);
    const [txHash, setTxHash] = useState<string | null>(null);

    const availableFunding = project.funding_usdc_goal - Number(formatUnits(BigInt(project.total_contributions), 6));



    const { address } = useAccount();
    const { writeContractAsync } = useWriteContract();
    const { sendTransactionAsync } = useSendTransaction();

    const resetState = () => {
        setStatus('idle');
        setError(null);
        setAmount('');
    }

    const handleClose = () => {
        resetState();
        onClose();
        if (status === 'success') {
            window.location.reload();
        }
    };

    const handleInvest = async () => {
        if (!address || !amount) {
            setError("Please connect your wallet and enter an amount.");
            return;
        }
        if (Number(amount) > availableFunding) {
            setError(`Amount exceeds available funding (${availableFunding} USDC).`);
            return;
        }

        setStatus('checking');
        setError(null);

        try {
            await new Promise(resolve => setTimeout(resolve, 200)); // delay to get token
            console.log('Project ID:', project.id);
            console.log('Investment Amount:', amount);
            const investCheckResponse = await api.post('/investments/check', {
                projectId: project.onchain_id,
                amount: Number(amount),
            });

            const { unsignedTx, management_contract_address, usdc_address, amount: finalAmount } = investCheckResponse.data.data;
            // console.log('Unsigned Transaction:', investCheckResponse.data.data);
            if (!isAddress(management_contract_address) || !isAddress(usdc_address)) {
                throw new Error("Invalid contract address received from server.");
            }

            // Approve USDC Spend
            setStatus('approving');
            const amountInWei = parseUnits(finalAmount.toString(), 6); // USDC typically has 6 decimals

            const approveHash = await writeContractAsync({
                address: usdc_address,
                abi: MockedUSDCABI.abi,
                functionName: 'approve',
                args: [management_contract_address, amountInWei],
            });

            // Send the Investment Transaction
            setStatus('sending');
            const investHash = await sendTransactionAsync({
                to: unsignedTx.to,
                data: unsignedTx.data,
                value: BigInt(unsignedTx.value || 0),
            });

            setTxHash(investHash);
            setStatus('success');

        } catch (err: any) {
            console.error("Investment failed:", err);
            const errorMessage = err.response?.data?.message || err.shortMessage || err.message || "An unknown error occurred.";
            setError(errorMessage);
            setStatus('error');
        }
    };

    const isLoading = status === 'checking' || status === 'approving' || status === 'sending';

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Invest in {project.title}</DialogTitle>
                    <DialogDescription>
                        Enter the amount of USDC you wish to invest.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {status !== 'success' && (
                        <div className="flex items-center space-x-2">
                            <Input
                                id="amountInput"
                                type="number"
                                placeholder={`1,000`}
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                disabled={isLoading}
                            />
                            <span className="font-semibold text-muted-foreground">USDC</span>
                        </div>
                    )}

                    {status === 'idle' && (
                        <Button onClick={handleInvest} disabled={!amount} className="w-full">
                            Proceed with Investment
                        </Button>
                    )}

                    {isLoading && (
                        <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span>
                                {status === 'checking' && 'Validating investment...'}
                                {status === 'approving' && 'Please approve USDC spending in your wallet...'}
                                {status === 'sending' && 'Please confirm the investment in your wallet...'}
                            </span>
                        </div>
                    )}

                    {status === 'success' && (
                        <Alert variant="default">
                            <CheckCircle className="h-6 w-6" />
                            <AlertTitle>Investment Successful!</AlertTitle>
                            <AlertDescription>
                                Your transaction has been confirmed.
                                <a href={`https://optimistic.etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="underline ml-1">View on Etherscan</a>
                            </AlertDescription>
                        </Alert>
                    )}

                    {status === 'error' && error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-6 w-6" />
                            <AlertTitle>Investment Failed</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    
                    {status === 'idle' && amount && Number(amount) > availableFunding && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-6 w-6" />
                            <AlertTitle>Invalid Amount</AlertTitle>
                            <AlertDescription>
                                Amount exceeds available funding ({availableFunding} USDC).
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};