"use client"

import React, { useState } from 'react';
import { Wallet, ChevronDown, Copy, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';

export default function WalletConnect() {
  const [showDropdown, setShowDropdown] = useState(false);
  const currentAccount = useCurrentAccount();

  const copyAddress = () => {
    if (currentAccount?.address) {
      navigator.clipboard.writeText(currentAccount.address);
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const openExplorer = () => {
    if (currentAccount?.address) {
      window.open(`https://testnet.suivision.xyz/address/${currentAccount.address}`, '_blank');
    }
  };

  // If not connected, show the ConnectButton
  if (!currentAccount) {
    return (
      <ConnectButton
        className="px-4 py-2 cursor-pointer bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-black font-semibold rounded-lg hover:shadow-lg hover:shadow-[#00ff88]/50 transition-all"
      />
    );
  }

  // If connected, show the custom dropdown with wallet info
  return (
    <div className="relative">
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="px-4 py-2 bg-black/60 border border-gray-700 text-white font-semibold rounded-lg hover:border-gray-600 transition-all flex items-center gap-2"
        >
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          {formatAddress(currentAccount.address)}
          <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {showDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-64 bg-black/90 backdrop-blur-xl border border-gray-800 rounded-xl shadow-2xl"
            >
              <div className="p-4  border-b border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Connected Wallet</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                </div>
                <p className="font-mono text-sm text-white mb-3 break-all">{formatAddress(currentAccount.address)}</p>
                <div className="flex gap-2">
                  <button
                    onClick={copyAddress}
                    className="flex-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    Copy
                  </button>
                  <button 
                    onClick={openExplorer}
                    className="flex-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Explorer
                  </button>
                </div>
              </div> 
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
