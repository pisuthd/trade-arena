"use client"

import React, { useState, useEffect } from 'react';
import { Calendar, Trophy, TrendingUp, Users, Clock, Activity, ChevronDown, ChevronUp, Play, Pause, Square } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCurrentSeason, getSeasonStatusText, canDeposit, canWithdraw } from '@/hooks/useSeasonManager';
import { DataAdapter } from '@/data/dataAdapter';
import DepositModal from '@/components/DepositModal';
import WithdrawModal from '@/components/WithdrawModal';

type SeasonStatus = 'pre-season' | 'active' | 'ended';

const statusConfig = {
  'pre-season': {
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/30',
    icon: Clock,
    label: 'Pre-Season',
    description: 'Deposits open, trading not started'
  },
  'active': {
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/30',
    icon: Play,
    label: 'Active',
    description: 'Trading in progress'
  },
  'ended': {
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/20',
    borderColor: 'border-gray-500/30',
    icon: Square,
    label: 'Ended',
    description: 'Season completed'
  }
};

const aiStatusConfig = {
  'active': { color: 'text-green-400', label: 'Active' },
  'paused': { color: 'text-yellow-400', label: 'Paused' },
  'registered': { color: 'text-blue-400', label: 'Registered' },
  'pending': { color: 'text-gray-400', label: 'Pending' },
  'completed': { color: 'text-gray-400', label: 'Completed' },
};

export default function SeasonPage() {

  const [expandedSeason, setExpandedSeason] = useState<number | null>(null);
  const [activeModel, setActiveModel] = useState<string | null>(null);
  const [activeContentTab, setActiveContentTab] = useState<string>('overview');
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [seasonsData, setSeasonsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get season data from smart contract
  const { data: seasonData, isLoading: seasonLoading } = useCurrentSeason(1);

  // Extract season info from contract data
  const seasonInfo = seasonData?.data?.content as any;
  const seasonStatus = seasonInfo?.fields?.status || 0;
  const statusInfo = getSeasonStatusText(seasonStatus);

  // Fetch seasons data on component mount
  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const seasons = await DataAdapter.getSeasons();
        setSeasonsData(seasons);
        // Auto-expand the latest season (first one after sorting)
        if (seasons.length > 0) {
          setExpandedSeason(seasons[0].id);
        // Set first model as active tab
        if (seasons[0].aiModels.length > 0) {
          setActiveModel(seasons[0].aiModels[0].name);
          setActiveContentTab('vault');
        }
        }
      } catch (error) {
        console.error('Error fetching seasons:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSeasons();
  }, []);

  const toggleExpand = (seasonId: number) => {
    setExpandedSeason(expandedSeason === seasonId ? null : seasonId);
  };

  const handleModelClick = (modelName: string) => {
    setActiveModel(modelName);
    setActiveContentTab('vault');
  };

  const handleContentTabClick = (tab: string) => {
    setActiveContentTab(tab);
  };

  const handleDeposit = (model: any) => {
    // Convert display name to contract name for the transaction
    const contractModel = {
      ...model,
      contractName: DataAdapter.getContractModelName(model.name)
    };
    setSelectedModel(contractModel);
    setDepositModalOpen(true);
  };

  const handleWithdraw = (model: any) => {
    // Convert display name to contract name for the transaction
    const contractModel = {
      ...model,
      contractName: DataAdapter.getContractModelName(model.name)
    };
    setSelectedModel(contractModel);
    setWithdrawModalOpen(true);
  };

  const getModelEmoji = (modelName: string) => {
    return DataAdapter.getModelEmoji(modelName);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'TBD';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00ff88] mx-auto mb-4"></div>
          <p>Loading seasons data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Trading Seasons</h1>
          <p className="text-gray-400">
            AI trading competitions where top models compete for trading supremacy
          </p>
        </div>

        {/* Seasons List */}
        <div className="space-y-6">
          {seasonsData.map((season: any) => {
            const status = statusConfig[season.status as SeasonStatus];
            const StatusIcon = status.icon;

            return (
              <div
                key={season.id}
                className="border border-gray-800 rounded-xl overflow-hidden bg-gray-900/50"
              >
                {/* Season Header */}
                <div
                  className="p-6 cursor-pointer hover:bg-gray-800/50 transition-colors"
                  onClick={() => toggleExpand(season.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-3">
                        <Trophy className="w-8 h-8 text-yellow-400" />
                        <div>
                          <h2 className="text-xl font-bold">Season {season.seasonNumber}</h2>
                          <p className="text-sm text-gray-400">{season.title}</p>
                        </div>
                      </div>

                      <div className={`px-3 py-1 rounded-full border ${status.bgColor} ${status.borderColor} ${status.color} flex items-center space-x-2`}>
                        <StatusIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">{status.label}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-8">
                      <div className="text-right">
                        <p className="text-sm text-gray-400">Total Volume</p>
                        <p className="text-xl font-bold">{formatCurrency(season.totalVolume)}</p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-gray-400">Total Trades</p>
                        <p className="text-xl font-bold">{season.totalTrades.toLocaleString()}</p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-gray-400">AI Models</p>
                        <p className="text-xl font-bold">{season.aiModels.length}</p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-gray-400">Total TVL</p>
                        <p className="text-xl font-bold">{formatCurrency(season.metrics.totalTVL)}</p>
                      </div>

                      {expandedSeason === season.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedSeason === season.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-gray-800"
                  >
                    <div className="p-6">
                      {/* Season Overview */}
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold mb-3">Overview</h3>
                        <p className="text-gray-400 mb-4">{season.description}</p>

                        <div className="grid grid-cols-4 gap-4">
                          <div className="bg-gray-800/50 p-4 rounded-lg">
                            <p className="text-sm text-gray-400 mb-1">Created</p>
                            <p className="font-semibold">{formatDate(season.createdAt)}</p>
                          </div>
                          <div className="bg-gray-800/50 p-4 rounded-lg">
                            <p className="text-sm text-gray-400 mb-1">Started</p>
                            <p className="font-semibold">{formatDate(season.startedAt)}</p>
                          </div>
                          <div className="bg-gray-800/50 p-4 rounded-lg">
                            <p className="text-sm text-gray-400 mb-1">Ended</p>
                            <p className="font-semibold">{formatDate(season.endedAt)}</p>
                          </div>
                          <div className="bg-gray-800/50 p-4 rounded-lg">
                            <p className="text-sm text-gray-400 mb-1">Depositors</p>
                            <p className="font-semibold">{season.metrics.totalDepositors}</p>
                          </div>
                        </div>
                      </div>

                      {/* AI Models Performance with Tabs Layout */}
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold mb-4">AI Models Performance</h3>
                        
                        {/* Model Tabs */}
                        <div className="bg-gray-800/50 rounded-xl overflow-hidden">
                          {/* Tab Headers */}
                          <div className="flex border-b border-gray-700">
                            {season.aiModels.map((model: any, index: number) => {
                              const aiStatus = aiStatusConfig[model.status as keyof typeof aiStatusConfig];
                              const isActive = activeModel === model.name;
                              
                              return (
                                <button
                                  key={model.name}
                                  onClick={() => handleModelClick(model.name)}
                                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                                    isActive
                                      ? 'text-[#00ff88] border-[#00ff88] bg-gray-700/50'
                                      : 'text-gray-400 hover:text-white border-transparent hover:bg-gray-700/30'
                                  }`}
                                >
                                  <div className="flex items-center justify-center space-x-2">
                                    <span className="text-lg">{getModelEmoji(model.name)}</span>
                                    <span>{DataAdapter.getModelDisplayName(model.name)}</span>
                                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${aiStatus.color} bg-gray-600 border ${aiStatus.color}/20`}>
                                      {aiStatus.label}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>

                          {/* Tab Content for Active Model */}
                          <div className="p-6">
                            {season.aiModels.map((model: any, index: number) => {
                              const isActive = activeModel === model.name;
                              
                              if (!isActive) return null;
                              
                              return (
                                <div key={model.name}>
                                  {/* Model Stats Row */}
                                  <div className="grid grid-cols-4 gap-4 mb-6">
                                    <div className="bg-gray-700/50 p-4 rounded-lg">
                                      <p className="text-sm text-gray-400 mb-1">Total Value Locked</p>
                                      <p className="text-xl font-bold">{formatCurrency(model.tvl)}</p>
                                    </div>
                                    <div className="bg-gray-700/50 p-4 rounded-lg">
                                      <p className="text-sm text-gray-400 mb-1">Total Trades</p>
                                      <p className="text-xl font-bold">{model.trades}</p>
                                    </div>
                                    <div className="bg-gray-700/50 p-4 rounded-lg">
                                      <p className="text-sm text-gray-400 mb-1">Performance</p>
                                      <p className={`text-xl font-bold ${model.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {model.pnl >= 0 ? '+' : ''}{model.pnl}%
                                      </p>
                                    </div>
                                    <div className="bg-gray-700/50 p-4 rounded-lg">
                                      <p className="text-sm text-gray-400 mb-1">APY</p>
                                      <p className="text-xl font-bold text-green-400">{(45.2 - index * 8).toFixed(1)}%</p>
                                    </div>
                                  </div>

                                  {/* Content Tabs */}
                                  <div className="flex border-b border-gray-700 mb-4">
                                    {['vault', 'overview', 'trades', 'performance'].map((tab) => (
                                      <button
                                        key={tab}
                                        onClick={() => handleContentTabClick(tab)}
                                        className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                                          activeContentTab === tab
                                            ? 'text-[#00ff88] border-b-2 border-[#00ff88]'
                                            : 'text-gray-400 hover:text-white'
                                        }`}
                                      >
                                        {tab}
                                      </button>
                                    ))}
                                  </div>

                                  {/* Tab Content */}
                                  <div>
                                    {activeContentTab === 'overview' && (
                                      <div className="grid grid-cols-2 gap-6">
                                        <div>
                                          <h4 className="font-semibold mb-3">Model Strategy</h4>
                                          <p className="text-gray-400 text-sm mb-4">
                                            {model.name === 'CLAUDE' && 'Advanced momentum-based trading with breakout detection and dynamic position sizing.'}
                                            {model.name === 'NOVA' && 'Conservative approach focusing on risk management and sustainable long-term gains.'}
                                            {model.name === 'LLAMA' && 'Aggressive high-frequency trading with rapid position changes and scalping.'}
                                          </p>

                                          <h4 className="font-semibold mb-3">Key Metrics</h4>
                                          <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-gray-700/50 p-3 rounded-lg">
                                              <p className="text-xs text-gray-400">Win Rate</p>
                                              <p className="text-lg font-bold">{68.1 - index * 5}%</p>
                                            </div>
                                            <div className="bg-gray-700/50 p-3 rounded-lg">
                                              <p className="text-xs text-gray-400">Sharpe Ratio</p>
                                              <p className="text-lg font-bold">{(2.4 - index * 0.3).toFixed(1)}</p>
                                            </div>
                                            <div className="bg-gray-700/50 p-3 rounded-lg">
                                              <p className="text-xs text-gray-400">Max Drawdown</p>
                                              <p className="text-lg font-bold">{(8.2 + index * 2.3).toFixed(1)}%</p>
                                            </div>
                                            <div className="bg-gray-700/50 p-3 rounded-lg">
                                              <p className="text-xs text-gray-400">Avg Hold Time</p>
                                              <p className="text-lg font-bold">{(4.2 + index * 1.5).toFixed(1)}h</p>
                                            </div>
                                          </div>
                                        </div>

                                        <div>
                                          <h4 className="font-semibold mb-3">Performance Stats</h4>
                                          <div className="space-y-3">
                                            <div className="flex justify-between">
                                              <span className="text-gray-400">Average Win</span>
                                              <span className="text-green-400">+${245 - index * 30}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-gray-400">Average Loss</span>
                                              <span className="text-red-400">-${128 + index * 20}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-gray-400">Best Trade</span>
                                              <span className="text-green-400">+${580 - index * 50}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-gray-400">Worst Trade</span>
                                              <span className="text-red-400">-${240 + index * 30}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-gray-400">Active Positions</span>
                                              <span>{3 - index}</span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {activeContentTab === 'vault' && (
                                      <div className="space-y-6">
                                        {/* Vault Actions Section */}
                                        <div className="bg-gray-700/50 p-4 rounded-lg">
                                          <h4 className="font-semibold mb-2">Vault Information</h4>
                                          <p className="text-gray-400 text-sm mb-4">
                                            This vault allows users to deposit funds that will be automatically traded by {DataAdapter.getModelDisplayName(model.name)} AI model.
                                            All profits and losses are shared proportionally among depositors.
                                          </p>
                                          <div className="flex space-x-3">
                                            {season.status === 'pre-season' && (
                                              <button
                                                onClick={() => handleDeposit(model)}
                                                className="bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-black font-semibold px-6 py-2 rounded-lg hover:opacity-90 transition-opacity"
                                              >
                                                Deposit to Vault
                                              </button>
                                            )}

                                            {season.status === 'ended' && (
                                              <button
                                                onClick={() => handleWithdraw(model)}
                                                className="bg-gradient-to-r from-[#ff6b00] to-[#ff00ff] text-white font-semibold px-6 py-2 rounded-lg hover:opacity-90 transition-opacity"
                                              >
                                                Withdraw Funds
                                              </button>
                                            )}
                                          </div>
                                        </div>

                                        {/* Vault Statistics Grid */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                          <div className="bg-gray-700/50 p-4 rounded-lg">
                                            <p className="text-sm text-gray-400 mb-1">Total Value Locked</p>
                                            <p className="text-xl font-bold">{formatCurrency(model.tvl)}</p>
                                            <p className="text-xs text-green-400 mt-1">+12.5% this week</p>
                                          </div>
                                          <div className="bg-gray-700/50 p-4 rounded-lg">
                                            <p className="text-sm text-gray-400 mb-1">Total Depositors</p>
                                            <p className="text-xl font-bold">{Math.floor(model.tvl / 2500)}</p>
                                            <p className="text-xs text-blue-400 mt-1">+3 today</p>
                                          </div>
                                          <div className="bg-gray-700/50 p-4 rounded-lg">
                                            <p className="text-sm text-gray-400 mb-1">Current APY</p>
                                            <p className="text-xl font-bold text-green-400">{(45.2 - index * 8).toFixed(1)}%</p>
                                            <p className="text-xs text-gray-400 mt-1">Annualized</p>
                                          </div>
                                          <div className="bg-gray-700/50 p-4 rounded-lg">
                                            <p className="text-sm text-gray-400 mb-1">Your Share</p>
                                            <p className="text-xl font-bold">0.00%</p>
                                            <p className="text-xs text-gray-400 mt-1">Connect wallet</p>
                                          </div>
                                        </div>

                                        {/* Vault Performance & Risk Metrics */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                          <div className="bg-gray-700/50 p-4 rounded-lg">
                                            <h4 className="font-semibold mb-3">Performance Metrics</h4>
                                            <div className="space-y-3">
                                              <div className="flex justify-between items-center">
                                                <span className="text-gray-400 text-sm">Total Return</span>
                                                <span className={`font-semibold ${model.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                  {model.pnl >= 0 ? '+' : ''}{model.pnl}%
                                                </span>
                                              </div>
                                              <div className="flex justify-between items-center">
                                                <span className="text-gray-400 text-sm">Win Rate</span>
                                                <span className="font-semibold">{68.1 - index * 5}%</span>
                                              </div>
                                              <div className="flex justify-between items-center">
                                                <span className="text-gray-400 text-sm">Sharpe Ratio</span>
                                                <span className="font-semibold">{(2.4 - index * 0.3).toFixed(2)}</span>
                                              </div>
                                              <div className="flex justify-between items-center">
                                                <span className="text-gray-400 text-sm">Avg Daily Return</span>
                                                <span className="font-semibold text-green-400">+{((45.2 - index * 8) / 365).toFixed(3)}%</span>
                                              </div>
                                            </div>
                                          </div>

                                          <div className="bg-gray-700/50 p-4 rounded-lg">
                                            <h4 className="font-semibold mb-3">Risk Metrics</h4>
                                            <div className="space-y-3">
                                              <div className="flex justify-between items-center">
                                                <span className="text-gray-400 text-sm">Max Drawdown</span>
                                                <span className="font-semibold text-red-400">{(8.2 + index * 2.3).toFixed(1)}%</span>
                                              </div>
                                              <div className="flex justify-between items-center">
                                                <span className="text-gray-400 text-sm">Volatility</span>
                                                <span className="font-semibold">{(12.5 + index * 3.1).toFixed(1)}%</span>
                                              </div>
                                              <div className="flex justify-between items-center">
                                                <span className="text-gray-400 text-sm">Risk Score</span>
                                                <span className="font-semibold text-yellow-400">{(3 + index)}</span>
                                              </div>
                                              <div className="flex justify-between items-center">
                                                <span className="text-gray-400 text-sm">Beta</span>
                                                <span className="font-semibold">{(0.8 + index * 0.1).toFixed(2)}</span>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
 

                                        {/* Vault Composition */}
                                        <div className="bg-gray-700/50 p-4 rounded-lg">
                                          <h4 className="font-semibold mb-3">Vault Composition</h4>
                                          <div className="grid grid-cols-2 gap-4">
                                            <div>
                                              <p className="text-sm text-gray-400 mb-2">Asset Allocation</p>
                                              <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                  <span className="text-sm">USDC</span>
                                                  <div className="flex items-center space-x-2">
                                                    <div className="w-20 bg-gray-600 rounded-full h-2">
                                                      <div className="bg-blue-400 h-2 rounded-full" style={{width: '65%'}}></div>
                                                    </div>
                                                    <span className="text-sm">65%</span>
                                                  </div>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                  <span className="text-sm">BTC</span>
                                                  <div className="flex items-center space-x-2">
                                                    <div className="w-20 bg-gray-600 rounded-full h-2">
                                                      <div className="bg-orange-400 h-2 rounded-full" style={{width: '25%'}}></div>
                                                    </div>
                                                    <span className="text-sm">25%</span>
                                                  </div>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                  <span className="text-sm">ETH</span>
                                                  <div className="flex items-center space-x-2">
                                                    <div className="w-20 bg-gray-600 rounded-full h-2">
                                                      <div className="bg-purple-400 h-2 rounded-full" style={{width: '10%'}}></div>
                                                    </div>
                                                    <span className="text-sm">10%</span>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                            <div>
                                              <p className="text-sm text-gray-400 mb-2">Position Types</p>
                                              <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                  <span className="text-sm">Long Positions</span>
                                                  <div className="flex items-center space-x-2">
                                                    <div className="w-20 bg-gray-600 rounded-full h-2">
                                                      <div className="bg-green-400 h-2 rounded-full" style={{width: '70%'}}></div>
                                                    </div>
                                                    <span className="text-sm">70%</span>
                                                  </div>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                  <span className="text-sm">Short Positions</span>
                                                  <div className="flex items-center space-x-2">
                                                    <div className="w-20 bg-gray-600 rounded-full h-2">
                                                      <div className="bg-red-400 h-2 rounded-full" style={{width: '20%'}}></div>
                                                    </div>
                                                    <span className="text-sm">20%</span>
                                                  </div>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                  <span className="text-sm">Cash</span>
                                                  <div className="flex items-center space-x-2">
                                                    <div className="w-20 bg-gray-600 rounded-full h-2">
                                                      <div className="bg-gray-400 h-2 rounded-full" style={{width: '10%'}}></div>
                                                    </div>
                                                    <span className="text-sm">10%</span>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {activeContentTab === 'trades' && (
                                      <div>
                                        <h4 className="font-semibold mb-3">Recent Trades</h4>
                                        <div className="space-y-2">
                                          {[
                                            { asset: 'BTC', action: 'BUY', amount: 0.15, price: 43250, pnl: 245, time: '2 min ago' },
                                            { asset: 'ETH', action: 'SELL', amount: 2.3, price: 2280, pnl: -128, time: '15 min ago' },
                                            { asset: 'SOL', action: 'BUY', amount: 45, price: 98.5, pnl: 380, time: '1 hour ago' },
                                          ].map((trade: any, tradeIndex: number) => (
                                            <div key={tradeIndex} className="bg-gray-700/50 p-3 rounded-lg">
                                              <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                  <div className={`px-2 py-1 rounded text-xs font-semibold ${
                                                    trade.action === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                                  }`}>
                                                    {trade.action}
                                                  </div>
                                                  <div>
                                                    <p className="font-semibold text-sm">{trade.asset}</p>
                                                    <p className="text-xs text-gray-400">{trade.amount} @ ${trade.price}</p>
                                                  </div>
                                                </div>
                                                <div className="text-right">
                                                  <p className={`font-semibold text-sm ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {trade.pnl >= 0 ? '+' : ''}{formatCurrency(trade.pnl)}
                                                  </p>
                                                  <p className="text-xs text-gray-400">{trade.time}</p>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {activeContentTab === 'performance' && (
                                      <div>
                                        <h4 className="font-semibold mb-3">Performance Chart</h4>
                                        <div className="bg-gray-700/50 p-6 rounded-lg">
                                          <div className="h-48 flex items-center justify-center border-2 border-dashed border-gray-600 rounded-lg">
                                            <p className="text-gray-400">Performance chart visualization for {DataAdapter.getModelDisplayName(model.name)}</p>
                                          </div>
                                          <div className="mt-4 grid grid-cols-3 gap-4">
                                            <div className="text-center">
                                              <p className="text-xs text-gray-400">Start Value</p>
                                              <p className="text-lg font-bold">$10,000</p>
                                            </div>
                                            <div className="text-center">
                                              <p className="text-xs text-gray-400">Current Value</p>
                                              <p className="text-lg font-bold">{formatCurrency(10000 + (model.pnl * 100))}</p>
                                            </div>
                                            <div className="text-center">
                                              <p className="text-xs text-gray-400">Total Return</p>
                                              <p className={`text-lg font-bold ${model.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {model.pnl >= 0 ? '+' : ''}{model.pnl}%
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
 
 
                    </div>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
 
      </div>

      {/* Modals */}
      {selectedModel && (
        <>
          <DepositModal
            isOpen={depositModalOpen}
            onClose={() => setDepositModalOpen(false)}
            modelName={selectedModel.contractName || selectedModel.name}
            modelEmoji={getModelEmoji(selectedModel.name)}
            vaultInfo={{
              tvl: selectedModel.tvl,
              depositors: Math.floor(selectedModel.tvl / 2500),
              apy: 45.2 - ((seasonsData[0]?.aiModels?.findIndex((m: any) => m.name === selectedModel.name) || 0) * 8),
              minDeposit: 10
            }}
          />

          <WithdrawModal
            isOpen={withdrawModalOpen}
            onClose={() => setWithdrawModalOpen(false)}
            modelName={DataAdapter.getModelDisplayName(selectedModel.name)}
            modelEmoji={getModelEmoji(selectedModel.name)}
            seasonNumber={seasonsData[0]?.seasonNumber || 1}
            vaultInfo={{
              usdc_balance: selectedModel.tvl * 1000000, // Convert to 6 decimals
              btc_balance: selectedModel.tvl > 0 ? 50000000 : 0, // 0.05 BTC if has TVL
              lp_shares: selectedModel.tvl * 1000000 // LP shares equal to TVL in 6 decimals
            }}
          />
        </>
      )}
    </div>
  );
}
