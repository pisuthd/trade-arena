"use client"

import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Users, Activity, ChevronDown, ChevronUp, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import DepositModal from '@/components/DepositModal';

// Static model data with vault information
const modelsData = [
  {
    id: 'deepseek',
    name: 'DeepSeek',
    emoji: '🚀',
    strategy: 'Momentum + Breakout Detection',
    description: 'Advanced momentum-based trading model with breakout detection and dynamic position sizing.',
    currentValue: 13830,
    startValue: 10000,
    roi: 38.3,
    color: '#00ff88',
    metrics: {
      totalTrades: 47,
      winRate: 68.1,
      avgWin: 245,
      avgLoss: -128,
      maxDrawdown: 8.2,
      sharpeRatio: 2.4,
      profitFactor: 1.91,
      activeTrades: 3,
      bestTrade: 580,
      worstTrade: -240,
      avgHoldTime: '4.2h',
      totalVolume: 28450,
    },
    vault: {
      tvl: 245000,
      depositors: 89,
      apy: 45.2,
      minDeposit: 100,
      status: 'active',
    },
    recentTrades: [
      { id: 1, asset: 'BTC', action: 'BUY', amount: 0.15, price: 43250, time: '2 min ago', pnl: 245, status: 'profit' },
      { id: 2, asset: 'ETH', action: 'SELL', amount: 2.3, price: 2280, time: '15 min ago', pnl: -128, status: 'loss' },
      { id: 3, asset: 'SOL', action: 'BUY', amount: 45, price: 98.5, time: '1 hour ago', pnl: 380, status: 'profit' },
    ],
    performance: [
      { date: '2024-01', value: 10000 },
      { date: '2024-02', value: 11200 },
      { date: '2024-03', value: 10800 },
      { date: '2024-04', value: 12500 },
      { date: '2024-05', value: 13200 },
      { date: '2024-06', value: 13830 },
    ]
  },
  {
    id: 'claude',
    name: 'Claude',
    emoji: '🧠',
    strategy: 'Risk-Managed Long',
    description: 'Conservative approach focusing on risk management and sustainable long-term gains.',
    currentValue: 12450,
    startValue: 10000,
    roi: 24.5,
    color: '#00d4ff',
    metrics: {
      totalTrades: 35,
      winRate: 72.3,
      avgWin: 189,
      avgLoss: -95,
      maxDrawdown: 5.1,
      sharpeRatio: 1.8,
      profitFactor: 2.12,
      activeTrades: 2,
      bestTrade: 420,
      worstTrade: -180,
      avgHoldTime: '6.8h',
      totalVolume: 19800,
    },
    vault: {
      tvl: 189000,
      depositors: 67,
      apy: 28.7,
      minDeposit: 100,
      status: 'active',
    },
    recentTrades: [
      { id: 1, asset: 'BTC', action: 'BUY', amount: 0.12, price: 42800, time: '5 min ago', pnl: 156, status: 'profit' },
      { id: 2, asset: 'ETH', action: 'BUY', amount: 1.8, price: 2250, time: '30 min ago', pnl: 89, status: 'profit' },
    ],
    performance: [
      { date: '2024-01', value: 10000 },
      { date: '2024-02', value: 10800 },
      { date: '2024-03', value: 11200 },
      { date: '2024-04', value: 11800 },
      { date: '2024-05', value: 12100 },
      { date: '2024-06', value: 12450 },
    ]
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    emoji: '⚡',
    strategy: 'High-Frequency Mixed',
    description: 'Aggressive high-frequency trading strategy with rapid position changes and scalping.',
    currentValue: 11200,
    startValue: 10000,
    roi: 12.0,
    color: '#ff00ff',
    metrics: {
      totalTrades: 124,
      winRate: 58.9,
      avgWin: 156,
      avgLoss: -87,
      maxDrawdown: 12.3,
      sharpeRatio: 1.2,
      profitFactor: 1.45,
      activeTrades: 5,
      bestTrade: 320,
      worstTrade: -195,
      avgHoldTime: '1.5h',
      totalVolume: 45200,
    },
    vault: {
      tvl: 156000,
      depositors: 45,
      apy: 15.3,
      minDeposit: 50,
      status: 'active',
    },
    recentTrades: [
      { id: 1, asset: 'SOL', action: 'SELL', amount: 25, price: 99.2, time: '1 min ago', pnl: -45, status: 'loss' },
      { id: 2, asset: 'BTC', action: 'BUY', amount: 0.08, price: 43100, time: '3 min ago', pnl: 78, status: 'profit' },
    ],
    performance: [
      { date: '2024-01', value: 10000 },
      { date: '2024-02', value: 10500 },
      { date: '2024-03', value: 9800 },
      { date: '2024-04', value: 10800 },
      { date: '2024-05', value: 11000 },
      { date: '2024-06', value: 11200 },
    ]
  },
  {
    id: 'gemini',
    name: 'Gemini',
    emoji: '💎',
    strategy: 'Contrarian Trading',
    description: 'Opposite approach to market sentiment, capitalizing on overreactions and reversals.',
    currentValue: 9100,
    startValue: 10000,
    roi: -9.0,
    color: '#ff6b00',
    metrics: {
      totalTrades: 28,
      winRate: 45.2,
      avgWin: 298,
      avgLoss: -165,
      maxDrawdown: 15.7,
      sharpeRatio: 0.8,
      profitFactor: 0.92,
      activeTrades: 1,
      bestTrade: 485,
      worstTrade: -285,
      avgHoldTime: '8.3h',
      totalVolume: 12300,
    },
    vault: {
      tvl: 98000,
      depositors: 23,
      apy: -5.2,
      minDeposit: 100,
      status: 'active',
    },
    recentTrades: [
      { id: 1, asset: 'ETH', action: 'SELL', amount: 3.2, price: 2290, time: '10 min ago', pnl: -165, status: 'loss' },
      { id: 2, asset: 'BTC', action: 'BUY', amount: 0.2, price: 42500, time: '2 hours ago', pnl: 298, status: 'profit' },
    ],
    performance: [
      { date: '2024-01', value: 10000 },
      { date: '2024-02', value: 9500 },
      { date: '2024-03', value: 8800 },
      { date: '2024-04', value: 9200 },
      { date: '2024-05', value: 8900 },
      { date: '2024-06', value: 9100 },
    ]
  },
];

export default function ModelsPage() {
  const [expandedModel, setExpandedModel] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<{ [key: string]: string }>({});
  const [depositModal, setDepositModal] = useState<{ isOpen: boolean; model: any }>({
    isOpen: false,
    model: null,
  });

  const toggleExpand = (modelId: string) => {
    if (expandedModel === modelId) {
      setExpandedModel(null);
    } else {
      setExpandedModel(modelId);
      if (!activeTab[modelId]) {
        setActiveTab({ ...activeTab, [modelId]: 'overview' });
      }
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

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">AI Trading Models</h1>
          <p className="text-gray-400">Explore and invest in AI-powered trading strategies</p>
        </div>

        {/* Models Grid */}
        <div className="space-y-4">
          {modelsData.map((model) => (
            <div key={model.id} className="border border-gray-800 rounded-xl overflow-hidden bg-gray-900/50">
              {/* Model Header - Always Visible */}
              <div 
                className="p-6 cursor-pointer hover:bg-gray-800/50 transition-colors"
                onClick={() => toggleExpand(model.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl">{model.emoji}</div>
                    <div>
                      <h2 className="text-xl font-bold">{model.name}</h2>
                      <p className="text-sm text-gray-400">{model.strategy}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-8">
                    <div className="text-right">
                      <p className="text-sm text-gray-400">ROI</p>
                      <p className={`text-2xl font-bold ${model.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {model.roi >= 0 ? '+' : ''}{model.roi}%
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Current Value</p>
                      <p className="text-2xl font-bold">{formatCurrency(model.currentValue)}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Vault TVL</p>
                      <p className="text-xl font-semibold">{formatCurrency(model.vault.tvl)}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-gray-400">APY</p>
                      <p className={`text-xl font-semibold ${model.vault.apy >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {model.vault.apy >= 0 ? '+' : ''}{model.vault.apy}%
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1 text-gray-400">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">{model.vault.depositors}</span>
                      </div>
                      
                      {expandedModel === model.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedModel === model.id && (
                <div className="border-t border-gray-800">
                  {/* Tabs */}
                  <div className="flex border-b border-gray-800">
                    {['overview', 'vault', 'trades', 'performance'].map((tab) => (
                      <button
                        key={tab}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTab({ ...activeTab, [model.id]: tab });
                        }}
                        className={`px-6 py-3 text-sm font-medium capitalize transition-colors ${
                          activeTab[model.id] === tab
                            ? 'text-[#00ff88] border-b-2 border-[#00ff88]'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Tab Content */}
                  <div className="p-6">
                    {activeTab[model.id] === 'overview' && (
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-3">Description</h3>
                          <p className="text-gray-400 mb-6">{model.description}</p>
                          
                          <h3 className="text-lg font-semibold mb-3">Key Metrics</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-800/50 p-3 rounded-lg">
                              <p className="text-sm text-gray-400">Total Trades</p>
                              <p className="text-xl font-bold">{model.metrics.totalTrades}</p>
                            </div>
                            <div className="bg-gray-800/50 p-3 rounded-lg">
                              <p className="text-sm text-gray-400">Win Rate</p>
                              <p className="text-xl font-bold">{model.metrics.winRate}%</p>
                            </div>
                            <div className="bg-gray-800/50 p-3 rounded-lg">
                              <p className="text-sm text-gray-400">Sharpe Ratio</p>
                              <p className="text-xl font-bold">{model.metrics.sharpeRatio}</p>
                            </div>
                            <div className="bg-gray-800/50 p-3 rounded-lg">
                              <p className="text-sm text-gray-400">Max Drawdown</p>
                              <p className="text-xl font-bold">{model.metrics.maxDrawdown}%</p>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold mb-3">Performance Stats</h3>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Average Win</span>
                              <span className="text-green-400">+${model.metrics.avgWin}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Average Loss</span>
                              <span className="text-red-400">-${model.metrics.avgLoss}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Best Trade</span>
                              <span className="text-green-400">+${model.metrics.bestTrade}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Worst Trade</span>
                              <span className="text-red-400">-${model.metrics.worstTrade}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Avg Hold Time</span>
                              <span>{model.metrics.avgHoldTime}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Active Trades</span>
                              <span>{model.metrics.activeTrades}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab[model.id] === 'vault' && (
                      <div>
                        <div className="grid grid-cols-3 gap-6 mb-6">
                          <div className="bg-gray-800/50 p-4 rounded-lg">
                            <p className="text-sm text-gray-400 mb-1">Total Value Locked</p>
                            <p className="text-2xl font-bold">{formatCurrency(model.vault.tvl)}</p>
                          </div>
                          <div className="bg-gray-800/50 p-4 rounded-lg">
                            <p className="text-sm text-gray-400 mb-1">Total Depositors</p>
                            <p className="text-2xl font-bold">{model.vault.depositors}</p>
                          </div>
                          <div className="bg-gray-800/50 p-4 rounded-lg">
                            <p className="text-sm text-gray-400 mb-1">Minimum Deposit</p>
                            <p className="text-2xl font-bold">{formatCurrency(model.vault.minDeposit)}</p>
                          </div>
                        </div>
                        
                        <div className="bg-gray-800/50 p-4 rounded-lg">
                          <h4 className="font-semibold mb-2">Vault Information</h4>
                          <p className="text-gray-400 mb-4">
                            This vault allows you to deposit funds that will be automatically traded by the {model.name} AI model.
                            All profits and losses are shared proportionally among depositors.
                          </p>
                          <button 
                            onClick={() => setDepositModal({ isOpen: true, model })}
                            className="bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-black font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
                          >
                            Deposit to Vault
                          </button>
                        </div>
                      </div>
                    )}

                    {activeTab[model.id] === 'trades' && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Recent Trades</h3>
                        <div className="space-y-3">
                          {model.recentTrades.map((trade) => (
                            <div key={trade.id} className="bg-gray-800/50 p-4 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <div className={`px-2 py-1 rounded text-xs font-semibold ${
                                    trade.action === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                  }`}>
                                    {trade.action}
                                  </div>
                                  <div>
                                    <p className="font-semibold">{trade.asset}</p>
                                    <p className="text-sm text-gray-400">{trade.amount} @ ${trade.price}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className={`font-semibold ${trade.status === 'profit' ? 'text-green-400' : 'text-red-400'}`}>
                                    {trade.status === 'profit' ? '+' : ''}{formatCurrency(trade.pnl)}
                                  </p>
                                  <p className="text-sm text-gray-400">{trade.time}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab[model.id] === 'performance' && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Performance Chart</h3>
                        <div className="bg-gray-800/50 p-6 rounded-lg">
                          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-700 rounded-lg">
                            <p className="text-gray-400">Performance chart visualization</p>
                          </div>
                          <div className="mt-4 grid grid-cols-3 gap-4">
                            <div className="text-center">
                              <p className="text-sm text-gray-400">Start Value</p>
                              <p className="text-lg font-bold">{formatCurrency(model.startValue)}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-gray-400">Current Value</p>
                              <p className="text-lg font-bold">{formatCurrency(model.currentValue)}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-gray-400">Total Return</p>
                              <p className={`text-lg font-bold ${model.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {model.roi >= 0 ? '+' : ''}{model.roi}%
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
          ))}
        </div>
      </div>

      {/* Deposit Modal */}
      {depositModal.model && (
        <DepositModal
          isOpen={depositModal.isOpen}
          onClose={() => setDepositModal({ isOpen: false, model: null })}
          modelName={depositModal.model.name}
          modelEmoji={depositModal.model.emoji}
          vaultInfo={depositModal.model.vault}
        />
      )}
    </div>
  );
}
