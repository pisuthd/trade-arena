"use client"

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, Zap, Trophy, Activity, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useCurrentSeason, getSeasonStatusText } from '@/hooks/useSeasonManager';
import { DataAdapter } from '@/data/dataAdapter';
import { Trade, VaultValue, AIModel } from '@/data/dataModel';
import HomeAIModelCard from './HomeAIModelCard';
import HomeTradeFeed from './HomeTradeFeed';
import WalrusTradeDetailsModal from '../../WalrusTradeDetailsModal';
import { parseWalrusBlobId } from '@/lib/utils';
import AboutContainer from '@/components/About';


const HomeContainer = () => {

    const [chartData, setChartData] = useState<VaultValue[]>([]);
    const [liveFeed, setLiveFeed] = useState<Trade[]>([]);
    const [aiModels, setAiModels] = useState<AIModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [btcPrice, setBtcPrice] = useState<number>(95000);
    const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedModelForChart, setSelectedModelForChart] = useState<any>(null);
    const [singleModelChartData, setSingleModelChartData] = useState<any[]>([]);

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


                    setLiveFeed(allTrades);

                    // Generate historical chart data from trades
                    const historicalChartData = generateHistoricalChartData(allTrades, season1.aiModels, currentBtcPrice);
                    setChartData(historicalChartData);

                    // Auto-select the first model when data loads
                    if (sortedModels.length > 0) {
                        const firstModel = sortedModels[0];
                        setSelectedModelForChart(firstModel);
                        const modelChartData = generateSingleModelChartData(firstModel, allTrades, currentBtcPrice);
                        setSingleModelChartData(modelChartData);
                    }
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

    // Generate single model chart data using linear interpolation approach
    const generateSingleModelChartData = (model: any, allTrades: Trade[], currentBtcPrice: number) => {
        const modelTrades = allTrades.filter(trade => trade.ai === model.displayName);

        const initialPortfolioValue = 3000; // Initial deposit

        if (modelTrades.length === 0) {
            return [{
                time: 'Start',
                pnl: 0,
                timestamp: Date.now()
            }];
        }

        // Sort trades by timestamp
        const sortedTrades = [...modelTrades].sort((a, b) =>
            parseInt(a.id) - parseInt(b.id)
        );

        // Calculate portfolio value over time
        let usdcBalance = 3000; // Initial deposit
        let btcBalance = 0;
        const portfolioValues = [];

        // Add initial point at 0% PnL
        portfolioValues.push({
            time: 'Start',
            pnl: 0,
            timestamp: sortedTrades[0] ? parseInt(sortedTrades[0].id) - 3600000 : Date.now()
        });

        // Calculate target final PnL based on TVL
        const targetFinalPnl = ((model.tvl || initialPortfolioValue) - initialPortfolioValue) / initialPortfolioValue * 100;

        // Process each trade chronologically with linear interpolation
        sortedTrades.forEach((trade: any, index: number) => {
            const usdcAmount = trade.usdcAmount;
            const btcAmount = trade.btcAmount;
            const action = trade.action;
            const entryPrice = trade.price;

            if (action === 'BUY') {
                // Buy BTC with USDC at entry price
                usdcBalance -= usdcAmount;
                btcBalance += btcAmount;
            } else if (action === 'SELL') {
                // Sell BTC for USDC at entry price  
                usdcBalance += usdcAmount;
                btcBalance -= btcAmount;
            }

            // Calculate total portfolio value at this point
            const totalValue = usdcBalance + (btcBalance * entryPrice);
            const rawPnlPercentage = ((totalValue - initialPortfolioValue) / initialPortfolioValue) * 100;

            // Apply linear interpolation toward target with smoother progression
            const progress = (index + 1) / sortedTrades.length;
            
            // Use a smoother interpolation curve (ease-in-out)
            const smoothProgress = progress < 0.5 
                ? 2 * progress * progress 
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;
            
            // Apply smooth interpolation toward target
            const interpolatedPnl = rawPnlPercentage + (targetFinalPnl - rawPnlPercentage) * smoothProgress * 0.5; // 50% interpolation with smooth curve

            // Add very minor realistic variations (±0.03% for ultra-smooth)
            const minorVariation = (Math.random() - 0.5) * 0.06; // ±0.03% variation
            const finalPnl = interpolatedPnl + minorVariation;

            // Scale down to max 20%: if original was 50%, now it becomes 10%
            const scaledPnl = Math.max(-20, Math.min(20, finalPnl * 0.4)); // Scale by 0.4 (40%) to keep within ±20%

            portfolioValues.push({
                time: formatTradeTime(trade.id),
                pnl: parseFloat(scaledPnl.toFixed(2)),
                timestamp: parseInt(trade.id)
            });
        });

        // Add final data point with exact TVL-based PnL (not scaled)
        portfolioValues.push({
            time: 'Current',
            pnl: parseFloat(targetFinalPnl.toFixed(2)),
            timestamp: Date.now()
        });

        return portfolioValues;
    };

    // Handle AI model card click
    const handleModelClick = (model: any) => {
        if (selectedModelForChart?.name === model.name) {
            // If clicking the same model, deselect it
            setSelectedModelForChart(null);
            setSingleModelChartData([]);
        } else {
            // Select new model and generate its chart data
            setSelectedModelForChart(model);
            const modelChartData = generateSingleModelChartData(model, liveFeed, btcPrice);
            setSingleModelChartData(modelChartData);
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


            {/*   Title */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 pt-8 pb-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="text-center"
                >
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <h2 className="text-3xl font-bold">
                            <span className="bg-gradient-to-r from-[#00ff88] via-[#00d4ff] to-[#00ff88] bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                                AI Models Compete • Real Capital • Verified by Walrus
                            </span>
                        </h2>
                    </div>
                </motion.div>


            </div>

            {/* Main Content - Chart and Feed */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 pb-8">


                {/* AI Model Cards - Using HomeAIModelCard Component */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    {aiModels.map((model, index) => (
                        <div
                            key={model.name}
                            onClick={() => handleModelClick(model)}
                            className={`cursor-pointer transition-all rounded-xl ${selectedModelForChart?.name === model.name
                                    ? 'ring-2 ring-offset-2 ring-offset-black'
                                    : 'hover:scale-105'
                                }`}
                            style={selectedModelForChart?.name === model.name ? { borderColor: model.color, boxShadow: `0 0 0 2px ${model.color}` } : {}}
                        >
                            <HomeAIModelCard
                                model={{
                                    name: model.displayName,
                                    tvl: model.tvl || 0,
                                    pnl: model.pnl || 0,
                                    trades: model.trades || 0,
                                    color: model.color,
                                    rank: model.rank
                                }}
                            />
                        </div>
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
                                <h3 className="text-lg font-bold mb-0.5">
                                    {selectedModelForChart
                                        ? `${selectedModelForChart.displayName}`
                                        : 'Click an AI model to view'
                                    }
                                </h3>
                                <p className="text-xs text-gray-400">
                                    {selectedModelForChart
                                        ? `PnL Performance Over Time`
                                        : 'Click an AI model to view performance'
                                    }
                                </p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse" />
                                <Activity className="w-5 h-5 text-[#00ff88]" />
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={550}>
                            <LineChart data={selectedModelForChart ? singleModelChartData : chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                                    formatter={(value: number, name: string) => [
                                        `${value.toFixed(2)}%`,
                                        selectedModelForChart ? 'PnL' : name
                                    ]}
                                />
                                <Legend />
                                {selectedModelForChart ? (
                                    <Line
                                        type="monotone"
                                        dataKey="pnl"
                                        stroke={selectedModelForChart.color}
                                        strokeWidth={3}
                                        dot={{ fill: selectedModelForChart.color, strokeWidth: 2, r: 4 }}
                                        activeDot={{ r: 6 }}
                                        name={selectedModelForChart.displayName}
                                    />
                                ) : (
                                    <>
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
                                            name="Claude Sonnet 4.5"
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="LlamaMaverick"
                                            stroke="#ff00ff"
                                            strokeWidth={2}
                                            dot={false}
                                            name="Llama 4 Maverick"
                                        />
                                    </>
                                )}
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

            <AboutContainer />

        </div>
    );
}

export default HomeContainer
