"use client"

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Wallet, DollarSign, Activity, Users, ChevronRight, ExternalLink, Clock, Filter, Calendar } from 'lucide-react';
import { useUserPortfolio } from '@/hooks/useUserPortfolio';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { getSeasonStatusText } from '@/hooks/useSeasonManager';
import Link from 'next/link';
import DepositModal from '@/components/DepositModal';
import WithdrawModal from '@/components/WithdrawModal';

export default function PortfolioPage() {
  const account = useCurrentAccount();
  const [selectedSeason, setSelectedSeason] = useState<number | undefined>();
  const [activeTab, setActiveTab] = useState('holdings');
  const [depositModal, setDepositModal] = useState<{ isOpen: boolean; aiName: string; seasonNumber: number }>({
    isOpen: false,
    aiName: '',
    seasonNumber: 0,
  });
  const [withdrawModal, setWithdrawModal] = useState<{ isOpen: boolean; aiName: string; seasonNumber: number }>({
    isOpen: false,
    aiName: '',
    seasonNumber: 0,
  });

  const portfolioData = useUserPortfolio(selectedSeason);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getModelEmoji = (modelName: string) => {
    const emojis: Record<string, string> = {
      'DeepSeek': '🚀',
      'Claude': '🧠',
      'GPT-4': '⚡',
      'Gemini': '💎',
    };
    return emojis[modelName] || '🤖';
  };

  const getModelColor = (modelName: string) => {
    const colors: Record<string, string> = {
      'DeepSeek': '#00ff88',
      'Claude': '#00d4ff',
      'GPT-4': '#ff00ff',
      'Gemini': '#ff6b00',
    };
    return colors[modelName] || '#ffffff';
  };

  const openDepositModal = (aiName: string, seasonNumber: number) => {
    setDepositModal({ isOpen: true, aiName, seasonNumber });
  };

  const openWithdrawModal = (aiName: string, seasonNumber: number) => {
    setWithdrawModal({ isOpen: true, aiName, seasonNumber });
  };

  if (!account) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="text-center">
          <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-6">Please connect your Sui wallet to view your portfolio</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Animated gradient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-[800px] h-[800px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(0,255,136,0.08) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
          animate={{
            x: ['-20%', '120%'],
            y: ['-20%', '100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'linear',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-8 pb-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-[#00ff88] to-[#00d4ff] bg-clip-text text-transparent">
              My Portfolio
            </span>
          </h1>
          <p className="text-xl text-gray-400">Track your AI vault investments across seasons</p>
        </motion.div>

        {/* Portfolio Overview Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-black/40 backdrop-blur-sm border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-sm">Total Value</p>
              <Wallet className="w-5 h-5 text-[#00ff88]" />
            </div>
            <p className="text-2xl font-bold text-[#00ff88]">{formatCurrency(portfolioData.totalValue)}</p>
          </div>
          
          <div className="bg-black/40 backdrop-blur-sm border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-sm">Total Deposited</p>
              <DollarSign className="w-5 h-5 text-[#00d4ff]" />
            </div>
            <p className="text-2xl font-bold text-[#00d4ff]">{formatCurrency(portfolioData.totalDeposited)}</p>
          </div>
          
          <div className="bg-black/40 backdrop-blur-sm border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-sm">Total Profit</p>
              {portfolioData.totalProfit >= 0 ? (
                <TrendingUp className="w-5 h-5 text-green-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-400" />
              )}
            </div>
            <p className={`text-2xl font-bold ${portfolioData.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {portfolioData.totalProfit >= 0 ? '+' : ''}{formatCurrency(portfolioData.totalProfit)}
            </p>
          </div>
          
          <div className="bg-black/40 backdrop-blur-sm border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-sm">Return</p>
              <Activity className="w-5 h-5 text-[#ff00ff]" />
            </div>
            <p className={`text-2xl font-bold ${portfolioData.totalProfitPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {portfolioData.totalProfitPercentage >= 0 ? '+' : ''}{portfolioData.totalProfitPercentage.toFixed(1)}%
            </p>
          </div>
        </motion.div>

        {/* Season Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-black/40 backdrop-blur-sm border border-gray-800 rounded-xl p-4 mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Filter className="w-5 h-5 text-[#00ff88]" />
              <h3 className="font-bold">Season Filter</h3>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedSeason || ''}
                onChange={(e) => setSelectedSeason(e.target.value ? parseInt(e.target.value) : undefined)}
                className="px-4 py-2 bg-black/60 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88]"
              >
                <option value="">All Seasons</option>
                <option value="1">Season 1</option>
                <option value="2">Season 2</option>
                <option value="3">Season 3</option>
                <option value="4">Season 4</option>
              </select>
              <Link
                href="/season"
                className="px-4 py-2 bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-black font-semibold rounded-lg hover:shadow-lg hover:shadow-[#00ff88]/50 transition-all text-sm"
              >
                View Seasons
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Holdings */}
        {portfolioData.holdings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-black/40 backdrop-blur-sm border border-gray-800 rounded-xl p-12 text-center"
          >
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2">No Vault Holdings</h3>
            <p className="text-gray-400 mb-6">You haven't deposited into any AI vaults yet</p>
            <Link
              href="/season"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-black font-bold rounded-lg hover:shadow-lg hover:shadow-[#00ff88]/50 transition-all"
            >
              Explore Seasons
              <ChevronRight className="w-4 h-4 ml-2" />
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {portfolioData.holdings.map((holding, index) => (
              <motion.div
                key={`${holding.seasonNumber}-${holding.aiName}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-black/40 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">{getModelEmoji(holding.aiName)}</div>
                    <div>
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="text-lg font-semibold">{holding.aiName} Vault</h3>
                        <span className="px-2 py-1 text-xs font-medium bg-gray-800 rounded-lg">
                          Season {holding.seasonNumber}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-lg ${
                          holding.seasonStatus === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                          holding.seasonStatus === 1 ? 'bg-blue-500/20 text-blue-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {getSeasonStatusText(holding.seasonStatus).text}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">
                        {holding.lpShares.toLocaleString()} shares • {holding.ownershipPercentage.toFixed(2)}% ownership
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <p className="text-sm text-gray-400">USDC Balance</p>
                      <p className="text-lg font-semibold">${(holding.usdcBalance / 1_000_000).toLocaleString()}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-gray-400">BTC Balance</p>
                      <p className="text-lg font-semibold">{(holding.btcBalance / 1_000_000).toLocaleString()}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Current Value</p>
                      <p className="text-lg font-semibold" style={{ color: getModelColor(holding.aiName) }}>
                        {formatCurrency(holding.currentValue)}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-gray-400">P&L</p>
                      <p className={`text-lg font-semibold ${holding.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {holding.profit >= 0 ? '+' : ''}{formatCurrency(holding.profit)}
                      </p>
                    </div>
                    
                    <div className="flex space-x-2">
                      {holding.seasonStatus === 0 && (
                        <button 
                          onClick={() => openDepositModal(holding.aiName, holding.seasonNumber)}
                          className="px-4 py-2 bg-[#00ff88]/20 text-[#00ff88] hover:bg-[#00ff88]/30 rounded-lg transition-colors text-sm font-medium"
                        >
                          Add More
                        </button>
                      )}
                      {holding.seasonStatus === 2 && (
                        <button 
                          onClick={() => openWithdrawModal(holding.aiName, holding.seasonNumber)}
                          className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors text-sm font-medium"
                        >
                          Withdraw
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 bg-black/40 backdrop-blur-sm border border-gray-800 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/season"
              className="flex items-center justify-between p-4 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#00ff88]/20 rounded-lg flex items-center justify-center group-hover:bg-[#00ff88]/30 transition-colors">
                  <DollarSign className="w-5 h-5 text-[#00ff88]" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Explore Seasons</p>
                  <p className="text-sm text-gray-400">Find new AI competitions</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#00ff88] transition-colors" />
            </Link>
            
            <Link
              href="/history"
              className="flex items-center justify-between p-4 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                  <Activity className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Trade History</p>
                  <p className="text-sm text-gray-400">View all AI trading activity</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
            </Link>
            
            <a
              href="https://walrus.sui"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                  <ExternalLink className="w-5 h-5 text-purple-400" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Walrus Verification</p>
                  <p className="text-sm text-gray-400">Verify trades on-chain</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
            </a>
          </div>
        </motion.div>
      </div>

      {/* Modals */}
    {depositModal.isOpen && (
        <DepositModal
          isOpen={depositModal.isOpen}
          onClose={() => setDepositModal({ isOpen: false, aiName: '', seasonNumber: 0 })}
          modelName={depositModal.aiName}
          modelEmoji={getModelEmoji(depositModal.aiName)}
          vaultInfo={{
            tvl: 100000,
            depositors: 50,
            apy: 25.5,
            minDeposit: 100
          }}
        />
      )}

       {withdrawModal.isOpen && (
        <WithdrawModal
          isOpen={withdrawModal.isOpen}
          onClose={() => setWithdrawModal({ isOpen: false, aiName: '', seasonNumber: 0 })}
          modelName={withdrawModal.aiName}
          modelEmoji={getModelEmoji(withdrawModal.aiName)}
          seasonNumber={withdrawModal.seasonNumber}
          vaultInfo={{
            usdc_balance: 50000,
            btc_balance: 1000000,
            lp_shares: 1000000
          }}
        />
      )}
    </div>
  );
}
