// src/features/auth/components/LoginButton.tsx
'use client';

import { use, useEffect, useState } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { useAuth } from '@/contexts/AuthProvider';

import { Button } from '@/components/ui/button';
import { Wallet, LogOut, Loader2 } from 'lucide-react';

export function LoginButton() {
  const { isConnected, address } = useAccount();
  const { connect, error: connectError } = useConnect();
  const { login, logout, token, isLoading, error, setError } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    // Check if the wallet has just been connected and we are in the "login" process.
    if (isConnected && address && isLoggingIn && !token) {
      const performLogin = async () => {
        console.log("Wallet connected with address:", address);
        await login();
        setIsLoggingIn(false);
      };
      performLogin();
    }
  }, [isConnected, token]);

  useEffect(() => {
    if (connectError) {
      if (connectError.message.includes('User rejected the request')) {
        console.log('User declined wallet connection.');
        alert('You need to connect your wallet to log in.');
      } else {
        console.error('Wallet connection failed:', connectError);
        alert('Failed to connect wallet. Please try again.');
      }
      setIsLoggingIn(false);
    }
  }, [connectError]);

  useEffect(() => {
    if (error) {
      console.error(error);
      alert(error);
      setIsLoggingIn(false);
    }
  }, [error]);

  const handleLoginClick = () => {
    setIsLoggingIn(true);
    if (!isConnected) {
      connect({ connector: injected() });
      // The useEffect will handle the login part after connection.
    } else {
      console.log("Wallet already connected with address:", address);
      login();
      setIsLoggingIn(false);
    }
  };

  const handleLogoutClick = () => {
    logout();
  };

  return (
    <>
      {token && isConnected ? (
        <Button
          variant="destructive"
          onClick={handleLogoutClick}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout ({address?.slice(0, 2)}...{address?.slice(-3)})
        </Button>
      ) : (
        <Button onClick={handleLoginClick} disabled={isLoading || isLoggingIn}>
          {isLoading || isLoggingIn ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wallet className="mr-2 h-4 w-4" />
          )}
          Login with Wallet
        </Button>
      )}
    </>
  );
}
