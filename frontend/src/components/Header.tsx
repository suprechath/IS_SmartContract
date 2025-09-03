'use client';

import React, { useState } from 'react';
import ConnectWalletModal from './ConnectWalletModal';
import Link from 'next/link';
import Image from 'next/image';

const Header = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const handleConnectWallet = () => {
    // In a real app, this would involve connecting to a wallet provider like MetaMask.
    // For now, we'll just simulate the connection.
    setIsConnected(true);
    setIsModalOpen(false);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setIsProfileDropdownOpen(false);
  };

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center">
              <Image src="https://via.placeholder.com/40" alt="Resync Logo" width={40} height={40} className="h-10 w-10" />
              <span className="ml-2 text-xl font-bold text-gray-800">Resync</span>
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link href="/projects" className="text-gray-600 hover:text-gray-900 font-medium">Browse Projects</Link>
              <Link href="/#portfolio" className="text-gray-600 hover:text-gray-900 font-medium">My Portfolio</Link>
              <Link href="/how-it-works" className="text-gray-600 hover:text-gray-900 font-medium">How It Works</Link>
              <Link href="/faq" className="text-gray-600 hover:text-gray-900 font-medium">FAQ</Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <button id="notification-btn" className="p-2 text-gray-500 hover:text-gray-700 relative">
              <i className="fas fa-bell text-xl"></i>
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
            </button>
            {!isConnected ? (
              <button onClick={() => setIsModalOpen(true)} id="connect-wallet-btn" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <i className="fas fa-wallet mr-2"></i>
                Connect Wallet
              </button>
            ) : (
              <div id="wallet-connected" className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium">
                  <span id="wallet-address">0x1a2...3b4c</span>
                  <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">Ethereum</span>
                </span>
                <div className="relative">
                  <button onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)} id="profile-btn" className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <i className="fas fa-user text-gray-600"></i>
                  </button>
                  {isProfileDropdownOpen && (
                    <div id="profile-dropdown" className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</a>
                      <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
                      <button onClick={handleDisconnect} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Disconnect</button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
      <ConnectWalletModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConnect={handleConnectWallet} />
    </>
  );
};

export default Header;
