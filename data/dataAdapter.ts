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
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';

// Configuration flag for switching between mock and real data
export const USE_MOCK_DATA = true;

// Deployed contract addresses (Sui Testnet)
export const CONTRACT_ADDRESSES = {
  TRADE_ARENA_PACKAGE: '0xa51f1f51ae2e6aa8cc88a1221c4e9da644faccdcd87dde9d2858e042634d285f',
  DEX_GLOBAL: '0xe01a60f171b371a10141476fe421c566bb21d52f1924797fcd44a07d9e9d355b',
  SEASON_GLOBAL: '0x323afc98c387c70f9bc8528d7355aa7e520c352778c2406f15962f6e064bb9da',
  USDC_GLOBAL: '0x1837c2490e780e27f3892ac5a30f241bd4081f80261815f2f381179176327fa1',
  BTC_GLOBAL: '0x632832dd0857cd6edbdcff08a93b6e74d73ef7dabddf7d973c705d3fa31c26db',
  MOCK_USDC_TYPE: '0xa51f1f51ae2e6aa8cc88a1221c4e9da644faccdcd87dde9d2858e042634d285f::mock_usdc::MOCK_USDC',
  MOCK_BTC_TYPE: '0xa51f1f51ae2e6aa8cc88a1221c4e9da644faccdcd87dde9d2858e042634d285f::mock_btc::MOCK_BTC',
} as const;

// Wallet balance interface
export interface WalletBalances {
  SUI: number;
  USDC: number;
  BTC: number;
}

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

// Sui client for blockchain interactions
const suiClient = new SuiClient({ url: getFullnodeUrl('testnet') });

// Data adapter class
export class DataAdapter {
  static async getAIModels(): Promise<AIModel[]> {
    if (USE_MOCK_DATA) {
      const { AI_MODELS } = await import('./mockData');
      return AI_MODELS;
    }
    
    // TODO: Implement real contract data fetching
    // This would query smart contract for AI model info
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
    // This would query season manager contract
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
    // This would query vault balance from contract
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

  // Real wallet balance fetching from Sui blockchain
  static async getWalletBalances(address: string): Promise<WalletBalances> { 
    
    try {
      // Fetch SUI balance
      const suiBalance = await suiClient.getBalance({
        owner: address,
        coinType: '0x2::sui::SUI'
      });

      // Fetch USDC balance
      let usdcBalance = { totalBalance: '0' };
      try {
        usdcBalance = await suiClient.getBalance({
          owner: address,
          coinType: CONTRACT_ADDRESSES.MOCK_USDC_TYPE
        });
      } catch (error) {
        // USDC might not exist, balance is 0
      }

      // Fetch BTC balance
      let btcBalance = { totalBalance: '0' };
      try {
        btcBalance = await suiClient.getBalance({
          owner: address,
          coinType: CONTRACT_ADDRESSES.MOCK_BTC_TYPE
        });
      } catch (error) {
        // BTC might not exist, balance is 0
      }

      return {
        SUI: Number(suiBalance.totalBalance),
        USDC: Number(usdcBalance.totalBalance),
        BTC: Number(btcBalance.totalBalance),
      };
    } catch (error) {
      console.error('Error fetching wallet balances:', error);
      return {
        SUI: 0,
        USDC: 0,
        BTC: 0,
      };
    }
  }

  // Real USDC faucet implementation
  static async requestMockUSDC(address: string, signAndExecuteTransaction?: any): Promise<boolean> {
     
    
    if (!signAndExecuteTransaction) {
      throw new Error('signAndExecuteTransaction function is required for real faucet requests');
    }
    
    try {
      console.log(`Requesting real mock USDC for address: ${address}`);
      
      // Create transaction to mint USDC
      const tx = new Transaction();
      tx.setGasBudget(10000000); // 0.01 SUI gas budget
      
      // Call the mint function from mock_usdc contract
      tx.moveCall({
        target: `${CONTRACT_ADDRESSES.TRADE_ARENA_PACKAGE}::mock_usdc::mint`,
        arguments: [
          tx.object(CONTRACT_ADDRESSES.USDC_GLOBAL), // USDC global object
          tx.pure.u64(1000000000), // 1000 USDC (6 decimals)
          tx.pure.address(address), // recipient address
        ]
      });

      // Execute transaction using dapp-kit
      const result = await signAndExecuteTransaction({
        transaction: tx,
        options: {
          showEffects: true,
          showEvents: true,
        },
      });

      console.log('USDC faucet transaction result:', result);
      
      // Check if transaction was successful
      if (result.effects?.status?.status === 'success') {
        console.log('Successfully minted 1000 USDC');
        return true;
      } else {
        console.error('USDC faucet transaction failed:', result.effects?.status?.error);
        return false;
      }
    } catch (error) {
      console.error('Failed to request mock USDC:', error);
      return false;
    }
  }

  // Helper method to set mock data mode
  static setUseMockData(useMock: boolean) {
    // This would be implemented to dynamically switch between mock and real data
    // For now, it's controlled by the USE_MOCK_DATA constant
    console.log(`Data adapter mode: ${useMock ? 'MOCK' : 'REAL'}`);
  }
}
