"use client"

import React, { useState, useMemo } from 'react';
import { Brain, Shield, ExternalLink, Clock, TrendingUp, TrendingDown, CheckCircle, XCircle, Activity, Filter, Search, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTradeHistory, TradeRecord } from '@/hooks/useTradeHistory';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { getSeasonStatusText } from '@/hooks/useSeasonManager';
import { DataAdapter } from '@/data/dataAdapter';
import Link from 'next/link';

export default function HistoryContainer() {
  const account = useCurrentAccount();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModel, setSelectedModel] = useState('all');
  const [selectedAction, setSelectedAction] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedSeason, setSelectedSeason] = useState<number | undefined>();
  const [timeRange, setTimeRange] = useState('7d');
  
  const { trades, isLoading } = useTradeHistory(selectedSeason);
  
  const filteredHistory = useMemo(() => {
    if (!trades) return [];
    
    return trades.filter((item: TradeRecord) => {
      // Search filter
      if (searchTerm && !item.aiModel.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !item.pair.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Model filter
      if (selectedModel !== 'all' && item.aiModel !== selectedModel) {
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
      const itemTime = new Date(item.timestamp); // Already in milliseconds
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
  }, [trades, searchTerm, selectedModel, selectedAction, selectedStatus, timeRange]);
  
  const formatTimestamp = (timestamp: number) => {
    const now = new Date();
    const itemTime = new Date(timestamp); // Already in milliseconds
    const diff = now.getTime() - itemTime.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };
  
  const getModelEmoji = (model: string) => {
    return DataAdapter.getModelEmoji(model);
  };
  
  const getModelColor = (model: string) => {
    return DataAdapter.getModelColor(model);
  };
  
  const stats = useMemo(() => {
    if (!filteredHistory.length) {
      return {
        total: 0,
        profitable: 0,
        totalPnL: 0,
        winRate: 0,
      };
    }
    
    const total = filteredHistory.length;
    const profitable = filteredHistory.filter(item => (item.pnl || 0) > 0).length;
    const totalPnL = filteredHistory.reduce((sum, item) => sum + (item.pnl || 0), 0);
    const winRate = total > 0 ? (profitable / total) * 100 : 0;
    
    return {
      total,
      profitable,
      totalPnL,
      winRate,
    };
  }, [filteredHistory]);

  if (!account) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-6">Please connect your Sui wallet to view trading history</p>
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
              {stats.totalPnL >= 0 ? '+' : ''}${stats.totalPnL.toFixed(2)}
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-[#00ff88]" />
              <h3 className="text-lg font-bold">Filters</h3>
            </div>
            <Link
              href="/season"
              className="px-4 py-2 bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-black font-semibold rounded-lg hover:shadow-lg hover:shadow-[#00ff88]/50 transition-all text-sm"
            >
              View Seasons
            </Link>
          </div>
          
          <div className="grid grid-cols-6 gap-4">
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
            
            {/* Season Filter */}
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
            
            {/* Model Filter */}
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="px-4 py-2 bg-black/60 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88]"
            >
              <option value="all">All Models</option>
              {DataAdapter.getAvailableModels().map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
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
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00ff88] mx-auto mb-4"></div>
            <p className="text-gray-400">Loading trading history...</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/40 backdrop-blur-sm border border-gray-800 rounded-xl p-12 text-center"
          >
            <div className="text-6xl mb-4">📈</div>
            <h3 className="text-xl font-bold mb-2">No Trading History</h3>
            <p className="text-gray-400 mb-6">
              {selectedSeason ? `No trades found for Season ${selectedSeason}` : 'No trading history found with current filters'}
            </p>
            <Link
              href="/season"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-black font-bold rounded-lg hover:shadow-lg hover:shadow-[#00ff88]/50 transition-all"
            >
              Explore Seasons
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((item: TradeRecord, index: number) => (
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
                    <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                      <img 
                        src={
                          item.aiModel === 'NOVA' ? '/amazon-nova.png' :
                          item.aiModel === 'CLAUDE' ? '/claude-icon.png' :
                          item.aiModel === 'LLAMA' ? '/llama-icon.png' :
                          '/amazon-nova.png' // fallback
                        }
                        alt={item.aiModel}
                        className="w-full h-full object-cover"
                      />
                    </div>
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
                        <span className="px-2 py-1 text-xs font-medium bg-gray-800 rounded-lg">
                          Season {item.seasonNumber}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-lg bg-blue-500/20 text-blue-400`}>
                          Active
                        </span> 
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimestamp(item.timestamp)}
                        </span>
                        <span className="font-semibold" style={{ color: getModelColor(item.aiModel) }}>
                          {item.aiModel}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-lg ${
                      item.status === 'active' ? 'bg-[#00d4ff]/20 text-[#00d4ff]' :
                      (item.pnl || 0) >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {item.status === 'active' ? (
                        <>
                          <Activity className="w-3 h-3" />
                          <span className="text-xs font-bold">ACTIVE</span>
                        </>
                      ) : (item.pnl || 0) >= 0 ? (
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
                    <p className={`text-lg font-bold mt-2 ${(item.pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {(item.pnl || 0) >= 0 ? '+' : ''}${(item.pnl || 0).toFixed(2)}
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
                    <p className="font-bold">${item.entryPrice.toFixed(4)}</p>
                  </div>
                  <div className="bg-[#0a0a0f]/60 border border-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Current/Exit</p>
                    <p className="font-bold">${(item.exitPrice || item.entryPrice).toFixed(4)}</p>
                  </div>
                  <div className="bg-[#0a0a0f]/60 border border-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Amount</p>
                    <p className="font-bold">${item.usdcAmount.toFixed(2)}</p>
                  </div>
                  <div className="bg-[#0a0a0f]/60 border border-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Confidence</p>
                    <p className="font-bold text-[#00ff88]">{item.confidence}%</p>
                  </div>
                  <div className="bg-[#0a0a0f]/60 border border-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">P&L</p>
                    <p className={`font-bold ${(item.pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {(item.pnl || 0) >= 0 ? '+' : ''}${(item.pnl || 0).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Walrus Link */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <Shield className="w-3 h-3" />
                    <span>Verified on Walrus</span>
                    <span className="text-gray-600">•</span>
                    <span className="font-mono">{item.walrusBlobId}</span>
                  </div>
                  <a
                    href={`https://walrus.sui/blob/${item.walrusBlobId}`}
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
        )}
      </div>
    </div>
  );
}
