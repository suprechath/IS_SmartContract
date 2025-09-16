// src/features/auth/components/WalletConnectButton.tsx
'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { Wallet } from 'lucide-react';

const baseButtonStyles =
  'inline-flex items-center justify-center w-48 h-9 rounded-md px-4 font-semibold shadow-lg transition-all duration-200';

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
          className={`${baseButtonStyles} bg-red-500 text-white hover:bg-red-600`}
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: injected() })}
      className={`${baseButtonStyles} bg-[linear-gradient(135deg,_hsl(158,64%,25%),_hsl(158,45%,45%))] text-zinc-50 hover:scale-105`}
    >
      <Wallet className="mr-2" size={25} />
      Connect Wallet
    </button>
  );
}