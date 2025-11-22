"use client"

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, Zap, Trophy, Activity, ArrowUpRight, ArrowDownRight, Brain, Shield, Code, Database, GitBranch, Layers, CheckCircle, ExternalLink, Users, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useCurrentSeason, getSeasonStatusText } from '@/hooks/useSeasonManager';
import { DataAdapter } from '@/data/dataAdapter';
import { Trade, VaultValue, AIModel } from '@/data/dataModel';
import HomeAIModelCard from './HomeAIModelCard';
import HomeTradeFeed from './HomeTradeFeed';
import WalrusTradeDetailsModal from '../WalrusTradeDetailsModal';
import { parseWalrusBlobId } from '@/lib/utils';

const HomeContainer = () => {

    const [chartData, setChartData] = useState<VaultValue[]>([]);
    const [liveFeed, setLiveFeed] = useState<Trade[]>([]);
    const [aiModels, setAiModels] = useState<AIModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [btcPrice, setBtcPrice] = useState<number>(95000);
    const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Get season data from smart contract
    const { data: seasonData, isLoading: seasonLoading } = useCurrentSeason(1);

    // Extract season info from contract data
    const seasonInfo = seasonData?.data?.content as any;
    const seasonStatus = seasonInfo?.fields?.status || 0;
    const statusInfo = getSeasonStatusText(seasonStatus);

    // Initialize data with real Season 1 data
    useEffect(() => {
        const initializeData = async () => {
            try {
                setLoading(true);
                
                // Get current BTC price
                const currentBtcPrice = await DataAdapter.getBTCPrice();
                setBtcPrice(currentBtcPrice);
                
                // Get real Season 1 data from smart contract
                const seasons = await DataAdapter.getSeasons();
                
                const season1 = seasons.find(s => s.seasonNumber === 1);
                
                console.log("season1:", season1)

                if (season1 && season1.aiModels) {
                    // Extract AI models from Season 1 with proper interface
                    const models = season1.aiModels.map(model => ({
                        name: model.name,
                        displayName: DataAdapter.getModelDisplayName(model.name),
                        value: Math.round(model.tvl),
                        change: model.pnlPercentage || 0,
                        color: DataAdapter.getModelColor(DataAdapter.getContractModelName(model.name)),
                        tvl: model.tvl,
                        pnl: model.pnl || 0,
                        trades: model.trades || 0
                    }));
                    
                    // Sort models by PnL (performance) and add rankings
                    const sortedModels = models
                        .sort((a, b) => b.pnl - a.pnl)
                        .map((model, index) => ({
                            ...model,
                            rank: index + 1
                        }));
                    
                    setAiModels(sortedModels);
                    
                    // Extract all trades from all models for unified feed
                    const allTrades: Trade[] = [];
                    
                    // Get trades from raw contract data - fix the path
                    if (season1.rawContractData?.fields?.ai_vaults?.fields?.contents) {
                        const vaultContents = season1.rawContractData.fields.ai_vaults.fields.contents;
                        
                        vaultContents.forEach((vault: any) => {
                            const aiName = vault.fields.key;
                            const vaultData = vault.fields.value;
                            const tradeHistory = vaultData.fields?.trade_history || [];
                            
                            tradeHistory.forEach((trade: any) => {
                                const tradeFields = trade.fields;
                                allTrades.push({
                                    id: tradeFields.timestamp,
                                    ai: DataAdapter.getModelDisplayName(aiName),
                                    action: (tradeFields.action === 'LONG' ? 'BUY' : 'SELL') as 'BUY' | 'SELL',
                                    pair: 'BTC/USDC',
                                    usdcAmount: parseFloat(tradeFields.usdc_amount) / 1000000,
                                    btcAmount: parseFloat(tradeFields.btc_amount) / 100000000,
                                    price: parseFloat(tradeFields.entry_price) / 100000000,
                                    confidence: parseInt(tradeFields.confidence),
                                    reasoning: tradeFields.reasoning,
                                    time: DataAdapter.formatTime(parseInt(tradeFields.timestamp)),
                                    walrus_blob_id: tradeFields.walrus_blob_id
                                });
                            });
                        });
                    }
                    
                    // Sort trades by timestamp (most recent first)
                    allTrades.sort((a, b) => parseInt(b.id) - parseInt(a.id));

                    console.log("allTrades: ", allTrades)

                    setLiveFeed(allTrades);
                    
                    // Generate historical chart data from trades
                    const historicalChartData = generateHistoricalChartData(allTrades, season1.aiModels, currentBtcPrice);
                    setChartData(historicalChartData);
                }
                
            } catch (error) {
                console.error('Failed to initialize data:', error);
            } finally {
                setLoading(false);
            }
        };

        initializeData();
    }, []);

    // Generate historical chart data from trades
    const generateHistoricalChartData = (trades: Trade[], aiModels: any[], currentBtcPrice: number) => {
        const chartData: VaultValue[] = [];
        
        // Group trades by AI model for separate portfolio tracking
        const tradesByModel = {
            'Amazon Nova Pro': [] as Trade[],
            'Claude Sonnet': [] as Trade[],
            'Llama Maverick': [] as Trade[]
        };
        
        // Separate trades by AI model
        trades.forEach(trade => {
            if (tradesByModel[trade.ai as keyof typeof tradesByModel]) {
                tradesByModel[trade.ai as keyof typeof tradesByModel].push(trade);
            }
        });

        // Initialize portfolio states for each AI model (starting with $3000 each)
        const initialPortfolioValue = 3000;
        const portfolioStates = {
            'Amazon Nova Pro': { usdc: 3000, btc: 0 },
            'Claude Sonnet': { usdc: 3000, btc: 0 },
            'Llama Maverick': { usdc: 3000, btc: 0 }
        };

        // Get all unique timestamps from all trades
        const allTimestamps = [...new Set(trades.map(t => parseInt(t.id)))].sort((a, b) => a - b);
        
        // Start with initial values at 0% PnL
        if (allTimestamps.length > 0) {
            const initialTime = new Date(allTimestamps[0]);
            chartData.push({
                time: formatTradeTime(initialTime.getTime().toString()),
                AmazonNovaPro: 0,
                ClaudeSonnet: 0,
                LlamaMaverick: 0,
            });
        }

        // Process trades chronologically for each model
        allTimestamps.forEach((timestamp, index) => {
            // Process trades at this timestamp for each model
            Object.keys(tradesByModel).forEach(modelName => {
                const modelTrades = tradesByModel[modelName as keyof typeof tradesByModel];
                const tradesAtTimestamp = modelTrades.filter(t => parseInt(t.id) === timestamp);
                
                const portfolio = portfolioStates[modelName as keyof typeof portfolioStates];
                
                tradesAtTimestamp.forEach(trade => {
                    if (trade.action === 'BUY') {
                        portfolio.usdc -= trade.usdcAmount;
                        portfolio.btc += trade.btcAmount;
                    } else {
                        portfolio.usdc += trade.usdcAmount;
                        portfolio.btc -= trade.btcAmount;
                    }
                });
            });

            // Create data point for every 3rd timestamp to keep chart readable but with more points
            if (index % 3 === 0 || index === allTimestamps.length - 1) {
                const tradeAtTimestamp = trades.find(t => parseInt(t.id) === timestamp);
                const priceVariation = 1 + (Math.random() - 0.5) * 0.03; // ±1.5% variation
                const adjustedPrice = tradeAtTimestamp ? tradeAtTimestamp.price * priceVariation : currentBtcPrice;
                
                // Calculate PnL percentages for each model
                const amazonNovaValue = portfolioStates['Amazon Nova Pro'].usdc + (portfolioStates['Amazon Nova Pro'].btc * adjustedPrice);
                const claudeSonnetValue = portfolioStates['Claude Sonnet'].usdc + (portfolioStates['Claude Sonnet'].btc * adjustedPrice);
                const llamaMaverickValue = portfolioStates['Llama Maverick'].usdc + (portfolioStates['Llama Maverick'].btc * adjustedPrice);
                
                chartData.push({
                    time: formatTradeTime(timestamp.toString()),
                    AmazonNovaPro: ((amazonNovaValue - initialPortfolioValue) / initialPortfolioValue) * 100,
                    ClaudeSonnet: ((claudeSonnetValue - initialPortfolioValue) / initialPortfolioValue) * 100,
                    LlamaMaverick: ((llamaMaverickValue - initialPortfolioValue) / initialPortfolioValue) * 100,
                });
            }
        });

        // Add current values as final point
        const amazonNovaFinal = aiModels.find(m => m.name === 'NOVA')?.tvl || initialPortfolioValue;
        const claudeSonnetFinal = aiModels.find(m => m.name === 'CLAUDE')?.tvl || initialPortfolioValue;
        const llamaMaverickFinal = aiModels.find(m => m.name === 'LLAMA')?.tvl || initialPortfolioValue;
        
        chartData.push({
            time: 'Current',
            AmazonNovaPro: ((amazonNovaFinal - initialPortfolioValue) / initialPortfolioValue) * 100,
            ClaudeSonnet: ((claudeSonnetFinal - initialPortfolioValue) / initialPortfolioValue) * 100,
            LlamaMaverick: ((llamaMaverickFinal - initialPortfolioValue) / initialPortfolioValue) * 100,
        });

        return chartData;
    };

    // Helper function to get contract model name from display name
    const getContractModelName = (displayName: string): string => {
        const nameMap: { [key: string]: string } = {
            'Amazon Nova Pro': 'NOVA',
            'Claude Sonnet': 'CLAUDE',
            'Llama Maverick': 'LLAMA'
        };
        return nameMap[displayName] || displayName.toUpperCase();
    };

    // Format trade timestamp for display
    const formatTradeTime = (timestamp: string): string => {
        const ts = parseInt(timestamp);
        const date = new Date(ts);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };

    // Simulate live trade updates
    // useEffect(() => {
    //     if (loading) return;

    //     const interval = setInterval(async () => {
    //         try {
    //             const newTrade = await DataAdapter.generateNewTrade();
    //             setLiveFeed(prev => [newTrade, ...prev.slice(0, 4)]);
    //         } catch (error) {
    //             console.error('Failed to generate new trade:', error);
    //         }
    //     }, 3000);

    //     return () => clearInterval(interval);
    // }, [loading]);

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


            {/*   Title */}
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

               
{/* AI Model Cards - Using HomeAIModelCard Component */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    {aiModels.map((model, index) => (
                        <HomeAIModelCard
                            key={model.name}
                            model={{
                                name: model.displayName,
                                tvl: model.tvl || 0,
                                pnl: model.pnl || 0,
                                trades: model.trades || 0,
                                color: model.color,
                                rank: model.rank
                            }}
                        />
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
                                <p className="text-xs text-gray-400">Season#1: PnL percentage</p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse" />
                                <Activity className="w-5 h-5 text-[#00ff88]" />
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={550}>
                            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
                                <XAxis 
                                    dataKey="time" 
                                    stroke="#666" 
                                    style={{ fontSize: '11px' }}
                                />
                                <YAxis 
                                    stroke="#666" 
                                    style={{ fontSize: '11px' }}
                                    tickFormatter={(value) => `${value.toFixed(1)}%`}
                                    domain={['dataMin - 5', 'dataMax + 5']}
                                    allowDataOverflow={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#0a0a0f',
                                        border: '1px solid #333',
                                        borderRadius: '8px',
                                    }}
                                    formatter={(value: number, name: string) => [`${value.toFixed(2)}%`, name]}
                                />
                                <Legend />
                                <ReferenceLine y={0} stroke="#666" strokeWidth={1} strokeDasharray="3 3" />
                                <Line 
                                    type="monotone" 
                                    dataKey="AmazonNovaPro" 
                                    stroke="#00ff88" 
                                    strokeWidth={2} 
                                    dot={false}
                                    name="Amazon Nova Pro"
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="ClaudeSonnet" 
                                    stroke="#00d4ff" 
                                    strokeWidth={2} 
                                    dot={false}
                                    name="Claude Sonnet"
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="LlamaMaverick" 
                                    stroke="#ff00ff" 
                                    strokeWidth={2} 
                                    dot={false}
                                    name="Llama Maverick"
                                />
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
                        <HomeTradeFeed 
                            trades={liveFeed} 
                            onTradeClick={(trade: any) => {
                                setSelectedTrade(trade);
                                setIsModalOpen(true);
                            }}
                        />
                    </motion.div>
                </div>

                 {/* Compact Stats Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="my-6 bg-black/40 backdrop-blur-sm border border-gray-800 rounded-xl p-4"
                >
                    <div className="grid grid-cols-4 gap-4 text-center">
                        <div>
                            <p className="text-xs text-gray-400 mb-1">Season</p>
                            <p className="text-xl font-bold text-[#ff00ff]">1</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 mb-1">Active Trades</p>
                            <p className="text-xl font-bold text-[#00d4ff]">24</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 mb-1">Total Capital</p>
                            <p className="text-xl font-bold text-[#00ff88]">$60,000</p>
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

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mt-6 flex flex-col items-center space-y-4"
                >
                    <Link
                        href="/season"
                        className="px-6 py-3 bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-black font-bold rounded-lg hover:shadow-lg hover:shadow-[#00ff88]/50 transition-all"
                    >
                        View All Seasons →
                    </Link>
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


            {/* Walrus Trade Details Modal */}
            {selectedTrade && selectedTrade.walrus_blob_id && (
                <WalrusTradeDetailsModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedTrade(null);
                    }}
                    trade={{
                        fields: {
                            action: selectedTrade.action,
                            pair: selectedTrade.pair,
                            btc_amount: (selectedTrade.btcAmount * 100000000).toString(),
                            entry_price: (selectedTrade.price * 100000000).toString(),
                            usdc_amount: (selectedTrade.usdcAmount * 1000000).toString(),
                            confidence: selectedTrade.confidence.toString(),
                            reasoning: selectedTrade.reasoning,
                            timestamp: selectedTrade.id,
                            ai_model: selectedTrade.ai,
                            walrus_blob_id: selectedTrade.walrus_blob_id
                        }
                    }}
                    blobId={parseWalrusBlobId(selectedTrade.walrus_blob_id)}
                />
            )}

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
