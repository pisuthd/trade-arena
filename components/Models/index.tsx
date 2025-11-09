"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { Brain, TrendingUp, TrendingDown, ArrowLeft, Shield, ExternalLink, Zap, Target, Activity, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Mock AI model data
const aiModelData = {
    name: 'DeepSeek',
    avatar: '🚀',
    rank: 1,
    color: '#00ff88',
    currentValue: 13830,
    startValue: 10000,
    roi: 38.3,
    description: 'Advanced momentum-based trading model with breakout detection and dynamic position sizing.',
    strategy: 'Momentum + Breakout Detection',

    // Performance metrics
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

    // Performance over time
    performance: [
        { time: '0h', value: 10000 },
        { time: '4h', value: 10200 },
        { time: '8h', value: 10800 },
        { time: '12h', value: 11200 },
        { time: '16h', value: 11800 },
        { time: '20h', value: 12400 },
        { time: '24h', value: 12100 },
        { time: '28h', value: 12800 },
        { time: '32h', value: 13200 },
        { time: '36h', value: 13830 },
    ],

    // Trade distribution by pair
    pairDistribution: [
        { pair: 'KAIA/USDT', trades: 18, pnl: 2240 },
        { pair: 'SUI/USDT', trades: 12, pnl: 980 },
        { pair: 'BTC/USDT', trades: 10, pnl: 450 },
        { pair: 'ETH/USDT', trades: 7, pnl: 160 },
    ],

    // Win/Loss breakdown
    winLossData: [
        { name: 'Wins', value: 32, color: '#00ff88' },
        { name: 'Losses', value: 15, color: '#ff6b6b' },
    ],
};

// Recent decisions with AI reasoning (stored on Walrus)
const recentDecisions = [
    {
        id: 'wal_4f3e2a1b',
        timestamp: '2m ago',
        action: 'LONG',
        pair: 'KAIA/USDT',
        amount: 500,
        entry: 0.245,
        current: 0.251,
        pnl: 244,
        leverage: '3x',
        confidence: 92,
        status: 'active',
        reasoning: 'Strong bullish momentum detected. RSI oversold recovery + volume spike + breakout above resistance at 0.243. High probability continuation pattern.',
        technicals: {
            rsi: 42,
            macd: 'Bullish crossover',
            volume: '+180%',
            trend: 'Strong uptrend',
        },
        walrusLink: 'https://walrus.sui/blob/4f3e2a1b',
    },
    {
        id: 'wal_8a2c5e9d',
        timestamp: '18m ago',
        action: 'CLOSE',
        pair: 'SUI/USDT',
        amount: 450,
        entry: 1.823,
        exit: 1.891,
        pnl: 306,
        leverage: '4x',
        confidence: 85,
        status: 'closed',
        reasoning: 'Target reached at 1.89 resistance level. Take profit at +3.7% to secure gains. RSI approaching overbought territory (72), risk/reward no longer favorable.',
        technicals: {
            rsi: 72,
            macd: 'Neutral',
            volume: '+45%',
            trend: 'Uptrend weakening',
        },
        walrusLink: 'https://walrus.sui/blob/8a2c5e9d',
    },
    {
        id: 'wal_1c7f4b2e',
        timestamp: '35m ago',
        action: 'SHORT',
        pair: 'BTC/USDT',
        amount: 350,
        entry: 43200,
        current: 43180,
        pnl: 20,
        leverage: '2x',
        confidence: 78,
        status: 'active',
        reasoning: 'Bearish divergence on 15m chart. Price making higher highs while RSI making lower highs. Resistance rejection at 43250. Stop loss at 43400.',
        technicals: {
            rsi: 68,
            macd: 'Bearish divergence',
            volume: '-12%',
            trend: 'Potential reversal',
        },
        walrusLink: 'https://walrus.sui/blob/1c7f4b2e',
    },
    {
        id: 'wal_9e3a6c1f',
        timestamp: '1h 12m ago',
        action: 'CLOSE',
        pair: 'KAIA/USDT',
        amount: 600,
        entry: 0.238,
        exit: 0.229,
        pnl: -162,
        leverage: '3x',
        confidence: 65,
        status: 'closed',
        reasoning: 'Stop loss triggered at -2.7%. Market conditions changed - unexpected negative news impact. Cut losses to preserve capital for better opportunities.',
        technicals: {
            rsi: 35,
            macd: 'Bearish',
            volume: '+220%',
            trend: 'Sharp reversal',
        },
        walrusLink: 'https://walrus.sui/blob/9e3a6c1f',
    },
];

// Hourly PnL data
const hourlyPnL = [
    { hour: '0h', pnl: 0 },
    { hour: '4h', pnl: 120 },
    { hour: '8h', pnl: 340 },
    { hour: '12h', pnl: 280 },
    { hour: '16h', pnl: 480 },
    { hour: '20h', pnl: 620 },
    { hour: '24h', pnl: 450 },
    { hour: '28h', pnl: 710 },
    { hour: '32h', pnl: 890 },
    { hour: '36h', pnl: 1120 },
];

export default function ModelsContainer() {

    const [selectedTab, setSelectedTab] = useState('overview');

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
                >
                    <Link href="/leaderboard" className="inline-flex items-center space-x-2 text-sm text-gray-400 hover:text-white transition-colors mb-4">
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Leaderboard</span>
                    </Link>

                    <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="text-6xl">{aiModelData.avatar}</div>
                            <div>
                                <div className="flex items-center space-x-3 mb-2">
                                    <h2 className="text-4xl font-bold">{aiModelData.name}</h2>
                                    <span className="px-3 py-1 bg-yellow-400/20 text-yellow-400 text-sm font-bold rounded-full">
                                        #1 Rank
                                    </span>
                                </div>
                                <p className="text-gray-400 mb-2">{aiModelData.description}</p>
                                <div className="flex items-center space-x-4 text-sm">
                                    <span className="text-gray-400">Strategy:</span>
                                    <span className="font-semibold text-[#00ff88]">{aiModelData.strategy}</span>
                                </div>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className="text-sm text-gray-400 mb-1">Current Portfolio Value</p>
                            <p className="text-4xl font-bold" style={{ color: aiModelData.color }}>
                                ${aiModelData.currentValue.toLocaleString()}
                            </p>
                            <p className="text-lg font-semibold text-green-400">
                                +{aiModelData.roi}% ROI
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Tab Navigation */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 mb-6">
                <div className="flex items-center space-x-2 bg-black/40 backdrop-blur-sm border border-gray-800 rounded-lg p-1">
                    {['overview', 'decisions', 'analytics'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setSelectedTab(tab)}
                            className={`px-6 py-2 rounded-md text-sm font-semibold transition-all capitalize ${selectedTab === tab
                                    ? 'bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-black'
                                    : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 pb-8">
                {selectedTab === 'overview' && (
                    <div className="grid grid-cols-3 gap-6">
                        {/* Performance Chart - Spans 2 columns */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="col-span-2 bg-black/40 backdrop-blur-sm border border-gray-800 rounded-xl p-6"
                        >
                            <h3 className="text-lg font-bold mb-4">Performance Over Time</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={aiModelData.performance}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
                                    <XAxis dataKey="time" stroke="#666" style={{ fontSize: '11px' }} />
                                    <YAxis stroke="#666" style={{ fontSize: '11px' }} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#0a0a0f',
                                            border: '1px solid #333',
                                            borderRadius: '8px',
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="value"
                                        stroke={aiModelData.color}
                                        strokeWidth={3}
                                        dot={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </motion.div>

                        {/* Key Metrics */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="col-span-1 bg-black/40 backdrop-blur-sm border border-gray-800 rounded-xl p-6"
                        >
                            <h3 className="text-lg font-bold mb-4">Key Metrics</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-400">Win Rate</span>
                                    <span className="font-bold text-[#00ff88]">{aiModelData.metrics.winRate}%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-400">Sharpe Ratio</span>
                                    <span className="font-bold">{aiModelData.metrics.sharpeRatio}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-400">Profit Factor</span>
                                    <span className="font-bold">{aiModelData.metrics.profitFactor}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-400">Max Drawdown</span>
                                    <span className="font-bold text-red-400">-{aiModelData.metrics.maxDrawdown}%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-400">Total Trades</span>
                                    <span className="font-bold">{aiModelData.metrics.totalTrades}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-400">Active Trades</span>
                                    <span className="font-bold text-[#00d4ff]">{aiModelData.metrics.activeTrades}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-400">Avg Hold Time</span>
                                    <span className="font-bold">{aiModelData.metrics.avgHoldTime}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-400">Total Volume</span>
                                    <span className="font-bold">${aiModelData.metrics.totalVolume.toLocaleString()}</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Trade Distribution */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="col-span-1 bg-black/40 backdrop-blur-sm border border-gray-800 rounded-xl p-6"
                        >
                            <h3 className="text-lg font-bold mb-4">Win/Loss Distribution</h3>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={aiModelData.winLossData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {aiModelData.winLossData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex items-center justify-center space-x-6 mt-4">
                                <div className="text-center">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <div className="w-3 h-3 bg-[#00ff88] rounded-full" />
                                        <span className="text-sm text-gray-400">Wins</span>
                                    </div>
                                    <p className="font-bold text-lg">32</p>
                                </div>
                                <div className="text-center">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <div className="w-3 h-3 bg-[#ff6b6b] rounded-full" />
                                        <span className="text-sm text-gray-400">Losses</span>
                                    </div>
                                    <p className="font-bold text-lg">15</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Performance by Pair */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="col-span-2 bg-black/40 backdrop-blur-sm border border-gray-800 rounded-xl p-6"
                        >
                            <h3 className="text-lg font-bold mb-4">Performance by Trading Pair</h3>
                            <div className="space-y-3">
                                {aiModelData.pairDistribution.map((pair, index) => (
                                    <div key={index} className="bg-[#0a0a0f]/60 border border-gray-800 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-bold">{pair.pair}</span>
                                            <span className={`font-bold ${pair.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {pair.pnl >= 0 ? '+' : ''}${pair.pnl}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm text-gray-400">
                                            <span>{pair.trades} trades</span>
                                            <span>Avg: ${Math.round(pair.pnl / pair.trades)}/trade</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}

                {selectedTab === 'decisions' && (
                    <div className="space-y-4">
                        <div className="bg-gradient-to-r from-[#00ff88]/10 to-[#00d4ff]/10 border border-[#00ff88]/30 rounded-xl p-4 flex items-start space-x-3">
                            <Shield className="w-5 h-5 text-[#00ff88] flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-sm mb-1">Verified AI Decisions on Walrus</h4>
                                <p className="text-xs text-gray-400">
                                    Every trading decision, including AI reasoning and market conditions, is immutably stored on Walrus for complete transparency.
                                </p>
                            </div>
                        </div>

                        {recentDecisions.map((decision, index) => (
                            <motion.div
                                key={decision.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className="bg-black/40 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all"
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center space-x-4">
                                        <span className={`px-3 py-1 rounded-lg text-sm font-bold ${decision.action === 'LONG' ? 'bg-green-500/20 text-green-400' :
                                                decision.action === 'SHORT' ? 'bg-red-500/20 text-red-400' :
                                                    'bg-gray-500/20 text-gray-400'
                                            }`}>
                                            {decision.action}
                                        </span>
                                        <div>
                                            <p className="font-bold text-lg">{decision.pair}</p>
                                            <p className="text-xs text-gray-400 flex items-center gap-2">
                                                <Clock className="w-3 h-3" />
                                                {decision.timestamp}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-lg ${decision.status === 'active' ? 'bg-[#00d4ff]/20 text-[#00d4ff]' :
                                                decision.pnl >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                            }`}>
                                            {decision.status === 'active' ? (
                                                <>
                                                    <Activity className="w-3 h-3" />
                                                    <span className="text-xs font-bold">ACTIVE</span>
                                                </>
                                            ) : decision.pnl >= 0 ? (
                                                <>
                                                    <CheckCircle className="w-3 h-3" />
                                                    <span className="text-xs font-bold">CLOSED</span>
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle className="w-3 h-3" />
                                                    <span className="text-xs font-bold">STOPPED</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* AI Reasoning Box */}
                                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-4 mb-4">
                                    <div className="flex items-start space-x-3">
                                        <Brain className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="font-bold text-sm mb-2 text-purple-300">AI Reasoning:</h4>
                                            <p className="text-sm text-gray-300">{decision.reasoning}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Technical Details Grid */}
                                <div className="grid grid-cols-4 gap-4 mb-4">
                                    <div className="bg-[#0a0a0f]/60 border border-gray-800 rounded-lg p-3">
                                        <p className="text-xs text-gray-400 mb-1">Entry Price</p>
                                        <p className="font-bold">${decision.entry}</p>
                                    </div>
                                    <div className="bg-[#0a0a0f]/60 border border-gray-800 rounded-lg p-3">
                                        <p className="text-xs text-gray-400 mb-1">Current/Exit</p>
                                        <p className="font-bold">${decision.current || decision.exit}</p>
                                    </div>
                                    <div className="bg-[#0a0a0f]/60 border border-gray-800 rounded-lg p-3">
                                        <p className="text-xs text-gray-400 mb-1">P&L</p>
                                        <p className={`font-bold ${decision.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {decision.pnl >= 0 ? '+' : ''}${decision.pnl}
                                        </p>
                                    </div>
                                    <div className="bg-[#0a0a0f]/60 border border-gray-800 rounded-lg p-3">
                                        <p className="text-xs text-gray-400 mb-1">Confidence</p>
                                        <p className="font-bold text-[#00ff88]">{decision.confidence}%</p>
                                    </div>
                                </div>

                                {/* Technicals */}
                                <div className="grid grid-cols-4 gap-4 mb-4">
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1">RSI</p>
                                        <p className="text-sm font-semibold">{decision.technicals.rsi}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1">MACD</p>
                                        <p className="text-sm font-semibold">{decision.technicals.macd}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1">Volume</p>
                                        <p className="text-sm font-semibold">{decision.technicals.volume}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1">Trend</p>
                                        <p className="text-sm font-semibold">{decision.technicals.trend}</p>
                                    </div>
                                </div>

                                {/* Walrus Link */}
                                <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                                        <Shield className="w-3 h-3" />
                                        <span>Verified on Walrus</span>
                                        <span className="text-gray-600">•</span>
                                        <span className="font-mono">{decision.id}</span>
                                    </div>
                                    <a
                                        href={decision.walrusLink}
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

                {selectedTab === 'analytics' && (
                    <div className="grid grid-cols-2 gap-6">
                        {/* Hourly P&L */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="bg-black/40 backdrop-blur-sm border border-gray-800 rounded-xl p-6"
                        >
                            <h3 className="text-lg font-bold mb-4">Hourly P&L Breakdown</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={hourlyPnL}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
                                    <XAxis dataKey="hour" stroke="#666" style={{ fontSize: '11px' }} />
                                    <YAxis stroke="#666" style={{ fontSize: '11px' }} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#0a0a0f',
                                            border: '1px solid #333',
                                            borderRadius: '8px',
                                        }}
                                    />
                                    <Bar dataKey="pnl" fill={aiModelData.color} />
                                </BarChart>
                            </ResponsiveContainer>
                        </motion.div>

                        {/* Risk Metrics */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="bg-black/40 backdrop-blur-sm border border-gray-800 rounded-xl p-6"
                        >
                            <h3 className="text-lg font-bold mb-4">Risk Analysis</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm text-gray-400">Best Trade</span>
                                        <span className="font-bold text-green-400">+${aiModelData.metrics.bestTrade}</span>
                                    </div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm text-gray-400">Worst Trade</span>
                                        <span className="font-bold text-red-400">${aiModelData.metrics.worstTrade}</span>
                                    </div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm text-gray-400">Avg Win</span>
                                        <span className="font-bold text-green-400">+${aiModelData.metrics.avgWin}</span>
                                    </div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm text-gray-400">Avg Loss</span>
                                        <span className="font-bold text-red-400">${aiModelData.metrics.avgLoss}</span>
                                    </div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm text-gray-400">Risk/Reward Ratio</span>
                                        <span className="font-bold">
                                            1:{(Math.abs(aiModelData.metrics.avgWin / aiModelData.metrics.avgLoss)).toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-800">
                                    <h4 className="font-bold mb-3">Strategy Strengths</h4>
                                    <ul className="space-y-2 text-sm">
                                        <li className="flex items-start space-x-2">
                                            <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-300">Excellent momentum detection</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-300">Strong risk management</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-300">Consistent profit factor</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
}
