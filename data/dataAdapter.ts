// Data adapter for switching between mock and real contract data
import { 
  Trade, 
  VaultValue, 
  AIModel, 
  PortfolioHolding, 
  SeasonData, 
  HistoricalTrade,
  INITIAL_TRADES, 
  generateMockChartData, 
  generateMockTrade,
  generateMockPortfolioHoldings,
  generateMockSeasons,
  generateMockHistoricalTrades
} from './mockData';

// Configuration flag for switching between mock and real data
export const USE_MOCK_DATA = true;

// Contract data interfaces (matching smart contract structure)
export interface ContractVaultBalance {
  usdc_balance: number;
  btc_balance: number;
  lp_supply: number;
}

export interface ContractSeasonInfo {
  season_number: number;
  status: number; // 0 = Pre-Season, 1 = Active, 2 = Ended
  ai_models: Array<{
    name: string;
    wallet_address: string;
  }>;
  created_at: number;
  started_at: number;
  ended_at: number;
  total_trades: number;
  total_volume: number;
}

export interface ContractTradeRecord {
  timestamp: number;
  ai_model: string;
  action: string; // "LONG", "SHORT", "CLOSE"
  pair: string; // "BTC/USDC"  
  usdc_amount: number;
  btc_amount: number;
  entry_price: number;
  reasoning: string;
  confidence: number;
  walrus_blob_id: number[];
}

// Data adapter class
export class DataAdapter {
  static async getAIModels(): Promise<AIModel[]> {
    if (USE_MOCK_DATA) {
      const { AI_MODELS } = await import('./mockData');
      return AI_MODELS;
    }
    
    // TODO: Implement real contract data fetching
    // This would query the smart contract for AI model info
    return [];
  }

  static async getChartData(): Promise<VaultValue[]> {
    if (USE_MOCK_DATA) {
      const { generateMockChartData } = await import('./mockData');
      return generateMockChartData();
    }
    
    // TODO: Implement real contract data fetching
    // This would query vault balances over time from contract
    return [];
  }

  static async getTradeFeed(): Promise<Trade[]> {
    if (USE_MOCK_DATA) {
      const { INITIAL_TRADES } = await import('./mockData');
      return INITIAL_TRADES;
    }
    
    // TODO: Implement real contract data fetching
    // This would query trade history from contract events
    return [];
  }

  static async generateNewTrade(): Promise<Trade> {
    if (USE_MOCK_DATA) {
      const { generateMockTrade } = await import('./mockData');
      return generateMockTrade();
    }
    
    // TODO: Implement real contract data fetching
    // This would listen to real-time trade events
    throw new Error('Real-time trade generation not implemented for contract data');
  }

  static async getSeasonInfo(seasonNumber: number): Promise<ContractSeasonInfo | null> {
    if (USE_MOCK_DATA) {
      // Return mock season info
      return {
        season_number: seasonNumber,
        status: 1, // Active
        ai_models: [
          { name: 'Amazon Nova Pro', wallet_address: '0x1' },
          { name: 'Claude Sonnet 4.5', wallet_address: '0x2' },
          { name: 'Llama 4 Maverick 17B Instruct', wallet_address: '0x3' },
        ],
        created_at: Date.now() - 86400000, // 1 day ago
        started_at: Date.now() - 43200000, // 12 hours ago
        ended_at: 0,
        total_trades: 24,
        total_volume: 15000000, // 15 USDC (6 decimals)
      };
    }
    
    // TODO: Implement real contract data fetching
    // This would query the season manager contract
    return null;
  }

  static async getVaultBalance(seasonNumber: number, aiName: string): Promise<ContractVaultBalance | null> {
    if (USE_MOCK_DATA) {
      // Return mock vault balance
      return {
        usdc_balance: 5000000, // 5 USDC (6 decimals)
        btc_balance: 75000000, // 0.75 BTC (8 decimals)
        lp_supply: 1000000, // 1 LP token
      };
    }
    
    // TODO: Implement real contract data fetching
    // This would query the vault balance from contract
    return null;
  }

  // Helper function to format contract data to UI format
  static formatContractTrade(contractTrade: ContractTradeRecord): Trade {
    return {
      id: contractTrade.timestamp.toString(),
      ai: contractTrade.ai_model,
      action: contractTrade.action === 'LONG' ? 'BUY' : 'SELL',
      pair: contractTrade.pair as 'BTC/USDC',
      usdcAmount: contractTrade.usdc_amount,
      btcAmount: contractTrade.btc_amount,
      price: contractTrade.entry_price,
      confidence: contractTrade.confidence,
      reasoning: contractTrade.reasoning,
      time: this.formatTime(contractTrade.timestamp),
    };
  }

  // Helper function to format timestamps
  static formatTime(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  }

  // Helper function to convert contract amounts to display format
  static formatUSDC(amount: number): string {
    return (amount / 1_000_000).toFixed(2);
  }

  static formatBTC(amount: number): string {
    return (amount / 1_000_000_000).toFixed(8);
  }

  // New methods for portfolio, seasons, and historical trades
  static async getPortfolioHoldings(seasonNumber?: number): Promise<PortfolioHolding[]> {
    if (USE_MOCK_DATA) {
      return generateMockPortfolioHoldings(seasonNumber);
    }
    
    // TODO: Implement real contract data fetching
    // This would query user's vault holdings from contract
    return [];
  }

  static async getSeasons(): Promise<SeasonData[]> {
    if (USE_MOCK_DATA) {
      return generateMockSeasons();
    }
    
    // TODO: Implement real contract data fetching
    // This would query all seasons from contract
    return [];
  }

  static async getHistoricalTrades(seasonNumber?: number): Promise<HistoricalTrade[]> {
    if (USE_MOCK_DATA) {
      return generateMockHistoricalTrades(seasonNumber);
    }
    
    // TODO: Implement real contract data fetching
    // This would query trade history from contract events
    return [];
  }

  // Helper function to get season status text
  static getSeasonStatusText(status: number) {
    switch (status) {
      case 0:
        return { text: 'Pre-Season', color: 'text-blue-400', bg: 'bg-blue-400/10' };
      case 1:
        return { text: 'Active', color: 'text-green-400', bg: 'bg-green-400/10' };
      case 2:
        return { text: 'Ended', color: 'text-red-400', bg: 'bg-red-400/10' };
      default:
        return { text: 'Unknown', color: 'text-gray-400', bg: 'bg-gray-400/10' };
    }
  }

  // Helper function to get model emoji
  static getModelEmoji(modelName: string): string {
    const emojis: Record<string, string> = {
      'Amazon Nova Pro': '🚀',
      'Claude Sonnet 4.5': '🧠',
      'Llama 4 Maverick 17B Instruct': '🦙',
    };
    return emojis[modelName] || '🤖';
  }

  // Helper function to get model color
  static getModelColor(modelName: string): string {
    const colors: Record<string, string> = {
      'Amazon Nova Pro': '#00ff88',
      'Claude Sonnet 4.5': '#00d4ff',
      'Llama 4 Maverick 17B Instruct': '#ff00ff',
    };
    return colors[modelName] || '#ffffff';
  }

  // Helper function to get available models
  static getAvailableModels(): string[] {
    return Object.keys({
      'Amazon Nova Pro': '🚀',
      'Claude Sonnet 4.5': '🧠',
      'Llama 4 Maverick 17B Instruct': '🦙',
    });
  }
}
