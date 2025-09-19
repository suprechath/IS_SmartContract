// src/contexts/Web3Provider.tsx
'use client';

import React, { ReactNode, useEffect, useRef } from 'react';
import { WagmiProvider, useAccount, useDisconnect } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '@/lib/web3/wagmi';

const queryClient = new QueryClient();

function AccountChangeHandler({ children }: { children: ReactNode }) {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const previousAddress = useRef(address);

  useEffect(() => {
    if (previousAddress.current && address !== previousAddress.current) {
      console.log('Wallet changed, disconnecting...');
      disconnect();
    }
    previousAddress.current = address;
  }, [address, disconnect]);

  return <>{children}</>;
}

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AccountChangeHandler>
          {children}
        </AccountChangeHandler>
      </QueryClientProvider>
    </WagmiProvider>
  );
}