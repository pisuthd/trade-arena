"use client"

import React, { useState, useMemo } from 'react';
import { Brain, Shield, ExternalLink, Clock, TrendingUp, TrendingDown, CheckCircle, XCircle, Activity, Filter, Search } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock comprehensive trading history data
const generateMockHistory = () => {
  const models = ['DeepSeek', 'Claude', 'GPT-4', 'Gemini'];
  const actions = ['LONG', 'SHORT', 'CLOSE'];
  const pairs = ['SUI/USDC', 'SUI/USDT', 'SUI/WETH'];
  const statuses = ['active', 'closed', 'stopped'];
  
  const history = [];
  
  // Generate 50 mock entries
  for (let i = 0; i < 50; i++) {
    const model = models[Math.floor(Math.random() * models.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];
    const pair = pairs[Math.floor(Math.random() * pairs.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const isProfitable = Math.random() > 0.4;
    
    const entry = 1.5 + Math.random() * 0.8;
    const exit = status === 'active' ? entry + (Math.random() - 0.5) * 0.2 : entry + (isProfitable ? Math.random() * 0.3 : -Math.random() * 0.2);
    const amount = 100 + Math.random() * 900;
    const pnl = status === 'active' ? (exit - entry) * amount : (exit - entry) * amount;
    
    // Generate timestamp within last 7 days
    const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
    
    history.push({
      id: `wal_${Math.random().toString(36).substr(2, 9)}`,
      timestamp,
      model,
      action,
      pair,
      amount: Math.round(amount),
      entry: parseFloat(entry.toFixed(4)),
      current: parseFloat(exit.toFixed(4)),
      exit: status !== 'active' ? parseFloat(exit.toFixed(4)) : null,
      pnl: Math.round(pnl),
      leverage: ['2x', '3x', '4x', '5x'][Math.floor(Math.random() * 4)],
      confidence: Math.round(70 + Math.random() * 30),
      status,
      reasoning: generateReasoning(model, action, isProfitable),
      walrusLink: 'https://walrus.sui/blob/example',
    });
  }
  
  return history.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

const generateReasoning = (model: string, action: string, isProfitable: boolean) => {
  const reasons = {
    'DeepSeek': [
      'Strong momentum detected with RSI oversold recovery',
      'Breakout above resistance with volume confirmation',
      'Bullish divergence on multiple timeframes',
    ],
    'Claude': [
      'Risk-managed entry with stop loss below support',
      'Conservative position sizing based on volatility',
      'Long-term trend following with confirmation',
    ],
    'GPT-4': [
      'High-frequency scalping opportunity detected',
      'Quick momentum play with tight risk management',
      'Short-term pattern recognition signal',
    ],
    'Gemini': [
      'Contrarian signal - market overextended',
      'Reversal pattern detected at key levels',
      'Fade the crowd strategy with statistical edge',
    ],
  };
  
  const modelReasons = reasons[model as keyof typeof reasons] || reasons['DeepSeek'];
  const baseReason = modelReasons[Math.floor(Math.random() * modelReasons.length)];
  
  if (action === 'CLOSE') {
    return isProfitable 
      ? `Target reached - ${baseReason.toLowerCase()}`
      : `Stop loss triggered - ${baseReason.toLowerCase()}`;
  }
  
  return baseReason;
};

export default function HistoryContainer() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModel, setSelectedModel] = useState('all');
  const [selectedAction, setSelectedAction] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [timeRange, setTimeRange] = useState('7d');
  
  const historyData = useMemo(() => generateMockHistory(), []);
  
  const filteredHistory = useMemo(() => {
    return historyData.filter(item => {
      // Search filter
      if (searchTerm && !item.model.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !item.pair.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Model filter
      if (selectedModel !== 'all' && item.model !== selectedModel) {
        return false;
      }
      
      // Action filter
      if (selectedAction !== 'all' && item.action !== selectedAction) {
        return false;
      }
      
      // Status filter
      if (selectedStatus !== 'all' && item.status !== selectedStatus) {
        return false;
      }
      
      // Time range filter
      const now = new Date();
      const itemTime = new Date(item.timestamp);
      let cutoffTime = new Date();
      
      switch (timeRange) {
        case '24h':
          cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          cutoffTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          cutoffTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          cutoffTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }
      
      return itemTime >= cutoffTime;
    });
  }, [historyData, searchTerm, selectedModel, selectedAction, selectedStatus, timeRange]);
  
  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };
  
  const getModelEmoji = (model: string) => {
    const emojis = {
      'DeepSeek': '🚀',
      'Claude': '🧠',
      'GPT-4': '⚡',
      'Gemini': '💎',
    };
    return emojis[model as keyof typeof emojis] || '🤖';
  };
  
  const getModelColor = (model: string) => {
    const colors = {
      'DeepSeek': '#00ff88',
      'Claude': '#00d4ff',
      'GPT-4': '#ff00ff',
      'Gemini': '#ff6b00',
    };
    return colors[model as keyof typeof colors] || '#ffffff';
  };
  
  const stats = useMemo(() => {
    const total = filteredHistory.length;
    const profitable = filteredHistory.filter(item => item.pnl > 0).length;
    const totalPnL = filteredHistory.reduce((sum, item) => sum + item.pnl, 0);
    const winRate = total > 0 ? (profitable / total) * 100 : 0;
    
    return {
      total,
      profitable,
      totalPnL,
      winRate,
    };
  }, [filteredHistory]);

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

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-8 pb-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-[#00ff88] to-[#00d4ff] bg-clip-text text-transparent">
              AI Trading History
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Complete transparency of all AI trading decisions, verified and stored on Walrus
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-black/40 backdrop-blur-sm border border-gray-800 rounded-xl p-4 text-center">
            <Activity className="w-6 h-6 text-[#00ff88] mx-auto mb-2" />
            <p className="text-2xl font-bold text-[#00ff88]">{stats.total}</p>
            <p className="text-xs text-gray-400">Total Trades</p>
          </div>
          <div className="bg-black/40 backdrop-blur-sm border border-gray-800 rounded-xl p-4 text-center">
            <CheckCircle className="w-6 h-6 text-[#00d4ff] mx-auto mb-2" />
            <p className="text-2xl font-bold text-[#00d4ff]">{stats.profitable}</p>
            <p className="text-xs text-gray-400">Profitable Trades</p>
          </div>
          <div className="bg-black/40 backdrop-blur-sm border border-gray-800 rounded-xl p-4 text-center">
            <TrendingUp className="w-6 h-6 text-[#ff00ff] mx-auto mb-2" />
            <p className={`text-2xl font-bold ${stats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {stats.totalPnL >= 0 ? '+' : ''}${stats.totalPnL}
            </p>
            <p className="text-xs text-gray-400">Total P&L</p>
          </div>
          <div className="bg-black/40 backdrop-blur-sm border border-gray-800 rounded-xl p-4 text-center">
            <Shield className="w-6 h-6 text-[#ff6b00] mx-auto mb-2" />
            <p className="text-2xl font-bold text-[#ff6b00]">{stats.winRate.toFixed(1)}%</p>
            <p className="text-xs text-gray-400">Win Rate</p>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-black/40 backdrop-blur-sm border border-gray-800 rounded-xl p-6 mb-8"
        >
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="w-5 h-5 text-[#00ff88]" />
            <h3 className="text-lg font-bold">Filters</h3>
          </div>
          
          <div className="grid grid-cols-5 gap-4">
            {/* Search */}
            <div className="col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by model or pair..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-black/60 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88]"
                />
              </div>
            </div>
            
            {/* Model Filter */}
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="px-4 py-2 bg-black/60 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88]"
            >
              <option value="all">All Models</option>
              <option value="DeepSeek">DeepSeek</option>
              <option value="Claude">Claude</option>
              <option value="GPT-4">GPT-4</option>
              <option value="Gemini">Gemini</option>
            </select>
            
            {/* Action Filter */}
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="px-4 py-2 bg-black/60 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88]"
            >
              <option value="all">All Actions</option>
              <option value="LONG">LONG</option>
              <option value="SHORT">SHORT</option>
              <option value="CLOSE">CLOSE</option>
            </select>
            
            {/* Time Range Filter */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 bg-black/60 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88]"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
        </motion.div>

        {/* Walrus Verification Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-gradient-to-r from-[#00ff88]/10 to-[#00d4ff]/10 border border-[#00ff88]/30 rounded-xl p-4 mb-8 flex items-start space-x-3"
        >
          <Shield className="w-5 h-5 text-[#00ff88] flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm mb-1">Verified on Walrus</h4>
            <p className="text-xs text-gray-400">
              Every trading decision, including AI reasoning and market conditions, is immutably stored on Walrus. Click "View on Walrus" to verify any trade.
            </p>
          </div>
        </motion.div>

        {/* History List */}
        <div className="space-y-4">
          {filteredHistory.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.02 }}
              className="bg-black/40 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">{getModelEmoji(item.model)}</div>
                  <div>
                    <div className="flex items-center space-x-3 mb-1">
                      <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
                        item.action === 'LONG' ? 'bg-green-500/20 text-green-400' :
                        item.action === 'SHORT' ? 'bg-red-500/20 text-red-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {item.action}
                      </span>
                      <span className="font-bold text-lg">{item.pair}</span>
                      <span className="text-sm text-gray-400">{item.leverage}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimestamp(item.timestamp)}
                      </span>
                      <span className="font-semibold" style={{ color: getModelColor(item.model) }}>
                        {item.model}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-lg ${
                    item.status === 'active' ? 'bg-[#00d4ff]/20 text-[#00d4ff]' :
                    item.pnl >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {item.status === 'active' ? (
                      <>
                        <Activity className="w-3 h-3" />
                        <span className="text-xs font-bold">ACTIVE</span>
                      </>
                    ) : item.pnl >= 0 ? (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        <span className="text-xs font-bold">PROFIT</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" />
                        <span className="text-xs font-bold">LOSS</span>
                      </>
                    )}
                  </div>
                  <p className={`text-lg font-bold mt-2 ${item.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {item.pnl >= 0 ? '+' : ''}${item.pnl}
                  </p>
                </div>
              </div>

              {/* AI Reasoning */}
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-3">
                  <Brain className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm mb-2 text-purple-300">AI Reasoning:</h4>
                    <p className="text-sm text-gray-300">{item.reasoning}</p>
                  </div>
                </div>
              </div>

              {/* Trade Details */}
              <div className="grid grid-cols-5 gap-4 mb-4">
                <div className="bg-[#0a0a0f]/60 border border-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Entry Price</p>
                  <p className="font-bold">${item.entry}</p>
                </div>
                <div className="bg-[#0a0a0f]/60 border border-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Current/Exit</p>
                  <p className="font-bold">${item.current || item.exit}</p>
                </div>
                <div className="bg-[#0a0a0f]/60 border border-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Amount</p>
                  <p className="font-bold">${item.amount}</p>
                </div>
                <div className="bg-[#0a0a0f]/60 border border-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Confidence</p>
                  <p className="font-bold text-[#00ff88]">{item.confidence}%</p>
                </div>
                <div className="bg-[#0a0a0f]/60 border border-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">P&L</p>
                  <p className={`font-bold ${item.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {item.pnl >= 0 ? '+' : ''}${item.pnl}
                  </p>
                </div>
              </div>

              {/* Walrus Link */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <Shield className="w-3 h-3" />
                  <span>Verified on Walrus</span>
                  <span className="text-gray-600">•</span>
                  <span className="font-mono">{item.id}</span>
                </div>
                <a
                  href={item.walrusLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-xs text-[#00ff88] hover:text-[#00d4ff] transition-colors"
                >
                  <span>View on Walrus</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredHistory.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <p className="text-gray-400">No trading history found with the current filters.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
