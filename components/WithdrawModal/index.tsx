"use client"

import React, { useState } from 'react';
import { X, Wallet, AlertCircle, CheckCircle, ArrowRight, TrendingDown, DollarSign, Bitcoin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWithdrawFromVault, useUserLPTokens, formatUSDC, formatBTC } from '@/hooks/useSeasonManager';
import { useCurrentAccount } from '@mysten/dapp-kit';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  modelName: string;
  modelEmoji: string;
  seasonNumber: number;
  vaultInfo: {
    usdc_balance: number;
    btc_balance: number;
    lp_shares: number;
  };
}

export default function WithdrawModal({ 
  isOpen, 
  onClose, 
  modelName, 
  modelEmoji, 
  seasonNumber,
  vaultInfo 
}: WithdrawModalProps) {
  const [step, setStep] = useState(1);
  const [selectedLPToken, setSelectedLPToken] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  const currentAccount = useCurrentAccount();
  const { withdrawFromVault } = useWithdrawFromVault();
  const { data: userLPTokens } = useUserLPTokens();
  
  const isWalletConnected = !!currentAccount;

  const userLPForModel = userLPTokens?.data?.filter((token: any) => {
    const content = token.data?.content as any;
    return content?.fields?.name === modelName;
  }) || [];

  const selectedTokenData = userLPForModel.find((token: any) => 
    token.data?.objectId === selectedLPToken
  );

  const calculateWithdrawalAmounts = () => {
    if (!selectedTokenData || !vaultInfo.lp_shares) {
      return { usdc: 0, btc: 0 };
    }
    
    const content = selectedTokenData.data?.content as any;
    const userShares = content?.fields?.value || 0;
    const totalShares = vaultInfo.lp_shares;
    
    const usdcAmount = (vaultInfo.usdc_balance * userShares) / totalShares;
    const btcAmount = (vaultInfo.btc_balance * userShares) / totalShares;
    
    return { usdc: usdcAmount, btc: btcAmount };
  };

  const { usdc: usdcAmount, btc: btcAmount } = calculateWithdrawalAmounts();


  const handleWithdraw = async () => {
    if (!selectedLPToken) return;
    
    setIsProcessing(true);
    try {
      await withdrawFromVault(seasonNumber, modelName, selectedLPToken);
      setIsProcessing(false);
      setIsComplete(true);
      setStep(3);
    } catch (error) {
      setIsProcessing(false);
      console.error('Withdrawal failed:', error);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setStep(1);
      setSelectedLPToken(null);
      setIsComplete(false);
      onClose();
    }
  };

  const formatCurrency = (value: number, isBTC: boolean = false) => {
    if (isBTC) {
      return `${formatBTC(value)} BTC`;
    }
    return `$${formatUSDC(value)}`;
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
                <h3 className="text-xl font-bold">Withdraw from {modelName}</h3>
                <p className="text-sm text-gray-400">Vault Withdrawal</p>
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
            {/* Step 1: Select LP Token */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium mb-2">Select Your LP Position</label>
                  {userLPForModel.length === 0 ? (
                    <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                      <AlertCircle className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                      <p className="text-gray-400">No LP positions found for {modelName}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {userLPForModel.map((token: any) => (
                        <button
                          key={token.data?.objectId}
                          onClick={() => setSelectedLPToken(token.data?.objectId)}
                          className={`w-full text-left p-3 rounded-lg border transition-all ${
                            selectedLPToken === token.data?.objectId
                              ? 'border-[#00ff88] bg-[#00ff88]/10'
                              : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold">LP Position</p>
                              <p className="text-sm text-gray-400">
                                Shares: {formatUSDC(token.data?.content?.fields?.value || 0)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-400">Est. Value</p>
                              <p className="font-semibold text-[#00ff88]">
                                ${formatUSDC(
                                  ((vaultInfo.usdc_balance * (token.data?.content?.fields?.value || 0)) / vaultInfo.lp_shares) +
                                  ((vaultInfo.btc_balance * (token.data?.content?.fields?.value || 0)) / vaultInfo.lp_shares * 50000) // Rough BTC price estimate
                                )}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Vault Info */}
                <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Vault USDC Balance</span>
                    <span className="font-semibold flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {formatCurrency(vaultInfo.usdc_balance)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Vault BTC Balance</span>
                    <span className="font-semibold flex items-center gap-1">
                      <Bitcoin className="w-4 h-4" />
                      {formatCurrency(vaultInfo.btc_balance, true)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total LP Supply</span>
                    <span className="font-semibold">{formatUSDC(vaultInfo.lp_shares)}</span>
                  </div>
                </div>

                <button
                  onClick={() => setStep(2)}
                  disabled={!selectedLPToken || userLPForModel.length === 0}
                  className="w-full bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-black font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </motion.div>
            )}

            {/* Step 2: Wallet Connection & Confirmation */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingDown className="w-8 h-8 text-[#00d4ff]" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2">Confirm Withdrawal</h4>
                  <p className="text-gray-400 text-sm">
                    You will withdraw your proportional share of USDC and BTC
                  </p>
                </div>

                {/* Withdrawal Summary */}
                <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                  <h5 className="font-semibold mb-2">You will receive:</h5>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      USDC
                    </span>
                    <span className="font-semibold text-green-400">
                      {formatCurrency(usdcAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 flex items-center gap-1">
                      <Bitcoin className="w-4 h-4" />
                      BTC
                    </span>
                    <span className="font-semibold text-orange-400">
                      {formatCurrency(btcAmount, true)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">LP Shares to Burn</span>
                      <span className="font-semibold">
                        {formatUSDC((selectedTokenData?.data?.content as any)?.fields?.value || 0)}
                      </span>
                    </div>
                  </div>
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
                        <p className="text-sm text-gray-400">Ready to withdraw</p>
                      </div>
                    </div>

                    <button
                      onClick={handleWithdraw}
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
                          <span>Confirm Withdrawal</span>
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
                  <h4 className="text-xl font-bold mb-2">Withdrawal Successful!</h4>
                  <p className="text-gray-400">
                    You've successfully withdrawn your share from the {modelName} vault
                  </p>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4 space-y-2 text-left">
                  <div className="flex justify-between">
                    <span className="text-gray-400">USDC Received</span>
                    <span className="font-semibold text-green-400">{formatCurrency(usdcAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">BTC Received</span>
                    <span className="font-semibold text-orange-400">{formatCurrency(btcAmount, true)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Transaction Hash</span>
                    <span className="font-mono text-xs">0x5678...9abc</span>
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
