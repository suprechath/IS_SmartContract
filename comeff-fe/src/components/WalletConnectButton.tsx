// src/features/auth/components/WalletConnectButton.tsx
'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { Wallet } from 'lucide-react';


export function WalletConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <div>
        {/* <p>Connected: {address?.slice(0, 6)}...{address?.slice(-4)}</p> */}
        <button
          onClick={() => disconnect()}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-1000"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: injected() })}
      className="bg-[linear-gradient(135deg,_hsl(158,64%,25%),_hsl(158,45%,45%))] text-zinc-50 hover:scale-105 transition-bounce font-semibold shadow-lg h-9 rounded-md px-3 inline-flex items-center"
    >
      <Wallet className="mr-2" size={25} />
      Connect Wallet
    </button>
  );
}