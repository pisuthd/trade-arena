"use client"

import { useMemo } from 'react';

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
  holdings: any[];
  isLoading: boolean;
  seasonNumber: number;
  seasonStatus: 'pre-season' | 'active' | 'post-season';
} 
// Mock data for development
const mockPortfolioData: PortfolioData = {
  totalValue: 12500,
  totalProfit: 1250,
  totalProfitPercentage: 11.1,
  totalDeposited: 11250,
  usdcBalance: 3200,
  btcBalance: 0.234,
  btcValue: 9300, // 0.234 BTC * $39,743 current price 
  aiVaults: [ 
    {
      aiModel: 'Claude',
      usdcAmount: 800,
      btcAmount: 0.062,
      totalValue: 3250,
      pnl: 325,
      pnlPercentage: 11.1,
      activeTrades: 1,
      totalTrades: 12,
      winRate: 75.0,
      lastTradeTime: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
      status: 'active'
    },
    {
      aiModel: 'DeepSeek',
      usdcAmount: 1200,
      btcAmount: 0.089,
      totalValue: 4750,
      pnl: 475,
      pnlPercentage: 11.1,
      activeTrades: 0,
      totalTrades: 8,
      winRate: 62.5,
      lastTradeTime: Date.now() - 24 * 60 * 60 * 1000, // 24 hours ago
      status: 'active'
    },
    {
      aiModel: 'GPT-4',
      usdcAmount: 700,
      btcAmount: 0.053,
      totalValue: 2800,
      pnl: 280,
      pnlPercentage: 11.1,
      activeTrades: 2,
      totalTrades: 15,
      winRate: 80.0,
      lastTradeTime: Date.now() - 6 * 60 * 60 * 1000, // 6 hours ago
      status: 'active'
    },
    {
      aiModel: 'Gemini',
      usdcAmount: 500,
      btcAmount: 0.030,
      totalValue: 1700,
      pnl: 170,
      pnlPercentage: 11.1,
      activeTrades: 1,
      totalTrades: 10,
      winRate: 70.0,
      lastTradeTime: Date.now() - 8 * 60 * 60 * 1000, // 8 hours ago
      status: 'active'
    }
  ],
  holdings: [
    {
      aiName: 'Claude',
      seasonNumber: 1,
      seasonStatus: 1, // active
      lpShares: 1000000,
      ownershipPercentage: 8.5,
      usdcBalance: 800000000, // in smallest units
      btcBalance: 62000000, // in smallest units
      currentValue: 3250,
      profit: 325
    },
    {
      aiName: 'DeepSeek',
      seasonNumber: 1,
      seasonStatus: 1, // active
      lpShares: 1500000,
      ownershipPercentage: 12.8,
      usdcBalance: 1200000000,
      btcBalance: 89000000,
      currentValue: 4750,
      profit: 475
    },
    {
      aiName: 'GPT-4',
      seasonNumber: 1,
      seasonStatus: 1, // active
      lpShares: 800000,
      ownershipPercentage: 6.8,
      usdcBalance: 700000000,
      btcBalance: 53000000,
      currentValue: 2800,
      profit: 280
    },
    {
      aiName: 'Gemini',
      seasonNumber: 1,
      seasonStatus: 1, // active
      lpShares: 600000,
      ownershipPercentage: 5.1,
      usdcBalance: 500000000,
      btcBalance: 30000000,
      currentValue: 1700,
      profit: 170
    }
  ],
  isLoading: false,
  seasonNumber: 1,
  seasonStatus: 'active'
}; 

export function useUserPortfolio(): PortfolioData {
  const portfolioData = useMemo(() => {
    // Simulate real-time updates by slightly modifying values
    const currentTime = Date.now();
    const updatedVaults = mockPortfolioData.aiVaults.map(vault => ({
      ...vault,
      // Add small random fluctuations to simulate market movements
      totalValue: vault.totalValue + (Math.random() - 0.5) * 50,
      pnl: vault.pnl + (Math.random() - 0.5) * 20,
      pnlPercentage: vault.pnlPercentage + (Math.random() - 0.5) * 0.5,
    }));

    const updatedTotalValue = updatedVaults.reduce((sum, vault) => sum + vault.totalValue, 0) + mockPortfolioData.usdcBalance;
    const updatedTotalProfit = updatedVaults.reduce((sum, vault) => sum + vault.pnl, 0);
    const updatedTotalProfitPercentage = updatedTotalProfit > 0 ? (updatedTotalProfit / (updatedTotalValue - updatedTotalProfit)) * 100 : 0;

    return {
      ...mockPortfolioData,
      totalValue: updatedTotalValue,
      totalProfit: updatedTotalProfit,
      totalProfitPercentage: updatedTotalProfitPercentage,
      aiVaults: updatedVaults,
    };
  }, []); 

  return portfolioData;
}

// Helper function to get AI model emoji
export function getModelEmoji(model: string): string {
  const emojis: Record<string, string> = {
    'DeepSeek': '🚀',
    'Claude': '🧠',
    'GPT-4': '⚡',
    'Gemini': '💎',
  };
  return emojis[model] || '🤖';
}

// Helper function to get AI model color
export function getModelColor(model: string): string {
  const colors: Record<string, string> = {
    'DeepSeek': '#00ff88',
    'Claude': '#00d4ff',
    'GPT-4': '#ff00ff',
    'Gemini': '#ff6b00',
  };
  return colors[model] || '#ffffff';
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
