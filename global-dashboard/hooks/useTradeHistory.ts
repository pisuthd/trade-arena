"use client"

import { useMemo } from 'react';

export interface TradeRecord {
  id: string;
  timestamp: number;
  aiModel: string;
  action: string; // "LONG", "SHORT", "CLOSE"
  pair: string;
  usdcAmount: number;
  btcAmount: number;
  entryPrice: number;
  reasoning: string;
  confidence: number;
  walrusBlobId: string;
  seasonNumber: number;
  status: 'active' | 'closed' | 'stopped';
  pnl?: number;
  exitPrice?: number;
}

// Mock data for development
const mockTrades: TradeRecord[] = [
  {
    id: 'trade_1',
    timestamp: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
    aiModel: 'Claude',
    action: 'LONG',
    pair: 'BTC/USDC',
    usdcAmount: 1000,
    btcAmount: 0.025,
    entryPrice: 40000,
    reasoning: 'Strong bullish momentum detected with RSI oversold conditions. Volume spike suggests institutional accumulation.',
    confidence: 87,
    walrusBlobId: '0xabc123def456',
    seasonNumber: 1,
    status: 'active',
    pnl: 150,
    exitPrice: 40600
  },
  {
    id: 'trade_2',
    timestamp: Date.now() - 4 * 60 * 60 * 1000, // 4 hours ago
    aiModel: 'DeepSeek',
    action: 'SHORT',
    pair: 'BTC/USDC',
    usdcAmount: 1500,
    btcAmount: 0.0375,
    entryPrice: 40000,
    reasoning: 'Bearish divergence on 4H timeframe. Resistance level holding with decreasing volume.',
    confidence: 92,
    walrusBlobId: '0xdef456abc123',
    seasonNumber: 1,
    status: 'closed',
    pnl: -75,
    exitPrice: 39800
  },
  {
    id: 'trade_3',
    timestamp: Date.now() - 6 * 60 * 60 * 1000, // 6 hours ago
    aiModel: 'GPT-4',
    action: 'LONG',
    pair: 'BTC/USDC',
    usdcAmount: 800,
    btcAmount: 0.02,
    entryPrice: 39500,
    reasoning: 'Golden cross formation on daily chart. MACD showing bullish crossover with increasing volume.',
    confidence: 78,
    walrusBlobId: '0xghi789jkl012',
    seasonNumber: 1,
    status: 'closed',
    pnl: 320,
    exitPrice: 41100
  },
  {
    id: 'trade_4',
    timestamp: Date.now() - 8 * 60 * 60 * 1000, // 8 hours ago
    aiModel: 'Gemini',
    action: 'SHORT',
    pair: 'BTC/USDC',
    usdcAmount: 1200,
    btcAmount: 0.03,
    entryPrice: 41000,
    reasoning: 'Overbought conditions with negative funding rates. Large sell walls detected on order book.',
    confidence: 85,
    walrusBlobId: '0xmno345pqr678',
    seasonNumber: 1,
    status: 'closed',
    pnl: 180,
    exitPrice: 40400
  },
  {
    id: 'trade_5',
    timestamp: Date.now() - 12 * 60 * 60 * 1000, // 12 hours ago
    aiModel: 'Claude',
    action: 'LONG',
    pair: 'BTC/USDC',
    usdcAmount: 2000,
    btcAmount: 0.05,
    entryPrice: 38500,
    reasoning: 'Support level holding strongly. Positive sentiment shift in social media metrics.',
    confidence: 90,
    walrusBlobId: '0xstu901vwx234',
    seasonNumber: 1,
    status: 'closed',
    pnl: -120,
    exitPrice: 38200
  },
  {
    id: 'trade_6',
    timestamp: Date.now() - 24 * 60 * 60 * 1000, // 24 hours ago
    aiModel: 'DeepSeek',
    action: 'LONG',
    pair: 'BTC/USDC',
    usdcAmount: 900,
    btcAmount: 0.023,
    entryPrice: 39000,
    reasoning: 'Breakout from consolidation pattern. Increasing institutional inflows detected.',
    confidence: 83,
    walrusBlobId: '0xyza567bcd890',
    seasonNumber: 1,
    status: 'closed',
    pnl: 450,
    exitPrice: 40950
  },
  {
    id: 'trade_7',
    timestamp: Date.now() - 36 * 60 * 60 * 1000, // 36 hours ago
    aiModel: 'GPT-4',
    action: 'SHORT',
    pair: 'BTC/USDC',
    usdcAmount: 1100,
    btcAmount: 0.028,
    entryPrice: 39500,
    reasoning: 'Double top pattern forming. Bearish divergence on multiple timeframes.',
    confidence: 88,
    walrusBlobId: '0xdef234ghi567',
    seasonNumber: 1,
    status: 'closed',
    pnl: 220,
    exitPrice: 38700
  },
  {
    id: 'trade_8',
    timestamp: Date.now() - 48 * 60 * 60 * 1000, // 48 hours ago
    aiModel: 'Gemini',
    action: 'LONG',
    pair: 'BTC/USDC',
    usdcAmount: 1300,
    btcAmount: 0.034,
    entryPrice: 38000,
    reasoning: 'Oversold conditions with bullish hammer candlestick. Volume profile shows accumulation.',
    confidence: 91,
    walrusBlobId: '0xjkl890mno123',
    seasonNumber: 1,
    status: 'closed',
    pnl: 280,
    exitPrice: 39800
  }
];

export interface TradeHistoryData {
  trades: TradeRecord[];
  isLoading: boolean;
  stats: {
    total: number;
    profitable: number;
    totalPnL: number;
    winRate: number;
    byAIModel: Record<string, {
      trades: number;
      profitable: number;
      totalPnL: number;
      winRate: number;
    }>;
  };
}

export function useTradeHistory(
  selectedSeason?: number,
  selectedAI?: string,
  selectedAction?: string,
  timeRange?: '24h' | '7d' | '30d'
): TradeHistoryData {
  
  const tradeHistoryData = useMemo(() => {
    // Simulate loading state
    const isLoading = false;
    
    let filteredTrades = [...mockTrades];
    
    // Filter by season
    if (selectedSeason) {
      filteredTrades = filteredTrades.filter(trade => trade.seasonNumber === selectedSeason);
    }
    
    // Filter by AI model
    if (selectedAI && selectedAI !== 'all') {
      filteredTrades = filteredTrades.filter(trade => trade.aiModel === selectedAI);
    }
    
    // Filter by action
    if (selectedAction && selectedAction !== 'all') {
      filteredTrades = filteredTrades.filter(trade => trade.action === selectedAction);
    }
    
    // Filter by time range
    if (timeRange) {
      const now = Date.now();
      const cutoffTime = now - (
        timeRange === '24h' ? 24 * 60 * 60 * 1000 :
        timeRange === '7d' ? 7 * 24 * 60 * 60 * 1000 :
        30 * 24 * 60 * 60 * 1000
      );
      filteredTrades = filteredTrades.filter(trade => trade.timestamp >= cutoffTime);
    }
    
    // Sort by timestamp (newest first)
    filteredTrades.sort((a, b) => b.timestamp - a.timestamp);

    // Calculate statistics
    const stats = {
      total: filteredTrades.length,
      profitable: filteredTrades.filter(t => (t.pnl || 0) > 0).length,
      totalPnL: filteredTrades.reduce((sum, t) => sum + (t.pnl || 0), 0),
      winRate: 0,
      byAIModel: {} as Record<string, {
        trades: number;
        profitable: number;
        totalPnL: number;
        winRate: number;
      }>
    };

    stats.winRate = stats.total > 0 ? (stats.profitable / stats.total) * 100 : 0;

    // Calculate per-AI stats
    const aiGroups = filteredTrades.reduce((groups, trade) => {
      if (!groups[trade.aiModel]) {
        groups[trade.aiModel] = {
          trades: 0,
          profitable: 0,
          totalPnL: 0,
          winRate: 0
        };
      }
      
      const ai = groups[trade.aiModel];
      ai.trades++;
      if ((trade.pnl || 0) > 0) ai.profitable++;
      ai.totalPnL += trade.pnl || 0;
      ai.winRate = ai.trades > 0 ? (ai.profitable / ai.trades) * 100 : 0;
      
      return groups;
    }, stats.byAIModel);

    return {
      trades: filteredTrades,
      isLoading,
      stats
    };
  }, [selectedSeason, selectedAI, selectedAction, timeRange]);

  return tradeHistoryData;
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
