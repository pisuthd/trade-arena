"use client"

import React, { useState, useEffect } from 'react';
import { useCurrentSeason, getSeasonStatusText, canDeposit, canWithdraw } from '@/hooks/useSeasonManager';
import { DataAdapter } from '@/data/dataAdapter';
import { LoadingSpinner } from '@/components/UI';
import { SeasonCard } from '@/components/Season';
import DepositModal from '@/components/DepositModal';
import WithdrawModal from '@/components/WithdrawModal';
import { useWalletBalance } from '@/hooks/useWalletBalance';
import { usePrice } from '@/hooks/usePrice';
import { RefreshCw, Droplets } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SeasonPage() {

  const [expandedSeason, setExpandedSeason] = useState<number | null>(null);
  const [activeModel, setActiveModel] = useState<string | null>(null);
  const [activeContentTab, setActiveContentTab] = useState<string>('overview');
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [seasonsData, setSeasonsData] = useState<any[]>([]);
  const [btcPrice, setBtcPrice] = useState<number>(95000);
  const [isLoading, setIsLoading] = useState(true);

  // Get season data from smart contract
  const { data: seasonData, isLoading: seasonLoading } = useCurrentSeason(1);

  // Extract season info from contract data
  const seasonInfo = seasonData?.data?.content as any;
  const seasonStatus = seasonInfo?.fields?.status || 0;
  const statusInfo = getSeasonStatusText(seasonStatus);

  // Wallet balance hook
  const walletBalance = useWalletBalance();
  const { formatUSD } = usePrice();

  // Fetch seasons data and BTC price on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch BTC price first
        const price = await DataAdapter.getBTCPrice();
        setBtcPrice(price);
        
        // Fetch seasons data with BTC price
        const seasons = await DataAdapter.getSeasons(price);
        setSeasonsData(seasons);
        
        // Auto-expand the latest season (first one after sorting)
        if (seasons.length > 0 && seasons[0].aiModels.length > 0) {
          setActiveModel(seasons[0].aiModels[0].name);
          setActiveContentTab('vault');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
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

  // Helper function to get vault data for a specific model
  const getVaultData = (modelName: string, season: any) => {
    // Try to get from raw contract data first (from the specific season)
    if (season?.rawContractData?.fields?.ai_vaults?.fields?.contents) {
      const vaultEntry = season.rawContractData.fields.ai_vaults.fields.contents.find(
        (vault: any) => vault.fields.key === modelName
      );
      return vaultEntry?.fields?.value?.fields || null;
    }
    
    // Fallback to seasonInfo if available
    if (seasonInfo?.fields?.ai_vaults?.fields?.contents) {
      const vaultEntry = seasonInfo.fields.ai_vaults.fields.contents.find(
        (vault: any) => vault.fields.key === modelName
      );
      return vaultEntry?.fields?.value?.fields || null;
    }
    
    return null;
  };

  // Helper function to calculate asset allocation
  const calculateAssetAllocation = (vaultData: any, btcPrice: number) => {
    // Convert balances from contract decimals
    const usdcBalance = parseFloat(vaultData?.usdc_balance || 0) / 1000000; // 6 decimals
    const btcBalance = parseFloat(vaultData?.btc_balance || 0) / 100000000; // 8 decimals
    
    const usdcValue = usdcBalance;
    const btcValue = btcBalance * btcPrice;
    const totalValue = usdcValue + btcValue;
    
    if (totalValue === 0) {
      return { usdcPercentage: 0, btcPercentage: 0 };
    }
    
    const usdcPercentage = (usdcValue / totalValue) * 100;
    const btcPercentage = (btcValue / totalValue) * 100;
    
    return {
      usdcPercentage: Math.round(usdcPercentage),
      btcPercentage: Math.round(btcPercentage)
    };
  };

  // Helper function to process trade history and calculate metrics
  const processTradeHistory = (tradeHistory: any[]) => {
    if (!tradeHistory || tradeHistory.length === 0) {
      return {
        totalTrades: 0,
        winRate: 0,
        totalPnL: 0,
        avgWin: 0,
        avgLoss: 0,
        maxWin: 0,
        maxLoss: 0,
        longPositions: 0,
        shortPositions: 0,
        sharpeRatio: 0,
        maxDrawdown: 0
      };
    }

    const trades = tradeHistory.map(trade => ({
      action: trade.fields.action,
      usdcAmount: parseFloat(trade.fields.usdc_amount) / 1000000, // Convert from 6 decimals
      btcAmount: parseFloat(trade.fields.btc_amount) / 100000000, // Convert from 8 decimals
      confidence: parseInt(trade.fields.confidence),
      entryPrice: parseFloat(trade.fields.entry_price) / 100000000, // Convert from 8 decimals
      reasoning: trade.fields.reasoning,
      timestamp: parseInt(trade.fields.timestamp)
    }));

    // Calculate basic metrics
    const totalTrades = trades.length;
    const longPositions = trades.filter(t => t.action === 'LONG').length;
    const shortPositions = trades.filter(t => t.action === 'SHORT').length;
    
    // For now, assume 50% win rate since we don't have exit prices
    // In a real implementation, we'd calculate this from actual trade results
    const winRate = 50;
    const winningTrades = Math.floor(totalTrades * winRate / 100);
    const losingTrades = totalTrades - winningTrades;
    
    // Calculate average win/loss (mock for now)
    const avgWin = trades.length > 0 ? trades.reduce((sum, t) => sum + t.usdcAmount, 0) / winningTrades : 0;
    const avgLoss = trades.length > 0 ? trades.reduce((sum, t) => sum + t.usdcAmount, 0) / losingTrades : 0;
    
    return {
      totalTrades,
      winRate,
      totalPnL: 0, // Would calculate from entry/exit prices
      avgWin,
      avgLoss,
      maxWin: Math.max(...trades.map(t => t.usdcAmount)),
      maxLoss: Math.min(...trades.map(t => t.usdcAmount)),
      longPositions,
      shortPositions,
      sharpeRatio: 2.4, // Mock for now
      maxDrawdown: 8.2 // Mock for now
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <LoadingSpinner 
          size="lg" 
          message="Loading seasons data..." 
        />
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
          {seasonsData.map((season: any) => (
            <SeasonCard
              key={season.id}
              season={season}
              expandedSeason={expandedSeason}
              activeModel={activeModel}
              activeContentTab={activeContentTab}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
              getModelEmoji={getModelEmoji}
              getVaultData={getVaultData}
              calculateAssetAllocation={calculateAssetAllocation}
              processTradeHistory={processTradeHistory}
              btcPrice={btcPrice}
              onToggleExpand={toggleExpand}
              onModelClick={handleModelClick}
              onContentTabClick={handleContentTabClick}
              onDeposit={handleDeposit}
              onWithdraw={handleWithdraw}
            />
          ))}
        </div>

        {/* Wallet Balances */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 bg-black/40 backdrop-blur-sm border border-gray-800 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Wallet Balances</h3>
            <div className="flex items-center space-x-4">
              {walletBalance.lastUpdated && (
                <span className="text-sm text-gray-400">
                  Updated {new Date(walletBalance.lastUpdated).toLocaleTimeString()}
                </span>
              )}
              <button
                onClick={walletBalance.fetchBalances}
                disabled={walletBalance.loading}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${walletBalance.loading ? 'animate-spin' : ''}`} />
                <span className="text-sm">Refresh</span>
              </button>
            </div>
          </div>

          {walletBalance.error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-red-400 text-sm">{walletBalance.error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* SUI Balance */}
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{walletBalance.getTokenBalanceInfo('SUI').emoji}</span>
                  <span className="font-medium">SUI</span>
                </div>
                <span className="text-sm text-gray-400">Native</span>
              </div>
              <p className="text-xl font-semibold mb-1">
                {walletBalance.getTokenBalanceInfo('SUI').formattedAmount} SUI
              </p>
              <p className="text-sm text-gray-400">
                {walletBalance.getTokenBalanceInfo('SUI').formattedUSD}
              </p>
            </div>

            {/* USDC Balance */}
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{walletBalance.getTokenBalanceInfo('USDC').emoji}</span>
                  <span className="font-medium">USDC</span>
                </div>
                <span className="text-sm text-gray-400">Stablecoin</span>
              </div>
              <p className="text-xl font-semibold mb-1">
                {walletBalance.getTokenBalanceInfo('USDC').formattedAmount} USDC
              </p>
              <p className="text-sm text-gray-400 mb-3">
                {walletBalance.getTokenBalanceInfo('USDC').formattedUSD}
              </p>
              <button
                onClick={walletBalance.requestMockUSDC}
                disabled={walletBalance.faucetLoading}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-[#00ff88]/20 text-[#00ff88] hover:bg-[#00ff88]/30 rounded-lg transition-colors disabled:opacity-50"
              >
                <Droplets className={`w-4 h-4 ${walletBalance.faucetLoading ? 'animate-pulse' : ''}`} />
                <span className="text-sm font-medium">
                  {walletBalance.faucetLoading ? 'Requesting...' : 'Get Mock USDC'}
                </span>
              </button>
              {walletBalance.faucetError && (
                <p className="mt-2 text-xs text-red-400">{walletBalance.faucetError}</p>
              )}
            </div>

            {/* BTC Balance */}
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{walletBalance.getTokenBalanceInfo('BTC').emoji}</span>
                  <span className="font-medium">BTC</span>
                </div>
                <span className="text-sm text-gray-400">Mock</span>
              </div>
              <p className="text-xl font-semibold mb-1">
                {walletBalance.getTokenBalanceInfo('BTC').formattedAmount} BTC
              </p>
              <p className="text-sm text-gray-400">
                {walletBalance.getTokenBalanceInfo('BTC').formattedUSD}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Total Wallet Value</span>
              <span className="text-xl font-bold text-[#00ff88]">
                {formatUSD(walletBalance.totalUSD)}
              </span>
            </div>
          </div>
        </motion.div>
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
