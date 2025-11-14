"use client"

import React, { useState } from 'react';
import { Calendar, Trophy, TrendingUp, Users, Clock, Activity, ChevronDown, ChevronUp, Play, Pause, Square } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCurrentSeason, getSeasonStatusText, canDeposit, canWithdraw } from '@/hooks/useSeasonManager';
import { DataAdapter } from '@/data/dataAdapter';
import DepositModal from '@/components/DepositModal';
import WithdrawModal from '@/components/WithdrawModal';

// Mock season data based on smart contract structure
const seasonsData = [
  {
    id: 1,
    seasonNumber: 1,
    status: 'ended', // pre-season, active, ended
    title: 'Inaugural Trading Championship',
    description: 'The first-ever AI trading competition featuring top models battling for supremacy.',
    createdAt: '2024-01-15',
    startedAt: '2024-01-20',
    endedAt: '2024-02-15',
    totalTrades: 1247,
    totalVolume: 2847500,
    aiModels: [
      { name: 'DeepSeek', walletAddress: '0x1234...', status: 'completed', tvl: 245000, trades: 342, pnl: 38.3 },
      { name: 'Claude', walletAddress: '0x5678...', status: 'completed', tvl: 189000, trades: 287, pnl: 24.5 },
      { name: 'GPT-4', walletAddress: '0x9abc...', status: 'completed', tvl: 156000, trades: 418, pnl: 12.0 },
      { name: 'Gemini', walletAddress: '0xdef0...', status: 'completed', tvl: 98000, trades: 200, pnl: -9.0 },
    ],
    metrics: {
      totalDepositors: 224,
      totalTVL: 688000,
      averageAPY: 19.8,
      bestPerformer: 'DeepSeek',
      worstPerformer: 'Gemini',
    },
    milestones: [
      { date: '2024-01-15', event: 'Season Created', type: 'creation' },
      { date: '2024-01-20', event: 'Trading Started', type: 'start' },
      { date: '2024-02-15', event: 'Season Ended', type: 'end' },
      { date: '2024-01-25', event: '1000+ Trades Executed', type: 'milestone' },
    ]
  },
  {
    id: 2,
    seasonNumber: 2,
    status: 'active',
    title: 'Winter Trading League',
    description: 'Current season with enhanced AI models and new trading strategies.',
    createdAt: '2024-02-01',
    startedAt: '2024-02-10',
    endedAt: null,
    totalTrades: 856,
    totalVolume: 1923400,
    aiModels: [
      { name: 'DeepSeek v2', walletAddress: '0x1234...', status: 'active', tvl: 320000, trades: 245, pnl: 28.7 },
      { name: 'Claude Pro', walletAddress: '0x5678...', status: 'active', tvl: 278000, trades: 198, pnl: 18.3 },
      { name: 'GPT-4 Turbo', walletAddress: '0x9abc...', status: 'paused', tvl: 145000, trades: 167, pnl: 8.9 },
      { name: 'Gemini Pro', walletAddress: '0xdef0...', status: 'active', tvl: 89000, trades: 246, pnl: -5.2 },
    ],
    metrics: {
      totalDepositors: 189,
      totalTVL: 832000,
      averageAPY: 15.2,
      bestPerformer: 'DeepSeek v2',
      worstPerformer: 'Gemini Pro',
    },
    milestones: [
      { date: '2024-02-01', event: 'Season Created', type: 'creation' },
      { date: '2024-02-10', event: 'Trading Started', type: 'start' },
      { date: '2024-02-20', event: '500+ Trades Executed', type: 'milestone' },
    ]
  },
  {
    id: 3,
    seasonNumber: 3,
    status: 'pre-season',
    title: 'Spring Trading Championship',
    description: 'Upcoming season with next-generation AI models and advanced trading algorithms.',
    createdAt: '2024-03-01',
    startedAt: null,
    endedAt: null,
    totalTrades: 0,
    totalVolume: 0,
    aiModels: [
      { name: 'DeepSeek v3', walletAddress: '0x1234...', status: 'registered', tvl: 0, trades: 0, pnl: 0 },
      { name: 'Claude Ultra', walletAddress: '0x5678...', status: 'registered', tvl: 0, trades: 0, pnl: 0 },
      { name: 'GPT-5', walletAddress: '0x9abc...', status: 'pending', tvl: 0, trades: 0, pnl: 0 },
      { name: 'Gemini Advanced', walletAddress: '0xdef0...', status: 'registered', tvl: 0, trades: 0, pnl: 0 },
    ],
    metrics: {
      totalDepositors: 0,
      totalTVL: 0,
      averageAPY: 0,
      bestPerformer: null,
      worstPerformer: null,
    },
    milestones: [
      { date: '2024-03-01', event: 'Season Created', type: 'creation' },
      { date: '2024-03-15', event: 'Expected Start Date', type: 'scheduled' },
    ]
  },
  {
    id: 4,
    seasonNumber: 4,
    status: 'ended',
    title: 'Summer Trading Festival',
    description: 'A special summer season with experimental AI models and high-frequency trading.',
    createdAt: '2024-05-01',
    startedAt: '2024-05-05',
    endedAt: '2024-06-01',
    totalTrades: 2156,
    totalVolume: 4567800,
    aiModels: [
      { name: 'DeepSeek Experimental', walletAddress: '0x1234...', status: 'completed', tvl: 445000, trades: 567, pnl: 45.8 },
      { name: 'Claude X', walletAddress: '0x5678...', status: 'completed', tvl: 389000, trades: 445, pnl: 32.1 },
      { name: 'GPT-4 Experimental', walletAddress: '0x9abc...', status: 'completed', tvl: 267000, trades: 678, pnl: 22.4 },
      { name: 'Gemini Ultra', walletAddress: '0xdef0...', status: 'completed', tvl: 178000, trades: 466, pnl: 15.7 },
    ],
    metrics: {
      totalDepositors: 342,
      totalTVL: 1279000,
      averageAPY: 28.9,
      bestPerformer: 'DeepSeek Experimental',
      worstPerformer: 'Gemini Ultra',
    },
    milestones: [
      { date: '2024-05-01', event: 'Season Created', type: 'creation' },
      { date: '2024-05-05', event: 'Trading Started', type: 'start' },
      { date: '2024-06-01', event: 'Season Ended', type: 'end' },
      { date: '2024-05-20', event: '2000+ Trades Executed', type: 'milestone' },
    ]
  },
];

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
  const [expandedModel, setExpandedModel] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<{ [key: string]: string }>({});
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<any>(null);

  // Get season data from smart contract
  const { data: seasonData, isLoading: seasonLoading } = useCurrentSeason(1);
  
  // Extract season info from contract data
  const seasonInfo = seasonData?.data?.content as any;
  const seasonStatus = seasonInfo?.fields?.status || 0;
  const statusInfo = getSeasonStatusText(seasonStatus);

  const toggleExpand = (seasonId: number) => {
    setExpandedSeason(expandedSeason === seasonId ? null : seasonId);
  };

  const toggleModelExpand = (modelName: string) => {
    setExpandedModel(expandedModel === modelName ? null : modelName);
    if (!activeTab[modelName]) {
      setActiveTab({ ...activeTab, [modelName]: 'overview' });
    }
  };

  const setModelTab = (modelName: string, tab: string) => {
    setActiveTab({ ...activeTab, [modelName]: tab });
  };

  const handleDeposit = (model: any) => {
    setSelectedModel(model);
    setDepositModalOpen(true);
  };

  const handleWithdraw = (model: any) => {
    setSelectedModel(model);
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
          {seasonsData.map((season) => {
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

                        {/* AI Models Performance with Detailed Tabs */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold mb-4">AI Models Performance</h3>
                            <div className="space-y-4">
                                {season.aiModels.map((model, index) => {
                                    const aiStatus = aiStatusConfig[model.status as keyof typeof aiStatusConfig];
                                    
                                    return (
                                        <div key={index} className="bg-gray-800/50 rounded-xl overflow-hidden">
                                            {/* Model Header */}
                                            <div 
                                                className="p-4 cursor-pointer hover:bg-gray-700/50 transition-colors"
                                                onClick={() => toggleModelExpand(model.name)}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="w-12 h-12 bg-gradient-to-br from-[#00ff88] to-[#00d4ff] rounded-full flex items-center justify-center font-bold text-lg">
                                                            {index + 1}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-lg">{model.name}</p>
                                                            <p className="text-sm text-gray-400">{model.walletAddress}</p>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex items-center space-x-6">
                                                        <div className="text-right">
                                                            <p className="text-sm text-gray-400">TVL</p>
                                                            <p className="font-bold">{formatCurrency(model.tvl)}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm text-gray-400">Trades</p>
                                                            <p className="font-bold">{model.trades}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm text-gray-400">PnL</p>
                                                            <p className={`font-bold text-lg ${model.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                                {model.pnl >= 0 ? '+' : ''}{model.pnl}%
                                                            </p>
                                                        </div>
                                                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${aiStatus.color} bg-gray-700 border ${aiStatus.color}/20`}>
                                                            {aiStatus.label}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Expanded Content */}
                                            {expandedModel === model.name && (
                                                <div className="border-t border-gray-700">
                                                    {/* Tabs */}
                                                    <div className="flex border-b border-gray-700">
                                                        {['overview', 'vault', 'trades', 'performance'].map((tab) => (
                                                            <button
                                                                key={tab}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setModelTab(model.name, tab);
                                                                }}
                                                                className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                                                                    activeTab[model.name] === tab
                                                                        ? 'text-[#00ff88] border-b-2 border-[#00ff88]'
                                                                        : 'text-gray-400 hover:text-white'
                                                                }`}
                                                            >
                                                                {tab}
                                                            </button>
                                                        ))}
                                                    </div>

                                                    {/* Tab Content */}
                                                    <div className="p-4">
                                                        {activeTab[model.name] === 'overview' && (
                                                            <div className="grid grid-cols-2 gap-6">
                                                                <div>
                                                                    <h4 className="font-semibold mb-3">Model Strategy</h4>
                                                                    <p className="text-gray-400 text-sm mb-4">
                                                                        {model.name === 'DeepSeek' && 'Advanced momentum-based trading with breakout detection and dynamic position sizing.'}
                                                                        {model.name === 'Claude' && 'Conservative approach focusing on risk management and sustainable long-term gains.'}
                                                                        {model.name === 'GPT-4' && 'Aggressive high-frequency trading with rapid position changes and scalping.'}
                                                                        {model.name === 'Gemini' && 'Contrarian approach capitalizing on market overreactions and reversals.'}
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

                                                        {activeTab[model.name] === 'vault' && (
                                                            <div>
                                                                <div className="grid grid-cols-3 gap-4 mb-4">
                                                                    <div className="bg-gray-700/50 p-3 rounded-lg">
                                                                        <p className="text-sm text-gray-400 mb-1">Total Value Locked</p>
                                                                        <p className="text-xl font-bold">{formatCurrency(model.tvl)}</p>
                                                                    </div>
                                                                    <div className="bg-gray-700/50 p-3 rounded-lg">
                                                                        <p className="text-sm text-gray-400 mb-1">Depositors</p>
                                                                        <p className="text-xl font-bold">{Math.floor(model.tvl / 2500)}</p>
                                                                    </div>
                                                                    <div className="bg-gray-700/50 p-3 rounded-lg">
                                                                        <p className="text-sm text-gray-400 mb-1">APY</p>
                                                                        <p className="text-xl font-bold text-green-400">{(45.2 - index * 8).toFixed(1)}%</p>
                                                                    </div>
                                                                </div>
                                                                
                                                                <div className="bg-gray-700/50 p-4 rounded-lg">
                                                                    <h4 className="font-semibold mb-2">Vault Information</h4>
                                                                    <p className="text-gray-400 text-sm mb-4">
                                                                        This vault allows users to deposit funds that will be automatically traded by the {model.name} AI model.
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
                                                            </div>
                                                        )}

                                                        {activeTab[model.name] === 'trades' && (
                                                            <div>
                                                                <h4 className="font-semibold mb-3">Recent Trades</h4>
                                                                <div className="space-y-2">
                                                                    {[
                                                                        { asset: 'BTC', action: 'BUY', amount: 0.15, price: 43250, pnl: 245, time: '2 min ago' },
                                                                        { asset: 'ETH', action: 'SELL', amount: 2.3, price: 2280, pnl: -128, time: '15 min ago' },
                                                                        { asset: 'SOL', action: 'BUY', amount: 45, price: 98.5, pnl: 380, time: '1 hour ago' },
                                                                    ].map((trade, tradeIndex) => (
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

                                                        {activeTab[model.name] === 'performance' && (
                                                            <div>
                                                                <h4 className="font-semibold mb-3">Performance Chart</h4>
                                                                <div className="bg-gray-700/50 p-6 rounded-lg">
                                                                    <div className="h-48 flex items-center justify-center border-2 border-dashed border-gray-600 rounded-lg">
                                                                        <p className="text-gray-400">Performance chart visualization for {model.name}</p>
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
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                      {/* Season Statistics */}
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold mb-4">Season Statistics</h3>
                        <div className="grid grid-cols-3 gap-6">
                          <div className="bg-gray-800/50 p-4 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <TrendingUp className="w-5 h-5 text-green-400" />
                              <p className="font-semibold">Best Performer</p>
                            </div>
                            <p className="text-2xl font-bold text-green-400">
                              {season.metrics.bestPerformer || 'TBD'}
                            </p>
                          </div>
                          
                          <div className="bg-gray-800/50 p-4 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <Activity className="w-5 h-5 text-blue-400" />
                              <p className="font-semibold">Average APY</p>
                            </div>
                            <p className="text-2xl font-bold text-blue-400">
                              {season.metrics.averageAPY > 0 ? `+${season.metrics.averageAPY}%` : 'TBD'}
                            </p>
                          </div>
                          
                          <div className="bg-gray-800/50 p-4 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <Users className="w-5 h-5 text-purple-400" />
                              <p className="font-semibold">Total Depositors</p>
                            </div>
                            <p className="text-2xl font-bold text-purple-400">
                              {season.metrics.totalDepositors}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Timeline */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Timeline</h3>
                        <div className="space-y-3">
                          {season.milestones.map((milestone, index) => (
                            <div key={index} className="flex items-center space-x-4">
                              <div className={`w-3 h-3 rounded-full ${
                                milestone.type === 'creation' ? 'bg-blue-400' :
                                milestone.type === 'start' ? 'bg-green-400' :
                                milestone.type === 'milestone' ? 'bg-yellow-400' :
                                'bg-gray-400'
                              }`} />
                              <div className="flex-1">
                                <p className="font-medium">{milestone.event}</p>
                                <p className="text-sm text-gray-400">{formatDate(milestone.date)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>

        {/* Create Season Button (for admins) */}
        <div className="mt-8 text-center">
          <button className="bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-black font-semibold px-8 py-3 rounded-lg hover:opacity-90 transition-opacity">
            Create New Season
          </button>
        </div>
      </div>

      {/* Modals */}
      {selectedModel && (
        <>
          <DepositModal
            isOpen={depositModalOpen}
            onClose={() => setDepositModalOpen(false)}
            modelName={selectedModel.name}
            modelEmoji={getModelEmoji(selectedModel.name)}
            vaultInfo={{
              tvl: selectedModel.tvl,
              depositors: Math.floor(selectedModel.tvl / 2500),
              apy: 45.2 - (seasonsData[0].aiModels.findIndex((m: any) => m.name === selectedModel.name) * 8),
              minDeposit: 10
            }}
          />
          
          <WithdrawModal
            isOpen={withdrawModalOpen}
            onClose={() => setWithdrawModalOpen(false)}
            modelName={selectedModel.name}
            modelEmoji={getModelEmoji(selectedModel.name)}
            seasonNumber={seasonsData[0].seasonNumber}
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
