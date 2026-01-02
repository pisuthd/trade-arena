"use client"

import React, { useState } from 'react';
import { X, Wallet, TrendingUp, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDepositToVault, useUserUSDCBalance, formatUSDC } from '@/hooks/useSeasonManager';
import { useCurrentAccount } from '@mysten/dapp-kit';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  modelName: string;
  modelEmoji: string;
  vaultInfo: {
    tvl: number;
    depositors: number;
    apy: number;
    minDeposit: number;
  };
}

export default function DepositModal({ isOpen, onClose, modelName, modelEmoji, vaultInfo }: DepositModalProps) {
  const [step, setStep] = useState(1);
  const [depositAmount, setDepositAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [txDigest, setTxDigest] = useState('');
  const [error, setError] = useState('');
  
  const currentAccount = useCurrentAccount();
  const { depositToVault } = useDepositToVault();
  const { data: userBalance } = useUserUSDCBalance();
  
  const minDeposit = vaultInfo.minDeposit;
  const amount = parseFloat(depositAmount) || 0;
  const isWalletConnected = !!currentAccount;
  const userUSDCBalance = userBalance ? parseFloat(formatUSDC(parseInt(userBalance.totalBalance))) : 0;

  const handleDeposit = async () => {
    if (!currentAccount || amount < minDeposit) return;
    
    setIsProcessing(true);
    setError('');
    try {
      // Use contract name for the transaction, but display name for UI
      const contractModelName = modelName; // The season page now passes contract name
      console.log("Depositing to contract model:", contractModelName);
      
      const result = await depositToVault(2, contractModelName, amount);
      setIsProcessing(false);
      setIsComplete(true);
      setTxDigest(result.digest || '');
      setStep(3);
    } catch (error) {
      setIsProcessing(false);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Deposit failed:', error);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setStep(1);
      setDepositAmount('');
      setIsComplete(false);
      onClose();
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-gray-900 border border-gray-800 rounded-2xl max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                <img 
                  src={
                    modelName === 'NOVA' ? '/amazon-nova.png' :
                    modelName === 'CLAUDE' ? '/claude-icon.png' :
                    modelName === 'LLAMA' ? '/llama-icon.png' :
                    '/amazon-nova.png' // fallback
                  }
                  alt={modelName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold">Deposit to {modelName}</h3> 
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isProcessing}
              className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Step 1: Amount Selection */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium">Deposit Amount (USDC)</label>
                    <div className="text-sm text-gray-400">
                      Balance: {formatCurrency(userUSDCBalance)}
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder={`Min: ${minDeposit}`}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff88] transition-colors"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex space-x-2">
                      <button
                        onClick={() => setDepositAmount(String(minDeposit))}
                        className="text-xs px-2 py-1 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
                      >
                        Min
                      </button>
                      <button
                        onClick={() => setDepositAmount('1000')}
                        className="text-xs px-2 py-1 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
                      >
                        1K
                      </button>
                      <button
                        onClick={() => setDepositAmount('5000')}
                        className="text-xs px-2 py-1 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
                      >
                        5K
                      </button>
                    </div>
                  </div>
                  {amount > 0 && amount < minDeposit && (
                    <p className="text-red-400 text-sm mt-2 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      Minimum deposit is {formatCurrency(minDeposit)}
                    </p>
                  )}
                  {amount > userUSDCBalance && (
                    <p className="text-red-400 text-sm mt-2 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      Insufficient balance. You have {formatCurrency(userUSDCBalance)}
                    </p>
                  )}
                  {userUSDCBalance < minDeposit && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mt-3">
                      <p className="text-yellow-400 text-sm text-center">
                        You need mock USDC to deposit. Get some from the Portfolio page faucet first.
                      </p>
                    </div>
                  )}
                </div>
 

                <button
                  onClick={() => setStep(2)}
                  disabled={amount < minDeposit || amount > userUSDCBalance}
                  className="w-full bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-black font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </motion.div>
            )}

            {/* Step 2: Wallet Connection */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Wallet className="w-8 h-8 text-[#00ff88]" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2">Connect Your Wallet</h4>
                  <p className="text-gray-400 text-sm">
                    Connect your Sui wallet to complete the deposit of {formatCurrency(amount)}
                  </p>
                </div>

                {!isWalletConnected ? (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    <p className="text-yellow-400 text-sm text-center">
                      Please connect your wallet using the Connect Wallet button in the navbar
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <div>
                        <p className="font-semibold text-green-400">Wallet Connected</p>
                        <p className="text-sm text-gray-400">{formatAddress(currentAccount?.address || '')}</p>
                      </div>
                    </div>

                    {error && (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                        <p className="text-red-400 text-sm">{error}</p>
                      </div>
                    )}
                    
                    <button
                      onClick={handleDeposit}
                      disabled={isProcessing}
                      className="w-full bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-black font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <span>Confirm Deposit</span>
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 3: Success */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6"
              >
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2">Deposit Successful!</h4>
                  <p className="text-gray-400">
                    You've successfully deposited {formatCurrency(amount)} to the {modelName} vault
                  </p>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4 space-y-2 text-left">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Transaction Hash</span>
                    <span className="font-mono text-xs">
                      {txDigest ? `${txDigest.slice(0, 8)}...${txDigest.slice(-6)}` : 'Processing...'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Your Share</span>
                    <span className="font-semibold">{((amount / (vaultInfo.tvl + amount)) * 100).toFixed(2)}%</span>
                  </div>
                </div>

                <button
                  onClick={handleClose}
                  className="w-full bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-black font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Done
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
