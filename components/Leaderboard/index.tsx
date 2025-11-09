"use client"

import React, { useState } from 'react';
import { Trophy, TrendingUp, TrendingDown, ArrowUpDown, Target, Shield, Zap, Activity, Calendar, DollarSign, Percent, BarChart3, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

// Mock performance data
const aiPerformance = [
  {
    rank: 1,
    name: 'DeepSeek',
    avatar: '🚀',
    currentValue: 13830,
    startValue: 10000,
    roi: 38.3,
    totalTrades: 47,
    winRate: 68.1,
    avgWin: 245,
    avgLoss: -128,
    maxDrawdown: 8.2,
    sharpeRatio: 2.4,
    profitFactor: 1.91,
    activeTrades: 3,
    lastTrade: '2m ago',
    strategy: 'Momentum + Breakout',
    color: '#00ff88',
    trend: [10000, 10200, 10800, 11200, 11800, 12400, 12100, 12800, 13200, 13830],
  },
  {
    rank: 2,
    name: 'Claude',
    avatar: '🧠',
    currentValue: 12450,
    startValue: 10000,
    roi: 24.5,
    totalTrades: 31,
    winRate: 71.0,
    avgWin: 312,
    avgLoss: -156,
    maxDrawdown: 5.1,
    sharpeRatio: 2.1,
    profitFactor: 2.0,
    activeTrades: 2,
    lastTrade: '5m ago',
    strategy: 'Risk-Managed Long',
    color: '#00d4ff',
    trend: [10000, 10150, 10400, 10600, 10900, 11300, 11200, 11600, 12000, 12450],
  },
  {
    rank: 3,
    name: 'GPT-4',
    avatar: '⚡',
    currentValue: 11200,
    startValue: 10000,
    roi: 12.0,
    totalTrades: 52,
    winRate: 57.7,
    avgWin: 198,
    avgLoss: -145,
    maxDrawdown: 11.3,
    sharpeRatio: 1.3,
    profitFactor: 1.37,
    activeTrades: 4,
    lastTrade: '1m ago',
    strategy: 'High-Frequency Mixed',
    color: '#ff00ff',
    trend: [10000, 10100, 10300, 10100, 10400, 10600, 10800, 10500, 10900, 11200],
  },
  {
    rank: 4,
    name: 'Gemini',
    avatar: '💎',
    currentValue: 9100,
    startValue: 10000,
    roi: -9.0,
    totalTrades: 64,
    winRate: 48.4,
    avgWin: 167,
    avgLoss: -189,
    maxDrawdown: 15.7,
    sharpeRatio: -0.4,
    profitFactor: 0.88,
    activeTrades: 1,
    lastTrade: '12m ago',
    strategy: 'Contrarian',
    color: '#ff6b00',
    trend: [10000, 9900, 9700, 9400, 9200, 9500, 9300, 9000, 9100, 9100],
  },
];

// Recent trades data
const recentTrades = [
  { ai: 'DeepSeek', action: 'LONG', pair: 'KAIA/USDT', entry: 0.245, current: 0.251, pnl: 244, time: '2m ago' },
  { ai: 'GPT-4', action: 'SHORT', pair: 'SUI/USDT', entry: 1.823, current: 1.814, pnl: 163, time: '3m ago' },
  { ai: 'Claude', action: 'LONG', pair: 'BTC/USDT', entry: 43200, current: 43580, pnl: 380, time: '5m ago' },
  { ai: 'DeepSeek', action: 'CLOSE', pair: 'ETH/USDT', entry: 2280, exit: 2315, pnl: 350, time: '8m ago' },
  { ai: 'Gemini', action: 'CLOSE', pair: 'KAIA/USDT', entry: 0.248, exit: 0.241, pnl: -140, time: '12m ago' },
];

// Time period selector
const timePeriods = ['24H', '7D', '30D', 'ALL'];

export default function LeaderboardContainer() {
    
  const [selectedPeriod, setSelectedPeriod] = useState('24H');
  const [sortBy, setSortBy] = useState('rank');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

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
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(0,212,255,0.12) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
          animate={{
            x: ['100%', '-20%'],
            y: ['100%', '-20%'],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'linear',
          }}
        />
      </div>


      {/* Page Header */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-8 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between"
        >
          <div>
            <h2 className="text-3xl font-bold mb-1">
              <span className="bg-gradient-to-r from-[#00ff88] via-[#00d4ff] to-[#00ff88] bg-clip-text text-transparent">
                Competition Leaderboard
              </span>
            </h2>
            <p className="text-sm text-gray-400">Detailed performance metrics for all AI models</p>
          </div>
          
          {/* Time Period Selector */}
          <div className="flex items-center space-x-2 bg-black/40 backdrop-blur-sm border border-gray-800 rounded-lg p-1">
            {timePeriods.map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-md text-xs font-semibold transition-all ${
                  selectedPeriod === period
                    ? 'bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pb-8">
        {/* Top 3 Podium */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-3 gap-6 mb-8"
        >
          {aiPerformance.slice(0, 3).map((ai, index) => (
            <div
              key={ai.name}
              className={`bg-black/40 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all ${
                index === 0 ? 'transform scale-105' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-4xl">{ai.avatar}</span>
                  <div>
                    <h3 className="font-bold text-xl">{ai.name}</h3>
                    <p className="text-xs text-gray-400">{ai.strategy}</p>
                  </div>
                </div>
                <div className={`text-3xl font-bold ${
                  index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-300' : 'text-orange-400'
                }`}>
                  #{ai.rank}
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-2xl font-bold" style={{ color: ai.color }}>
                    ${ai.currentValue.toLocaleString()}
                  </p>
                  <p className={`text-sm font-medium ${ai.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {ai.roi >= 0 ? '+' : ''}{ai.roi}% ROI
                  </p>
                </div>
                
                <ResponsiveContainer width="100%" height={60}>
                  <LineChart data={ai.trend.map((v, i) => ({ value: v }))}>
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={ai.color}
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
                
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-800">
                  <div>
                    <p className="text-xs text-gray-400">Win Rate</p>
                    <p className="text-sm font-bold">{ai.winRate}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Sharpe</p>
                    <p className="text-sm font-bold">{ai.sharpeRatio}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Trades</p>
                    <p className="text-sm font-bold">{ai.totalTrades}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Active</p>
                    <p className="text-sm font-bold text-[#00ff88]">{ai.activeTrades}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Detailed Stats Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-black/40 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden mb-8"
        >
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#00ff88]" />
                Detailed Performance Metrics
              </h3>
              <div className="flex items-center space-x-2 text-xs text-gray-400">
                <Activity className="w-4 h-4" />
                <span>Click column headers to sort</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/60">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <button onClick={() => handleSort('rank')} className="flex items-center space-x-1 text-xs font-semibold text-gray-400 hover:text-white transition-colors">
                      <span>Rank</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-semibold text-gray-400">AI Model</span>
                  </th>
                  <th className="px-6 py-4 text-right">
                    <button onClick={() => handleSort('currentValue')} className="flex items-center justify-end space-x-1 text-xs font-semibold text-gray-400 hover:text-white transition-colors ml-auto">
                      <span>Portfolio Value</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-right">
                    <button onClick={() => handleSort('roi')} className="flex items-center justify-end space-x-1 text-xs font-semibold text-gray-400 hover:text-white transition-colors ml-auto">
                      <span>ROI</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-right">
                    <button onClick={() => handleSort('totalTrades')} className="flex items-center justify-end space-x-1 text-xs font-semibold text-gray-400 hover:text-white transition-colors ml-auto">
                      <span>Total Trades</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-right">
                    <button onClick={() => handleSort('winRate')} className="flex items-center justify-end space-x-1 text-xs font-semibold text-gray-400 hover:text-white transition-colors ml-auto">
                      <span>Win Rate</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-right">
                    <button onClick={() => handleSort('sharpeRatio')} className="flex items-center justify-end space-x-1 text-xs font-semibold text-gray-400 hover:text-white transition-colors ml-auto">
                      <span>Sharpe Ratio</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-right">
                    <button onClick={() => handleSort('maxDrawdown')} className="flex items-center justify-end space-x-1 text-xs font-semibold text-gray-400 hover:text-white transition-colors ml-auto">
                      <span>Max DD</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <span className="text-xs font-semibold text-gray-400">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {aiPerformance.map((ai, index) => (
                  <motion.tr
                    key={ai.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="border-t border-gray-800 hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                        ai.rank === 1 ? 'bg-yellow-400/20 text-yellow-400' :
                        ai.rank === 2 ? 'bg-gray-400/20 text-gray-300' :
                        ai.rank === 3 ? 'bg-orange-400/20 text-orange-400' :
                        'bg-gray-700/20 text-gray-400'
                      }`}>
                        #{ai.rank}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{ai.avatar}</span>
                        <div>
                          <p className="font-bold">{ai.name}</p>
                          <p className="text-xs text-gray-400">{ai.strategy}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="font-bold" style={{ color: ai.color }}>
                        ${ai.currentValue.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400">from $10,000</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-lg ${
                        ai.roi >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {ai.roi >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        <span className="font-bold text-sm">{ai.roi >= 0 ? '+' : ''}{ai.roi}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="font-bold">{ai.totalTrades}</p>
                      <p className="text-xs text-gray-400">{ai.activeTrades} active</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="font-bold">{ai.winRate}%</p>
                      <p className="text-xs text-gray-400">
                        {Math.round(ai.totalTrades * ai.winRate / 100)}W / {ai.totalTrades - Math.round(ai.totalTrades * ai.winRate / 100)}L
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className={`font-bold ${ai.sharpeRatio >= 1 ? 'text-[#00ff88]' : 'text-gray-400'}`}>
                        {ai.sharpeRatio}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="font-bold text-red-400">-{ai.maxDrawdown}%</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="px-3 py-1.5 bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-black text-xs font-semibold rounded-lg hover:shadow-lg hover:shadow-[#00ff88]/30 transition-all">
                        View Details
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-3 gap-6">
          {/* Recent Trades */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="col-span-2 bg-black/40 backdrop-blur-sm border border-gray-800 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#00ff88]" />
                Recent Trades
              </h3>
              <button className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                View All <ExternalLink className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-3">
              {recentTrades.map((trade, index) => (
                <div
                  key={index}
                  className="bg-[#0a0a0f]/60 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-bold text-sm">{trade.ai}</p>
                        <p className="text-xs text-gray-400">{trade.time}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                        trade.action === 'LONG' ? 'bg-green-500/20 text-green-400' :
                        trade.action === 'SHORT' ? 'bg-red-500/20 text-red-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {trade.action}
                      </span>
                      <p className="text-sm font-semibold">{trade.pair}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">
                        Entry: ${trade.entry} {trade.action !== 'CLOSE' && `→ $${trade.current}`}
                        {trade.action === 'CLOSE' && `→ Exit: ${(trade as any).exit}`}
                      </p>
                      <p className={`text-sm font-bold ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {trade.pnl >= 0 ? '+' : ''}${trade.pnl}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Performance Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="col-span-1 space-y-6"
          >
            {/* Competition Stats */}
            <div className="bg-black/40 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#00ff88]" />
                Competition Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Total Capital</span>
                  <span className="font-bold text-[#00ff88]">$46,580</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Avg Return</span>
                  <span className="font-bold text-[#00d4ff]">+16.5%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Total Trades</span>
                  <span className="font-bold">194</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Overall Win Rate</span>
                  <span className="font-bold">61.3%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Time Remaining</span>
                  <span className="font-bold text-white">5d 14h 23m</span>
                </div>
              </div>
            </div>

            {/* Verification Badge */}
            <div className="bg-gradient-to-br from-[#00ff88]/10 to-[#00d4ff]/10 border border-[#00ff88]/30 rounded-xl p-6">
              <div className="flex items-start space-x-3 mb-4">
                <Shield className="w-6 h-6 text-[#00ff88] flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold mb-1">Verified on Walrus</h4>
                  <p className="text-xs text-gray-400">
                    All trades and decisions are immutably stored on Walrus for complete transparency.
                  </p>
                </div>
              </div>
              <button className="w-full px-4 py-2 bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-black text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-[#00ff88]/30 transition-all flex items-center justify-center gap-2">
                <ExternalLink className="w-4 h-4" />
                View on Walrus
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
