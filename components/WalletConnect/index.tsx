"use client"

import React, { useState, useEffect } from 'react';
import { Wallet, ChevronDown, Copy, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WalletConnect() {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Mock wallet connection
  const connectWallet = async () => {
    setIsConnecting(true);
    
    // Simulate wallet connection delay
    setTimeout(() => {
      const mockAddress = '0x' + Math.random().toString(36).substr(2, 16);
      setWalletAddress(mockAddress);
      setIsConnected(true);
      setIsConnecting(false);
    }, 1500);
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setWalletAddress('');
    setShowDropdown(false);
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    // Could add a toast notification here
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="relative">
      {!isConnected ? (
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="px-4 py-2 bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-black font-semibold rounded-lg hover:shadow-lg hover:shadow-[#00ff88]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isConnecting ? (
            <>
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Wallet className="w-4 h-4" />
              Connect Wallet
            </>
          )}
        </button>
      ) : (
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="px-4 py-2 bg-black/60 border border-gray-700 text-white font-semibold rounded-lg hover:border-gray-600 transition-all flex items-center gap-2"
          >
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            {formatAddress(walletAddress)}
            <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-64 bg-black/90 backdrop-blur-xl border border-gray-800 rounded-xl shadow-2xl z-50"
              >
                <div className="p-4 border-b border-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Connected Wallet</span>
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  </div>
                  <p className="font-mono text-sm text-white mb-3">{walletAddress}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={copyAddress}
                      className="flex-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      Copy
                    </button>
                    <button className="flex-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors flex items-center justify-center gap-1">
                      <ExternalLink className="w-3 h-3" />
                      Explorer
                    </button>
                  </div>
                </div>
                
                <div className="p-2">
                  <button
                    onClick={disconnectWallet}
                    className="w-full px-3 py-2 text-left text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm"
                  >
                    Disconnect Wallet
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
