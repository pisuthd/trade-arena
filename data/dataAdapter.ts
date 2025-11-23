 
import {
  Trade, 
  SeasonData, 
} from './dataModel';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { CONTRACT_ADDRESSES, CONTRACT_TARGETS, GAS_CONFIG, convertToDecimals, convertFromDecimals } from '../config/contracts';


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
  // BTC price cache to avoid repeated API calls
  private static btcPriceCache: number | null = null;
  private static btcPriceCacheTime: number = 0;
  private static readonly BTC_PRICE_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  // Fetch BTC price from API
  private static async fetchBTCPrice(): Promise<number> {
    // Check cache first
    const now = Date.now();
    if (this.btcPriceCache && (now - this.btcPriceCacheTime) < this.BTC_PRICE_CACHE_DURATION) {
      return this.btcPriceCache;
    }

    try {
      const response = await fetch('https://kvxdikvk5b.execute-api.ap-southeast-1.amazonaws.com/prod/prices');
      const data = await response.json();
      
      if (data.success && data.data) {
        const btcData = data.data.find((item: any) => item.symbol === 'BTC');
        if (btcData) {
          this.btcPriceCache = btcData.price;
          this.btcPriceCacheTime = now;
          console.log(`Fetched BTC price: $${btcData.price}`);
          return btcData.price;
        }
      }
      
      throw new Error('BTC price not found in API response');
    } catch (error) {
      console.error('Error fetching BTC price:', error);
      // Fallback to default price if API fails
      return 95000;
    }
  }

  // Public method to get current BTC price
  static async getBTCPrice(): Promise<number> {
    return this.fetchBTCPrice();
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
    return convertFromDecimals(amount, 'USDC').toFixed(2);
  }

  static formatBTC(amount: number): string {
    return convertFromDecimals(amount, 'BTC').toFixed(8);
  }
 

  static async getSeasons(btcPriceOverride?: number): Promise<SeasonData[]> {
    // Get BTC price (use override if provided, otherwise fetch from API)
    const btcPrice = btcPriceOverride || await this.getBTCPrice();

    try {
      // Fetch season data from smart contract
      const result = await suiClient.getObject({
        id: CONTRACT_ADDRESSES.SEASON_GLOBAL,
        options: {
          showContent: true,
          showType: true,
        },
      });
 

      if (!result.data?.content) {
        throw new Error('Season object not found or has no content');
      }

      const content = result.data.content as any;
      const fields = content.fields || {};

      // seasons is a VecMap<u64, Season>, need to access it properly
      const seasonsVecMap = fields.seasons || {};
      const seasonsContents = seasonsVecMap.fields.contents || []; // Get the actual map data as array

      // Convert contract data to UI format
      const seasons: SeasonData[] = seasonsContents.map((entry: any) => {
        const seasonNumber = parseInt(entry.fields.key);
        const seasonData = entry.fields.value || {};

        // Map status number to string
        let status: 'pre-season' | 'active' | 'ended' = 'pre-season';
        switch (seasonData.fields.status || 0) {
          case 0:
            status = 'pre-season';
            break;
          case 1:
            status = 'active';
            break;
          case 2:
            status = 'ended';
            break;
        }
 
 
        // Format AI models from vector
        const aiModels = seasonData.fields.ai_models || [];
        const formattedAIModels = aiModels.map((model: any) => {
          const modelFields = model.fields || model;
          return {
            name: modelFields.name || '',
            wallet_address: modelFields.wallet_address || '',
            status: status === 'ended' ? 'completed' :
              status === 'active' ? 'active' : 'registered',
            tvl: 0, // Will be populated from vault data
            trades: 0, // Will be populated from trade history
            pnl: 0, // Will be calculated from vault performance
          };
        });
 
        // Format AI vaults from VecMap<String, AIVault<String>>
        const aiVaults = seasonData.fields.ai_vaults || {};
        
        // console.log("AI Vaults structure:", JSON.stringify(aiVaults, null, 2));
        
        // Handle both possible structures: direct contents or nested fields.contents
        let vaultContents = [];
        if (aiVaults.contents) {
          vaultContents = aiVaults.contents;
        } else if (aiVaults.fields && aiVaults.fields.contents) {
          vaultContents = aiVaults.fields.contents;
        } 
        
        console.log("Vault contents found:", vaultContents.length, "vaults");

        // Update TVL and performance metrics for each AI model from vault data
        vaultContents.forEach((vault: any) => { 
          const aiName = vault.fields.key;
          const vaultData = vault.fields.value;
          const modelIndex = formattedAIModels.findIndex((model: any) => model.name === aiName);
          if (modelIndex !== -1) {
            // Access nested fields structure correctly
            const vaultFields = vaultData.fields || {};
 
            // Calculate TVL including both USDC and BTC
            const usdcValue = convertFromDecimals(Number(vaultFields.usdc_balance || 0), 'USDC');
            const btcAmount = convertFromDecimals(Number(vaultFields.btc_balance || 0), 'BTC');
            const btcValueInUSDC = btcAmount * btcPrice; // Use dynamic BTC price
            formattedAIModels[modelIndex].tvl = usdcValue + btcValueInUSDC;
            
            console.log(`TVL for ${aiName}: USDC raw=${vaultFields.usdc_balance}, BTC raw=${vaultFields.btc_balance}`);
            console.log(`TVL for ${aiName}: USDC=${usdcValue}, BTC=${btcAmount}, BTC Value=${btcValueInUSDC}, Total=${formattedAIModels[modelIndex].tvl}`);

            // Calculate performance metrics
            const tradeHistory = vaultFields.trade_history || [];
            formattedAIModels[modelIndex].trades = tradeHistory.length;

            // Format trade history for easier access in components
            const formattedTradeHistory = tradeHistory.map((trade: any) => {
              const tradeFields = trade.fields;
              return {
                timestamp: tradeFields.timestamp,
                action: tradeFields.action,
                usdcAmount: parseFloat(tradeFields.usdc_amount) / 1000000, // Convert from 6 decimals
                btcAmount: parseFloat(tradeFields.btc_amount) / 100000000, // Convert from 8 decimals
                entryPrice: parseFloat(tradeFields.entry_price) / 100000000, // Convert from 8 decimals
                reasoning: tradeFields.reasoning,
                confidence: tradeFields.confidence,
              };
            });

            // Add formatted trade history to model
            formattedAIModels[modelIndex].tradeHistory = formattedTradeHistory;

            // Current vault value (already calculated as TVL)
            const currentVaultValue = formattedAIModels[modelIndex].tvl;

            // Simple P&L calculation: Current Value - Initial Deposit ($3,000)
            const initialDeposit = 3000;
            const pnl = currentVaultValue - initialDeposit;
            const pnlPercentage = (pnl / initialDeposit) * 100;

            // Calculate win rate based on trade history
            let profitableTrades = 0;
            tradeHistory.forEach((trade: any) => {
              const tradeFields = trade.fields;
              const action = tradeFields.action;
              const entryPrice = Number(tradeFields.entry_price) / 1e8; // Convert from decimals

              if (action === 'LONG' && btcPrice > entryPrice) {
                profitableTrades++;
              } else if (action === 'SHORT' && btcPrice < entryPrice) {
                profitableTrades++;
              }
            });

            const winRate = tradeHistory.length > 0 ? (profitableTrades / tradeHistory.length) * 100 : 0;

            // Update model with performance data
            formattedAIModels[modelIndex].pnl = pnl;
            formattedAIModels[modelIndex].pnlPercentage = pnlPercentage;
            formattedAIModels[modelIndex].winRate = winRate;

            console.log(`Performance for ${aiName}: PnL=${pnl}, PnL%=${pnlPercentage.toFixed(2)}%, Win Rate=${winRate.toFixed(2)}%, Trades=${tradeHistory.length}`);
          }
        });

        // Calculate metrics
        const totalTVL = formattedAIModels.reduce((sum: number, model: any) => sum + model.tvl, 0);
        const totalTrades = seasonData.fields.total_trades || 0;
        const totalVolume = convertFromDecimals(Number(seasonData.fields.total_volume || 0), 'USDC');

        console.log("Final TVL calculation:");
        console.log("Formatted AI Models:", formattedAIModels );
        console.log("Total TVL:", totalTVL);
        console.log("seasonData.fields:", seasonData.fields)

        return {
          id: seasonNumber,
          seasonNumber,
          status,
          title: `Season ${seasonNumber}`,
          description: `AI trading competition season ${seasonNumber}`,
          createdAt: new Date((Number(seasonData.fields.created_at))).toISOString().split('T')[0],
          startedAt: seasonData.fields.started_at !== "0" ? new Date(Number(seasonData.fields.started_at)).toISOString().split('T')[0] : "None",
          endedAt: seasonData.fields.ended_at !=="0" ? new Date(Number(seasonData.fields.ended_at)).toISOString().split('T')[0] : "None",
          totalTrades,
          totalVolume,
          aiModels: formattedAIModels,
          // Include raw contract data for season page to access
          rawContractData: {
            fields: seasonData.fields
          },
          metrics: {
            totalDepositors: vaultContents.length, // Approximate depositor count
            totalTVL,
            averageAPY: 0, // Will be calculated from performance data
            bestPerformer: formattedAIModels.length > 0 ? formattedAIModels[0].name : null,
            worstPerformer: formattedAIModels.length > 0 ? formattedAIModels[formattedAIModels.length - 1].name : null,
          },
          milestones: [
            { date: new Date((Number(seasonData.fields.created_at || 0)) ).toISOString().split('T')[0], event: 'Season Created', type: 'creation' },
            ...(seasonData.fields.started_at ? [{ date: new Date(Number(seasonData.fields.started_at) ).toISOString().split('T')[0], event: 'Trading Started', type: 'start' }] : []),
            ...(seasonData.fields.ended_at ? [{ date: new Date(Number(seasonData.fields.ended_at)).toISOString().split('T')[0], event: 'Season Ended', type: 'end' }] : []),
          ],
        };
      });

      return seasons.sort((a, b) => b.seasonNumber - a.seasonNumber); // Sort by season number descending
    } catch (error) {
      console.error('Error fetching seasons from contract:', error);
      return [];
    }
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
    const modelEmojis: { [key: string]: string } = {
      'CLAUDE': '🤖',
      'NOVA': '🚀',
      'LLAMA': '🦙'
    };
    return modelEmojis[modelName] || '🤖';
  }

  // Helper function to get model display name
  static getModelDisplayName(modelName: string): string {
    const modelMappings: { [key: string]: string } = {
      'CLAUDE': 'Claude Sonnet 4.5',
      'NOVA': 'Amazon Nova Pro',
      'LLAMA': 'Llama 4 Maverick'
    };
    return modelMappings[modelName] || modelName;
  }

  // Helper function to get contract model name from display name
  static getContractModelName(displayName: string): string {
    const reverseMappings: { [key: string]: string } = {
      'Claude Sonnet 4.5': 'CLAUDE',
      'Amazon Nova Pro': 'NOVA',
      'Llama 4 Maverick': 'LLAMA'
    };
    return reverseMappings[displayName] || displayName;
  }

  // Helper function to validate contract model name
  static isValidContractModelName(modelName: string): boolean {
    const validModels = ['CLAUDE', 'NOVA', 'LLAMA'];
    return validModels.includes(modelName);
  }

  // Helper function to get model color
  static getModelColor(modelName: string): string {
    const colors: Record<string, string> = {
      'CLAUDE': '#00d4ff',
      'NOVA': '#00ff88',
      'LLAMA': '#ff00ff',
    };
    return colors[modelName] || '#ffffff';
  }

  // Helper function to get available models
  static getAvailableModels(): string[] {
    return Object.keys({
      'CLAUDE': '🧠',
      'NOVA': '🚀',
      'LLAMA': '🦙',
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
      tx.setGasBudget(GAS_CONFIG.DEFAULT_BUDGET);

      // Call mint function from mock_usdc contract
      tx.moveCall({
        target: CONTRACT_TARGETS.MINT_USDC,
        arguments: [
          tx.object(CONTRACT_ADDRESSES.USDC_GLOBAL), // USDC global object
          tx.pure.u64(convertToDecimals(1000, 'USDC')), // 1000 USDC
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

      // Check transaction status - new version returns digest for successful transactions
      // If there's a digest, transaction was successful
      if (result.digest) {
        console.log('Successfully minted 1000 USDC');
        return true;
      } else {
        console.error('USDC faucet transaction failed - no digest returned');
        return false;
      }
    } catch (error) {
      console.error('Failed to request mock USDC:', error);
      return false;
    }
  }
 
}
