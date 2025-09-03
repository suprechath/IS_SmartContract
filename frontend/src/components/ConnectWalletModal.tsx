'use client';

import React from 'react';
import Image from 'next/image';

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: () => void;
}

const ConnectWalletModal: React.FC<ConnectWalletModalProps> = ({ isOpen, onClose, onConnect }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-50 z-50">
      <div className="modal-content bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">Connect Wallet</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="space-y-4">
          <button onClick={onConnect} className="w-full flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center">
              <Image src="https://via.placeholder.com/40?text=MM" alt="MetaMask" width={40} height={40} className="h-8 w-8 mr-3" />
              <span className="font-medium">MetaMask</span>
            </div>
            <i className="fas fa-chevron-right text-gray-400"></i>
          </button>
          <button onClick={onConnect} className="w-full flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center">
              <Image src="https://via.placeholder.com/40?text=WC" alt="WalletConnect" width={40} height={40} className="h-8 w-8 mr-3" />
              <span className="font-medium">WalletConnect</span>
            </div>
            <i className="fas fa-chevron-right text-gray-400"></i>
          </button>
          <button onClick={onConnect} className="w-full flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center">
              <Image src="https://via.placeholder.com/40?text=CB" alt="Coinbase Wallet" width={40} height={40} className="h-8 w-8 mr-3" />
              <span className="font-medium">Coinbase Wallet</span>
            </div>
            <i className="fas fa-chevron-right text-gray-400"></i>
          </button>
        </div>
        <div className="mt-6 text-center text-sm text-gray-500">
          By connecting a wallet, you agree to our <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.
        </div>
      </div>
    </div>
  );
};

export default ConnectWalletModal;
