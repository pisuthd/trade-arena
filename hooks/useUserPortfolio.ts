"use client"

import { useMemo, useState, useEffect } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { DataAdapter } from '@/data/dataAdapter';
import { PortfolioHolding } from '@/data/dataModel';

export interface AIVault {
  aiModel: string;
  usdcAmount: number;
  btcAmount: number;
  totalValue: number;
  pnl: number;
  pnlPercentage: number;
  activeTrades: number;
  totalTrades: number;
  winRate: number;
  lastTradeTime: number;
  status: 'active' | 'inactive';
}

export interface PortfolioData {
  totalValue: number;
  totalProfit: number;
  totalProfitPercentage: number;
  totalDeposited: number;
  usdcBalance: number;
  btcBalance: number;
  btcValue: number;
  aiVaults: AIVault[];
  holdings: PortfolioHolding[];
  isLoading: boolean;
  seasonNumber: number;
  seasonStatus: 'pre-season' | 'active' | 'post-season';
} 

export function useUserPortfolio(): PortfolioData {
  const account = useCurrentAccount();
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolioData = async () => {
      if (!account) {
        setHoldings([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const portfolioHoldings = await DataAdapter.getPortfolioHoldings();
        setHoldings(portfolioHoldings);
      } catch (error) {
        console.error('Error fetching portfolio data:', error);
        setHoldings([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortfolioData();
  }, [account]);

  const portfolioData = useMemo(() => {
    // Calculate totals from holdings
    const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
    const totalDeposited = holdings.reduce((sum, h) => sum + (h.currentValue - h.profit), 0);
    const totalProfit = holdings.reduce((sum, h) => sum + h.profit, 0);
    const totalProfitPercentage = totalDeposited > 0 ? (totalProfit / totalDeposited) * 100 : 0;
    
    const totalUSDC = holdings.reduce((sum, h) => sum + (h.usdcBalance / 1_000_000), 0);
    const totalBTC = holdings.reduce((sum, h) => sum + (h.btcBalance / 1_000_000), 0);
    const btcValue = totalBTC * 66000; // Mock BTC price

    // Convert holdings to AI vaults format for compatibility
    const aiVaults: AIVault[] = holdings.map(holding => ({
      aiModel: holding.aiName,
      usdcAmount: holding.usdcBalance / 1_000_000,
      btcAmount: holding.btcBalance / 1_000_000,
      totalValue: holding.currentValue,
      pnl: holding.profit,
      pnlPercentage: holding.currentValue > 0 ? (holding.profit / (holding.currentValue - holding.profit)) * 100 : 0,
      activeTrades: Math.floor(Math.random() * 3), // Mock active trades
      totalTrades: Math.floor(Math.random() * 20) + 5, // Mock total trades
      winRate: 60 + Math.random() * 30, // Mock win rate
      lastTradeTime: Date.now() - Math.random() * 24 * 60 * 60 * 1000, // Random time in last 24h
      status: holding.seasonStatus === 1 ? 'active' : 'inactive'
    }));

    // Determine current season status
    const activeSeasons = holdings.filter(h => h.seasonStatus === 1);
    const seasonStatus: 'pre-season' | 'active' | 'post-season' = activeSeasons.length > 0 ? 'active' : 'post-season';
    const currentSeasonNumber = activeSeasons.length > 0 ? activeSeasons[0].seasonNumber : 1;

    return {
      totalValue,
      totalProfit,
      totalProfitPercentage,
      totalDeposited,
      usdcBalance: totalUSDC,
      btcBalance: totalBTC,
      btcValue,
      aiVaults,
      holdings,
      isLoading,
      seasonNumber: currentSeasonNumber,
      seasonStatus,
    };
  }, [holdings, isLoading]); 

  return portfolioData;
}

// Helper function to get AI model emoji
export function getModelEmoji(model: string): string {
  return DataAdapter.getModelEmoji(model);
}

// Helper function to get AI model color
export function getModelColor(model: string): string {
  return DataAdapter.getModelColor(model);
}

// Helper function to format currency
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Helper function to format percentage
export function formatPercentage(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

// Helper function to format timestamp
export function formatTimestamp(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}
