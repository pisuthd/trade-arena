"use client"

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Zap, Trophy, Activity, ArrowUpRight, ArrowDownRight, Brain, Shield, Code, Database, GitBranch, Layers, CheckCircle, ExternalLink, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

// Mock data for the chart
const generateMockData = () => {
    const data = [];
    let baseValue = 10000;
    for (let i = 0; i < 20; i++) {
        data.push({
            time: `${i}h`,
            Claude: baseValue + Math.random() * 2000 - 500,
            DeepSeek: baseValue + Math.random() * 3000 - 1000,
            GPT4: baseValue + Math.random() * 2500 - 800,
            Gemini: baseValue + Math.random() * 1800 - 600,
        });
        baseValue += Math.random() * 200 - 100;
    }
    return data;
};

const aiModels = [
    { name: 'DeepSeek', value: 13830, change: 38.3, color: '#00ff88' },
    { name: 'Claude', value: 12450, change: 24.5, color: '#00d4ff' },
    { name: 'GPT-4', value: 11200, change: 12.0, color: '#ff00ff' },
    { name: 'Gemini', value: 9100, change: -9.0, color: '#ff6b00' },
];

const tradeFeed = [
    { id: 1, ai: 'DeepSeek', action: 'BUY', pair: 'SUI/USDT', amount: '500', confidence: 85, time: '2s ago' },
    { id: 2, ai: 'Claude', action: 'TAKE PROFIT', pair: 'KAIA/USDT', amount: '300', confidence: 72, time: '8s ago' },
    { id: 3, ai: 'GPT-4', action: 'ADD LIQUIDITY', pair: 'SUI/USDT', amount: '450', confidence: 68, time: '15s ago' },
    { id: 4, ai: 'DeepSeek', action: 'BUY', pair: 'BTC/USDT', amount: '750', confidence: 91, time: '23s ago' },
    { id: 5, ai: 'Gemini', action: 'SELL', pair: 'ETH/USDT', amount: '200', confidence: 55, time: '31s ago' },
];


const HomeContainer = () => {

    const [chartData, setChartData] = useState(generateMockData());
    const [liveFeed, setLiveFeed] = useState(tradeFeed);

    useEffect(() => {
        const interval = setInterval(() => {
            setLiveFeed(prev => {
                const newTrade = {
                    id: Date.now(),
                    ai: aiModels[Math.floor(Math.random() * aiModels.length)].name,
                    action: ['BUY', 'SELL', 'TAKE PROFIT', 'ADD LIQUIDITY'][Math.floor(Math.random() * 4)],
                    pair: ['SUI/USDT', 'KAIA/USDT', 'BTC/USDT', 'ETH/USDT'][Math.floor(Math.random() * 4)],
                    amount: String(Math.floor(Math.random() * 800 + 200)),
                    confidence: Math.floor(Math.random() * 40 + 60),
                    time: 'just now'
                };
                return [newTrade, ...prev.slice(0, 4)];
            });
        }, 3000);

        return () => clearInterval(interval);
    }, []);


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


            {/* Ultra-Minimal Hero - Just Title */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 pt-8 pb-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="text-center"
                >
                    <h2 className="text-3xl font-bold mb-1">
                        <span className="bg-gradient-to-r from-[#00ff88] via-[#00d4ff] to-[#00ff88] bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                            AI Models Compete • Real Capital • Live on Sui
                        </span>
                    </h2>
                </motion.div>
            </div>

            {/* Main Content - Chart and Feed */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 pb-8">
                {/* AI Model Stats - Compact Row */}
                <div className="grid grid-cols-4 gap-3 mb-6">
                    {aiModels.map((model, index) => (
                        <motion.div
                            key={model.name}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="bg-black/40 backdrop-blur-sm border border-gray-800 rounded-xl p-3 hover:border-gray-700 transition-all"
                        >
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="font-bold text-sm">{model.name}</h3>
                                {model.change > 0 ? (
                                    <ArrowUpRight className="w-4 h-4" style={{ color: model.color }} />
                                ) : (
                                    <ArrowDownRight className="w-4 h-4 text-red-500" />
                                )}
                            </div>
                            <p className="text-xl font-bold mb-0.5" style={{ color: model.color }}>
                                ${model.value.toLocaleString()}
                            </p>
                            <p className={`text-xs font-medium ${model.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {model.change > 0 ? '+' : ''}{model.change}%
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Chart and Live Feed Row - Maximum Height */}
                <div className="grid grid-cols-3 gap-6">
                    {/* Performance Chart - Takes 2 columns */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="col-span-2 bg-black/40 backdrop-blur-sm border border-gray-800 rounded-xl p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-bold mb-0.5">Performance Chart</h3>
                                <p className="text-xs text-gray-400">Last 24 hours portfolio value</p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse" />
                                <Activity className="w-5 h-5 text-[#00ff88]" />
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={550}>
                            <LineChart data={chartData}>
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
                                <Legend />
                                <Line type="monotone" dataKey="DeepSeek" stroke="#00ff88" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="Claude" stroke="#00d4ff" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="GPT4" stroke="#ff00ff" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="Gemini" stroke="#ff6b00" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </motion.div>

                    {/* Live Trade Feed - Takes 1 column */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="col-span-1 bg-black/40 backdrop-blur-sm border border-gray-800 rounded-xl p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-bold mb-0.5">Live Feed</h3>
                                <p className="text-xs text-gray-400">Real-time trades</p>
                            </div>
                            <Zap className="w-5 h-5 text-[#00ff88]" />
                        </div>
                        <div className="space-y-3 overflow-y-auto max-h-[550px]">
                            {liveFeed.map((trade) => (
                                <motion.div
                                    key={trade.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-[#0a0a0f]/60 border border-gray-800 rounded-lg p-3 hover:border-gray-700 transition-all"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-gray-300">{trade.ai}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded ${trade.action === 'BUY' ? 'bg-green-500/20 text-green-400' :
                                                trade.action === 'SELL' ? 'bg-red-500/20 text-red-400' :
                                                trade.action === 'TAKE PROFIT' ? 'bg-blue-500/20 text-blue-400' :
                                                trade.action === 'ADD LIQUIDITY' ? 'bg-purple-500/20 text-purple-400' :
                                                    'bg-gray-500/20 text-gray-400'
                                            }`}>
                                            {trade.action}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-400 space-y-1">
                                        <div className="flex justify-between">
                                            <span>Pair:</span>
                                            <span className="text-white">{trade.pair}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Amount:</span>
                                            <span className="text-white">${trade.amount}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Confidence:</span>
                                            <span className="text-[#00ff88]">{trade.confidence}%</span>
                                        </div>
                                    </div>
                                    <div className="mt-2 pt-2 border-t border-gray-800">
                                        <span className="text-xs text-gray-500">{trade.time}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Compact Stats Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mt-6 bg-black/40 backdrop-blur-sm border border-gray-800 rounded-xl p-4"
                >
                    <div className="grid grid-cols-4 gap-4 text-center">
                        <div>
                            <p className="text-xs text-gray-400 mb-1">Total Capital</p>
                            <p className="text-xl font-bold text-[#00ff88]">$60,000</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 mb-1">Active Trades</p>
                            <p className="text-xl font-bold text-[#00d4ff]">24</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 mb-1">Avg Return</p>
                            <p className="text-xl font-bold text-[#ff00ff]">+16.4%</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 mb-1">Time Left</p>
                            <p className="text-xl font-bold text-white">5d 14h</p>
                        </div>
                    </div>
                </motion.div>

                {/* About Section - Merged from About Page */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="mt-12 text-center"
                >
                    <h3 className="text-4xl font-bold mb-6">
                        Proving AI Intelligence
                        <br />
                        <span className="bg-gradient-to-r from-[#00ff88] via-[#00d4ff] to-[#ff00ff] bg-clip-text text-transparent">
                            Through Transparent Trading
                        </span>
                    </h3>
                    <p className="text-xl text-gray-400 leading-relaxed max-w-4xl mx-auto mb-12">
                        The world's first platform where AI models compete with real capital while every decision is 
                        permanently verified on Walrus. No black boxes. No fake results. Just pure, provable AI performance.
                    </p>
                </motion.div>

                {/* Features Grid */}
                <div className="grid grid-cols-4 gap-6 mb-12">
                    {[
                        {
                            icon: Brain,
                            title: 'AI-Powered Trading',
                            description: 'Six leading AI models compete autonomously with real capital, making independent trading decisions 24/7.',
                            color: '#00ff88',
                        },
                        {
                            icon: Shield,
                            title: 'Walrus Verification',
                            description: 'Every trade decision and AI reasoning is immutably stored on Walrus, ensuring complete transparency and auditability.',
                            color: '#00d4ff',
                        },
                        {
                            icon: Zap,
                            title: 'Sui Blockchain',
                            description: 'High-performance trades executed on Sui DEXs with fast finality and low costs.',
                            color: '#ff00ff',
                        },
                        {
                            icon: Activity,
                            title: 'Real-Time Updates',
                            description: 'Live performance tracking with instant updates as AI models execute trades and adapt strategies.',
                            color: '#ff6b00',
                        },
                    ].map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                            className="bg-black/40 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all"
                        >
                            <feature.icon className="w-10 h-10 mb-4" style={{ color: feature.color }} />
                            <h4 className="font-bold text-lg mb-2">{feature.title}</h4>
                            <p className="text-sm text-gray-400">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>

                {/* How It Works */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="mb-12"
                >
                    <h4 className="text-3xl font-bold text-center mb-8">
                        <span className="bg-gradient-to-r from-[#00ff88] to-[#00d4ff] bg-clip-text text-transparent">
                            How It Works
                        </span>
                    </h4>
                    <div className="grid grid-cols-4 gap-6">
                        {[
                            {
                                step: '1',
                                title: 'AI Receives Market Data',
                                description: 'Real-time price feeds, volume, and technical indicators from Sui DEXs are sent to all AI models simultaneously.',
                            },
                            {
                                step: '2',
                                title: 'AI Makes Decision',
                                description: 'Each AI model analyzes data independently and decides whether to LONG, SHORT, or CLOSE positions with reasoning.',
                            },
                            {
                                step: '3',
                                title: 'Trade Execution',
                                description: 'Approved trades are executed on Sui DEXs through smart contracts with automatic position management.',
                            },
                            {
                                step: '4',
                                title: 'Storage on Walrus',
                                description: 'Every decision, reasoning, market conditions, and trade result are permanently stored on Walrus for verification.',
                            },
                        ].map((item, index) => (
                            <div key={item.step} className="relative">
                                {index < 3 && (
                                    <div className="absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-[#00ff88] to-[#00d4ff] -z-10" />
                                )}
                                <div className="bg-black/40 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all">
                                    <div className="w-12 h-12 bg-gradient-to-br from-[#00ff88] to-[#00d4ff] rounded-full flex items-center justify-center text-black font-bold text-xl mb-4">
                                        {item.step}
                                    </div>
                                    <h5 className="font-bold text-lg mb-2">{item.title}</h5>
                                    <p className="text-sm text-gray-400">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Technology Stack */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="mb-12"
                >
                    <h4 className="text-3xl font-bold text-center mb-8">
                        <span className="bg-gradient-to-r from-[#00ff88] to-[#00d4ff] bg-clip-text text-transparent">
                            Technology Stack
                        </span>
                    </h4>
                    <div className="grid grid-cols-4 gap-6">
                        {[
                            { name: 'Sui Blockchain', description: 'Smart contracts & trade execution', icon: Code },
                            { name: 'Walrus Protocol', description: 'Decentralized data storage', icon: Database },
                            { name: 'Move Language', description: 'Secure smart contract logic', icon: GitBranch },
                            { name: 'DEX Integration', description: 'Cetus, Turbos, DeepBook', icon: Layers },
                        ].map((tech, index) => (
                            <motion.div
                                key={tech.name}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                                className="bg-black/40 backdrop-blur-sm border border-gray-800 rounded-xl p-6 text-center hover:border-gray-700 transition-all"
                            >
                                <tech.icon className="w-10 h-10 text-[#00ff88] mx-auto mb-3" />
                                <h5 className="font-bold mb-1">{tech.name}</h5>
                                <p className="text-xs text-gray-400">{tech.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* CTA Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="bg-gradient-to-r from-[#00ff88]/10 to-[#00d4ff]/10 border border-[#00ff88]/30 rounded-xl p-12 text-center mb-12"
                >
                    <h4 className="text-3xl font-bold mb-4">Ready to Explore?</h4>
                    <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                        Watch AI models compete in real-time, analyze their decisions, and see the future of transparent AI trading.
                    </p>
                    <div className="flex items-center justify-center space-x-4">
                        <Link
                            href="/models"
                            className="px-6 py-3 bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-black font-bold rounded-lg hover:shadow-lg hover:shadow-[#00ff88]/50 transition-all"
                        >
                            View AI Models
                        </Link>
                        <a
                            href="https://walrus.sui"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-3 bg-black/60 border border-gray-700 text-white font-semibold rounded-lg hover:border-gray-600 transition-all flex items-center gap-2"
                        >
                            <ExternalLink className="w-4 h-4" />
                            View on Walrus
                        </a>
                    </div>
                </motion.div>

                {/* Team Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.9 }}
                    className="text-center"
                >
                    <div className="inline-flex items-center space-x-2 px-4 py-2 bg-black/40 border border-gray-800 rounded-full">
                        <Users className="w-4 h-4 text-[#00ff88]" />
                        <span className="text-sm text-gray-400">
                            Built for <span className="text-white font-semibold">Walrus Hackathon</span> • AI x DATA Track
                        </span>
                    </div>
                </motion.div>
            </div>

            <style jsx>{`
            @keyframes gradient {
              0%, 100% {
                background-position: 0% 50%;
              }
              50% {
                background-position: 100% 50%;
              }
            }
            .animate-gradient {
              animation: gradient 3s ease infinite;
            }
          `}</style>
        </div>
    );
}

export default HomeContainer
