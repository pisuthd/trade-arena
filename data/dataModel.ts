 
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
  walrus_blob_id?: number[];
}

export interface VaultValue {
  time: string;
  AmazonNovaPro: number;
  ClaudeSonnet: number;
  LlamaMaverick: number;
}

export interface AIModel {
  name: string;
  displayName: string;
  value: number;
  change: number;
  color: string;
  emoji?: string;
  tvl?: number;
  pnl?: number;
  trades?: number;
  rank?: number;
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
    pnlPercentage: number;
    winRate: number;
  }[];
  metrics: {
    totalDepositors: number;
    totalTVL: number;
    averageAPY: number;
    bestPerformer: string | null;
    worstPerformer: string | null;
  }
  milestones: {
    date: string;
    event: string;
    type: string;
  }[];
  rawContractData?: any; // Raw smart contract data for detailed processing
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
    name: 'CLAUDE', 
    displayName: 'Claude Sonnet 4.5',
    value: 13830, 
    change: 38.3, 
    color: '#00d4ff' 
  },
  { 
    name: 'NOVA', 
    displayName: 'Amazon Nova Pro',
    value: 12450, 
    change: 24.5, 
    color: '#00ff88' 
  },
  { 
    name: 'LLAMA', 
    displayName: 'Llama 4 Maverick',
    value: 11200, 
    change: 12.0, 
    color: '#ff00ff' 
  },
];
 