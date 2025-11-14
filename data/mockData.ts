// Mock data generators aligned with smart contracts

export interface Trade {
  id: string;
  ai: string;
  action: 'BUY' | 'SELL';
  pair: 'BTC/USDC';
  usdcAmount: number;
  btcAmount: number;
  price: number;
  confidence: number;
  reasoning: string;
  time: string;
}

export interface VaultValue {
  time: string;
  AmazonNovaPro: number;
  ClaudeSonnet: number;
  LlamaMaverick: number;
}

export interface AIModel {
  name: string;
  value: number;
  change: number;
  color: string;
  emoji?: string;
}

// Portfolio and season data structures
export interface PortfolioHolding {
  seasonNumber: number;
  aiName: string;
  seasonStatus: number; // 0: pre-season, 1: active, 2: ended
  usdcBalance: number;
  btcBalance: number;
  lpShares: number;
  currentValue: number;
  profit: number;
  ownershipPercentage: number;
}

export interface SeasonData {
  id: number;
  seasonNumber: number;
  status: 'pre-season' | 'active' | 'ended';
  title: string;
  description: string;
  createdAt: string;
  startedAt: string | null;
  endedAt: string | null;
  totalTrades: number;
  totalVolume: number;
  aiModels: {
    name: string;
    walletAddress: string;
    status: string;
    tvl: number;
    trades: number;
    pnl: number;
  }[];
  metrics: {
    totalDepositors: number;
    totalTVL: number;
    averageAPY: number;
    bestPerformer: string | null;
    worstPerformer: string | null;
  };
  milestones: {
    date: string;
    event: string;
    type: string;
  }[];
}

export interface HistoricalTrade {
  id: string;
  aiModel: string;
  action: 'BUY' | 'SELL';
  pair: 'BTC/USDC';
  usdcAmount: number;
  btcAmount: number;
  entryPrice: number;
  exitPrice?: number;
  pnl?: number;
  confidence: number;
  reasoning: string;
  timestamp: number;
  seasonNumber: number;
  status: 'active' | 'completed';
  walrusBlobId: string;
}

export const AI_MODELS: AIModel[] = [
  { 
    name: 'Amazon Nova Pro', 
    value: 13830, 
    change: 38.3, 
    color: '#00ff88' 
  },
  { 
    name: 'Claude Sonnet 4.5', 
    value: 12450, 
    change: 24.5, 
    color: '#00d4ff' 
  },
  { 
    name: 'Llama 4 Maverick 17B Instruct', 
    value: 11200, 
    change: 12.0, 
    color: '#ff00ff' 
  },
];

export const INITIAL_TRADES: Trade[] = [
  { 
    id: '1', 
    ai: 'Amazon Nova Pro', 
    action: 'BUY', 
    pair: 'BTC/USDC', 
    usdcAmount: 500,
    btcAmount: 0.0075,
    price: 66500,
    confidence: 85, 
    time: '2s ago',
    reasoning: 'Strong bullish momentum detected with increasing volume'
  },
  { 
    id: '2', 
    ai: 'Claude Sonnet 4.5', 
    action: 'SELL', 
    pair: 'BTC/USDC', 
    usdcAmount: 300,
    btcAmount: 0.0045,
    price: 66700,
    confidence: 72, 
    time: '8s ago',
    reasoning: 'Overbought conditions suggest short-term correction'
  },
  { 
    id: '3', 
    ai: 'Llama 4 Maverick 17B Instruct', 
    action: 'BUY', 
    pair: 'BTC/USDC', 
    usdcAmount: 450,
    btcAmount: 0.0068,
    price: 66200,
    confidence: 68, 
    time: '15s ago',
    reasoning: 'Support level holding, potential bounce'
  },
  { 
    id: '4', 
    ai: 'Amazon Nova Pro', 
    action: 'BUY', 
    pair: 'BTC/USDC', 
    usdcAmount: 750,
    btcAmount: 0.0113,
    price: 66400,
    confidence: 91, 
    time: '23s ago',
    reasoning: 'Breakout pattern confirmed with high conviction'
  },
  { 
    id: '5', 
    ai: 'Claude Sonnet 4.5', 
    action: 'SELL', 
    pair: 'BTC/USDC', 
    usdcAmount: 200,
    btcAmount: 0.0030,
    price: 66800,
    confidence: 55, 
    time: '31s ago',
    reasoning: 'Risk management - partial profit taking'
  },
];

export const generateMockChartData = (): VaultValue[] => {
  const data = [];
  let baseValue = 10000;
  for (let i = 0; i < 20; i++) {
    data.push({
      time: `${i}h`,
      AmazonNovaPro: baseValue + Math.random() * 2000 - 500,
      ClaudeSonnet: baseValue + Math.random() * 3000 - 1000,
      LlamaMaverick: baseValue + Math.random() * 2500 - 800,
    });
    baseValue += Math.random() * 200 - 100;
  }
  return data;
};

export const generateMockTrade = (): Trade => {
  const ai = AI_MODELS[Math.floor(Math.random() * AI_MODELS.length)];
  const action = Math.random() > 0.5 ? 'BUY' : 'SELL';
  const usdcAmount = Math.floor(Math.random() * 800 + 200);
  const price = 65000 + Math.random() * 3000; // BTC price range
  const btcAmount = usdcAmount / price;
  
  const reasoningTemplates = {
    BUY: [
      'Strong bullish momentum detected with increasing volume',
      'Support level holding, potential bounce',
      'Breakout pattern confirmed with high conviction',
      'RSI oversold, suggesting upward movement',
      'Positive sentiment indicators across multiple timeframes'
    ],
    SELL: [
      'Overbought conditions suggest short-term correction',
      'Risk management - partial profit taking',
      'Resistance level rejection confirmed',
      'Bearish divergence detected on momentum indicators',
      'Market uncertainty prompts position reduction'
    ]
  };
  
  const reasoning = reasoningTemplates[action][Math.floor(Math.random() * reasoningTemplates[action].length)];
  
  return {
    id: Date.now().toString(),
    ai: ai.name,
    action,
    pair: 'BTC/USDC',
    usdcAmount,
    btcAmount,
    price,
    confidence: Math.floor(Math.random() * 40 + 60),
    reasoning,
    time: 'just now'
  };
};

// Portfolio data generator
export const generateMockPortfolioHoldings = (seasonNumber?: number): PortfolioHolding[] => {
  const holdings: PortfolioHolding[] = [];
  
  // Generate holdings for different seasons
  const seasons = seasonNumber ? [seasonNumber] : [1, 2];
  
  seasons.forEach(season => {
    AI_MODELS.forEach((model, index) => {
      const usdcBalance = Math.floor(Math.random() * 50000 + 10000) * 1_000_000; // 6 decimals
      const btcBalance = Math.floor(Math.random() * 1000000 + 100000); // 6 decimals
      const currentValue = (usdcBalance / 1_000_000) + (btcBalance / 1_000_000) * 66000;
      const depositedAmount = 20000 + index * 5000;
      const profit = currentValue - depositedAmount;
      
      holdings.push({
        seasonNumber: season,
        aiName: model.name,
        seasonStatus: season === 1 ? 2 : 1, // Season 1 ended, Season 2 active
        usdcBalance,
        btcBalance,
        lpShares: Math.floor(currentValue * 100), // LP shares based on value
        currentValue,
        profit,
        ownershipPercentage: Math.random() * 5 + 0.5 // 0.5% to 5.5%
      });
    });
  });
  
  return holdings;
};

// Season data generator
export const generateMockSeasons = (): SeasonData[] => {
  return [
    {
      id: 1,
      seasonNumber: 1,
      status: 'ended',
      title: 'Inaugural Trading Championship',
      description: 'The first-ever AI trading competition featuring top models battling for supremacy.',
      createdAt: '2024-01-15',
      startedAt: '2024-01-20',
      endedAt: '2024-02-15',
      totalTrades: 1247,
      totalVolume: 2847500,
      aiModels: AI_MODELS.map((model, index) => ({
        name: model.name,
        walletAddress: `0x${Math.random().toString(16).substr(2, 8)}...`,
        status: 'completed',
        tvl: 245000 - index * 30000,
        trades: 342 - index * 50,
        pnl: 38.3 - index * 8.5
      })),
      metrics: {
        totalDepositors: 224,
        totalTVL: 688000,
        averageAPY: 19.8,
        bestPerformer: AI_MODELS[0].name,
        worstPerformer: AI_MODELS[2].name,
      },
      milestones: [
        { date: '2024-01-15', event: 'Season Created', type: 'creation' },
        { date: '2024-01-20', event: 'Trading Started', type: 'start' },
        { date: '2024-02-15', event: 'Season Ended', type: 'end' },
        { date: '2024-01-25', event: '1000+ Trades Executed', type: 'milestone' },
      ]
    },
    {
      id: 2,
      seasonNumber: 2,
      status: 'active',
      title: 'Winter Trading League',
      description: 'Current season with enhanced AI models and new trading strategies.',
      createdAt: '2024-02-01',
      startedAt: '2024-02-10',
      endedAt: null,
      totalTrades: 856,
      totalVolume: 1923400,
      aiModels: AI_MODELS.map((model, index) => ({
        name: model.name,
        walletAddress: `0x${Math.random().toString(16).substr(2, 8)}...`,
        status: index === 1 ? 'paused' : 'active',
        tvl: 320000 - index * 40000,
        trades: 245 - index * 30,
        pnl: 28.7 - index * 6.5
      })),
      metrics: {
        totalDepositors: 189,
        totalTVL: 832000,
        averageAPY: 15.2,
        bestPerformer: AI_MODELS[0].name,
        worstPerformer: AI_MODELS[2].name,
      },
      milestones: [
        { date: '2024-02-01', event: 'Season Created', type: 'creation' },
        { date: '2024-02-10', event: 'Trading Started', type: 'start' },
        { date: '2024-02-20', event: '500+ Trades Executed', type: 'milestone' },
      ]
    }
  ];
};

// Historical trades generator
export const generateMockHistoricalTrades = (seasonNumber?: number): HistoricalTrade[] => {
  const trades: HistoricalTrade[] = [];
  const seasons = seasonNumber ? [seasonNumber] : [1, 2];
  
  seasons.forEach(season => {
    // Generate 50-100 trades per season
    const tradeCount = Math.floor(Math.random() * 50) + 50;
    
    for (let i = 0; i < tradeCount; i++) {
      const model = AI_MODELS[Math.floor(Math.random() * AI_MODELS.length)];
      const action = Math.random() > 0.5 ? 'BUY' : 'SELL';
      const usdcAmount = Math.floor(Math.random() * 2000 + 500);
      const entryPrice = 65000 + Math.random() * 4000;
      const btcAmount = usdcAmount / entryPrice;
      
      // Some trades are completed, some are active
      const isCompleted = Math.random() > 0.3;
      const exitPrice = isCompleted ? entryPrice + (Math.random() - 0.5) * 2000 : undefined;
      const pnl = isCompleted && exitPrice ? (exitPrice - entryPrice) * btcAmount : undefined;
      
      const reasoningTemplates = {
        BUY: [
          'Strong bullish momentum detected with increasing volume',
          'Support level holding, potential bounce',
          'Breakout pattern confirmed with high conviction',
          'RSI oversold, suggesting upward movement',
          'Positive sentiment indicators across multiple timeframes'
        ],
        SELL: [
          'Overbought conditions suggest short-term correction',
          'Risk management - partial profit taking',
          'Resistance level rejection confirmed',
          'Bearish divergence detected on momentum indicators',
          'Market uncertainty prompts position reduction'
        ]
      };
      
      trades.push({
        id: `${season}-${i}-${Date.now()}`,
        aiModel: model.name,
        action,
        pair: 'BTC/USDC',
        usdcAmount,
        btcAmount,
        entryPrice,
        exitPrice,
        pnl,
        confidence: Math.floor(Math.random() * 40 + 60),
        reasoning: reasoningTemplates[action][Math.floor(Math.random() * reasoningTemplates[action].length)],
        timestamp: Date.now() - (i * 3600000) - (season * 30 * 24 * 3600000), // Spread over time
        seasonNumber: season,
        status: isCompleted ? 'completed' : 'active',
        walrusBlobId: `0x${Math.random().toString(16).substr(2, 64)}`
      });
    }
  });
  
  return trades.sort((a, b) => b.timestamp - a.timestamp); // Sort by most recent
};
