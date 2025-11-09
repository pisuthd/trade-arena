export interface Vault {
  id: string;
  name: string;
  aiModel: 'GLM-4.6' | 'Claude Sonnet 4' | 'GPT-5' | 'DeepSeek R1';
  startingCapital: number; // 20 USDC
  currentUsdcValue: number;
  holdings: TokenHolding[];
  trades: Trade[];
  metrics: VaultMetrics;
  personality: AIPersonality;
  seasonRanking?: number;
  seasonHistory: SeasonResult[];
}

export interface TokenHolding {
  symbol: string;
  amount: number;
  usdcValue: number;
  pricePerToken: number;
}

export interface Trade {
  id: string;
  timestamp: Date;
  action: 'buy' | 'sell';
  token: string;
  amount: number;
  usdcValue: number;
  reasoning: string;
  confidence: number;
  profit?: number;
  profitPercentage?: number;
}

export interface VaultMetrics {
  totalReturn: number;
  totalReturnPercentage: number;
  winRate: number;
  totalTrades: number;
  averageTradeSize: number;
  maxDrawdown: number;
  sharpeRatio: number;
  currentHoldingsValue: number;
  usdcBalance: number;
}

export interface AIPersonality {
  name: string;
  description: string;
  riskTolerance: 'conservative' | 'moderate' | 'aggressive' | 'scalper';
  typicalTradeSize: number;
  tradeFrequency: 'low' | 'medium' | 'high' | 'very-high';
  confidenceRange: [number, number];
  reasoningStyle: string;
}

export interface Season {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  status: 'upcoming' | 'active' | 'completed';
  duration: number; // in days (14)
  vaults: SeasonVault[];
  finalRankings?: SeasonRanking[];
  totalPrizePool: number;
}

export interface SeasonVault {
  vaultId: string;
  startingCapital: number;
  finalValue?: number;
  return?: number;
  returnPercentage?: number;
  rank?: number;
}

export interface SeasonRanking {
  rank: number;
  vaultId: string;
  vaultName: string;
  aiModel: string;
  finalValue: number;
  return: number;
  returnPercentage: number;
  prize: number;
}

export interface SeasonResult {
  seasonId: string;
  seasonName: string;
  rank: number;
  finalValue: number;
  return: number;
  returnPercentage: number;
  prize: number;
}

export interface LiveEvent {
  id: string;
  timestamp: Date;
  type: 'trade' | 'milestone' | 'ranking_change';
  vaultId: string;
  vaultName: string;
  message: string;
  data?: any;
}

export interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  change24hPercentage: number;
  volume24h: number;
  timestamp: Date;
}

export interface AppState {
  currentSeason: Season | null;
  vaults: Vault[];
  liveEvents: LiveEvent[];
  marketData: MarketData[];
  isLoading: boolean;
  selectedVault: Vault | null;
  timeRange: '1H' | '24H' | '7D' | '30D' | 'ALL';
}

export interface ChartDataPoint {
  timestamp: Date;
  [vaultId: string]: number | Date;
}

export interface VaultContextType {
  vaults: Vault[];
  selectedVault: Vault | null;
  selectVault: (vault: Vault | null) => void;
  updateVaultData: (vaultId: string, updates: Partial<Vault>) => void;
  addTrade: (vaultId: string, trade: Trade) => void;
  addLiveEvent: (event: LiveEvent) => void;
}

export interface AppContextType extends AppState {
  setCurrentSeason: (season: Season) => void;
  setVaults: (vaults: Vault[]) => void;
  setSelectedVault: (vault: Vault | null) => void;
  setTimeRange: (range: '1H' | '24H' | '7D' | '30D' | 'ALL') => void;
  setLoading: (loading: boolean) => void;
  addLiveEvent: (event: LiveEvent) => void;
  setLiveEvents: (events: LiveEvent[]) => void;
}
