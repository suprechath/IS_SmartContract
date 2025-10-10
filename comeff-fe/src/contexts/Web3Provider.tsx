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
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('jwt_expires_at');
      localStorage.removeItem('user');
      document.cookie = 'jwt_token=; jwt_expires_at=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
      disconnect();
      window.location.reload();
    }
    previousAddress.current = address;
  }, [address]);

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