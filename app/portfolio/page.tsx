"use client"

import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Wallet, DollarSign, Activity, Users, ChevronRight, ExternalLink } from 'lucide-react';

// Static portfolio data
const portfolioData = {
  totalValue: 12500,
  totalDeposited: 10000,
  totalProfit: 2500,
  totalProfitPercentage: 25.0,
  vaultHoldings: [
    {
      id: 'deepseek',
      modelName: 'DeepSeek',
      modelEmoji: '🚀',
      depositedAmount: 5000,
      currentValue: 6850,
      profit: 1850,
      profitPercentage: 37.0,
      apy: 45.2,
      shares: 50,
      status: 'active',
      lastUpdated: '2 hours ago'
    },
    {
      id: 'claude',
      modelName: 'Claude',
      modelEmoji: '🧠',
      depositedAmount: 3000,
      currentValue: 3650,
      profit: 650,
      profitPercentage: 21.7,
      apy: 28.7,
      shares: 30,
      status: 'active',
      lastUpdated: '1 hour ago'
    },
    {
      id: 'gpt-4',
      modelName: 'GPT-4',
      modelEmoji: '⚡',
      depositedAmount: 2000,
      currentValue: 2000,
      profit: 0,
      profitPercentage: 0.0,
      apy: 15.3,
      shares: 20,
      status: 'active',
      lastUpdated: '30 min ago'
    }
  ],
  recentTransactions: [
    {
      id: 1,
      type: 'deposit',
      modelName: 'DeepSeek',
      modelEmoji: '🚀',
      amount: 2000,
      timestamp: '2 days ago',
      status: 'completed'
    },
    {
      id: 2,
      type: 'deposit',
      modelName: 'Claude',
      modelEmoji: '🧠',
      amount: 1500,
      timestamp: '3 days ago',
      status: 'completed'
    },
    {
      id: 3,
      type: 'withdraw',
      modelName: 'GPT-4',
      modelEmoji: '⚡',
      amount: 500,
      timestamp: '1 week ago',
      status: 'completed'
    },
    {
      id: 4,
      type: 'deposit',
      modelName: 'DeepSeek',
      modelEmoji: '🚀',
      amount: 3000,
      timestamp: '2 weeks ago',
      status: 'completed'
    }
  ]
};

export default function PortfolioPage() {
  const [activeTab, setActiveTab] = useState('holdings');
  const [withdrawModal, setWithdrawModal] = useState<{ isOpen: boolean; vault: any }>({
    isOpen: false,
    vault: null,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const openWithdrawModal = (vault: any) => {
    setWithdrawModal({ isOpen: true, vault });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Portfolio</h1>
          <p className="text-gray-400">Track your vault investments and performance</p>
        </div>

        {/* Portfolio Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-sm">Total Value</p>
              <Wallet className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold">{formatCurrency(portfolioData.totalValue)}</p>
          </div>
          
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-sm">Total Deposited</p>
              <DollarSign className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold">{formatCurrency(portfolioData.totalDeposited)}</p>
          </div>
          
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
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
          
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-sm">Return</p>
              <Activity className="w-5 h-5 text-gray-400" />
            </div>
            <p className={`text-2xl font-bold ${portfolioData.totalProfitPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {portfolioData.totalProfitPercentage >= 0 ? '+' : ''}{portfolioData.totalProfitPercentage}%
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800 mb-6">
          {['holdings', 'transactions'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'text-[#00ff88] border-b-2 border-[#00ff88]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'holdings' && (
          <div className="space-y-4">
            {portfolioData.vaultHoldings.map((vault) => (
              <div key={vault.id} className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">{vault.modelEmoji}</div>
                    <div>
                      <h3 className="text-lg font-semibold">{vault.modelName} Vault</h3>
                      <p className="text-sm text-gray-400">APY: {vault.apy}% • {vault.shares} shares • Updated {vault.lastUpdated}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-8">
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Deposited</p>
                      <p className="text-lg font-semibold">{formatCurrency(vault.depositedAmount)}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Current Value</p>
                      <p className="text-lg font-semibold">{formatCurrency(vault.currentValue)}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Profit</p>
                      <p className={`text-lg font-semibold ${vault.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {vault.profit >= 0 ? '+' : ''}{formatCurrency(vault.profit)}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Return</p>
                      <p className={`text-lg font-semibold ${vault.profitPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {vault.profitPercentage >= 0 ? '+' : ''}{vault.profitPercentage}%
                      </p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                        Add More
                      </button>
                      <button 
                        onClick={() => openWithdrawModal(vault)}
                        className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors"
                      >
                        Withdraw
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Model</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {portfolioData.recentTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {transaction.type === 'deposit' ? (
                            <ArrowDownRight className="w-4 h-4 text-green-400 mr-2" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4 text-red-400 mr-2" />
                          )}
                          <span className="capitalize">{transaction.type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="mr-2">{transaction.modelEmoji}</span>
                          <span>{transaction.modelName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={transaction.type === 'deposit' ? 'text-green-400' : 'text-red-400'}>
                          {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-green-500/20 text-green-400 rounded-full">
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                        {transaction.timestamp}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center justify-between p-4 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#00ff88]/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-[#00ff88]" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Add Funds</p>
                  <p className="text-sm text-gray-400">Deposit to existing vaults</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            
            <button className="flex items-center justify-between p-4 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Explore Models</p>
                  <p className="text-sm text-gray-400">Find new AI strategies</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            
            <button className="flex items-center justify-between p-4 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-purple-400" />
                </div>
                <div className="text-left">
                  <p className="font-medium">View Analytics</p>
                  <p className="text-sm text-gray-400">Detailed performance insights</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Withdraw Modal (Placeholder) */}
      {withdrawModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Withdraw from {withdrawModal.vault?.modelName} Vault</h3>
            <p className="text-gray-400 mb-4">
              Available to withdraw: {formatCurrency(withdrawModal.vault?.currentValue || 0)}
            </p>
            <input
              type="number"
              placeholder="Enter amount to withdraw"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 mb-4"
            />
            <div className="flex space-x-3">
              <button
                onClick={() => setWithdrawModal({ isOpen: false, vault: null })}
                className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">
                Withdraw
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
