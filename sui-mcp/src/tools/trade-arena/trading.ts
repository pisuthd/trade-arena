import { Agent } from '../../agent';
import { TransactionResponse } from '../../types';
import { Transaction } from '@mysten/sui/transactions';

export interface TradeExecutionParams {
  seasonGlobalId: string;
  seasonNumber: number;
  aiModel: string;
  dexGlobalId: string;
  usdcAmount: number;
  btcAmount?: number;
  reasoning: string;
  confidence: number;
  walrusBlobId: string;
  packageId: string;
}

export interface VaultBalanceParams {
  seasonGlobalId: string;
  seasonNumber: number;
  packageId: string;
}

export interface TradeHistoryParams {
  seasonGlobalId: string;
  seasonNumber: number;
  packageId: string;
}

export async function executeLongTrade(
  agent: Agent,
  params: TradeExecutionParams
): Promise<TransactionResponse> {
  try {
    // Create transaction for LONG trade (USDC → BTC)
    const tx = new Transaction();

    // Execute the AI long trade function
    tx.moveCall({
      target: `${params.packageId}::season_manager::ai_execute_long`,
      arguments: [
        tx.object(params.seasonGlobalId),
        tx.pure.u64(params.seasonNumber),
        tx.pure.string(params.aiModel),
        tx.object(params.dexGlobalId),
        tx.pure.u64(params.usdcAmount),
        tx.pure.string(params.reasoning),
        tx.pure.u64(params.confidence),
        tx.pure.vector('u8', Array.from(Buffer.from(params.walrusBlobId, 'hex'))),
        tx.sharedObjectRef({
          objectId: '0x6', // Clock object ID
          initialSharedVersion: 1,
          mutable: false
        })
      ],
      typeArguments: [
        '0xa51f1f51ae2e6aa8cc88a1221c4e9da644faccdcd87dde9d2858e042634d285f::mock_usdc::MOCK_USDC',
        '0xa51f1f51ae2e6aa8cc88a1221c4e9da644faccdcd87dde9d2858e042634d285f::mock_btc::MOCK_BTC'
      ]
    });

    const result = await agent.client.signAndExecuteTransaction({
      transaction: tx,
      signer: agent.wallet,
      options: {
        showEffects: true,
        showEvents: true,
      }
    });

    return {
      digest: result.digest,
      status: result.effects?.status.status === 'success' ? 'success' : 'failed'
    };

  } catch (error) {
    console.error('Error executing long trade:', error);
    return {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function executeShortTrade(
  agent: Agent,
  params: TradeExecutionParams
): Promise<TransactionResponse> {
  try {
    if (!params.btcAmount) {
      throw new Error('btcAmount is required for short trades');
    }

    // Create transaction for SHORT trade (BTC → USDC)
    const tx = new Transaction();

    // Execute the AI short trade function
    tx.moveCall({
      target: `${params.packageId}::season_manager::ai_execute_short`,
      arguments: [
        tx.object(params.seasonGlobalId),
        tx.pure.u64(params.seasonNumber),
        tx.pure.string(params.aiModel),
        tx.object(params.dexGlobalId),
        tx.pure.u64(params.btcAmount),
        tx.pure.string(params.reasoning),
        tx.pure.u64(params.confidence),
        tx.pure.vector('u8', Array.from(Buffer.from(params.walrusBlobId, 'hex'))),
        tx.sharedObjectRef({
          objectId: '0x6', // Clock object ID
          initialSharedVersion: 1,
          mutable: false
        })
      ],
      typeArguments: [
        '0xa51f1f51ae2e6aa8cc88a1221c4e9da644faccdcd87dde9d2858e042634d285f::mock_usdc::MOCK_USDC',
        '0xa51f1f51ae2e6aa8cc88a1221c4e9da644faccdcd87dde9d2858e042634d285f::mock_btc::MOCK_BTC'
      ]
    });

    const result = await agent.client.signAndExecuteTransaction({
      transaction: tx,
      signer: agent.wallet,
      options: {
        showEffects: true,
        showEvents: true,
      }
    });

    return {
      digest: result.digest,
      status: result.effects?.status.status === 'success' ? 'success' : 'failed'
    };

  } catch (error) {
    console.error('Error executing short trade:', error);
    return {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function getVaultBalance(
  agent: Agent,
  params: VaultBalanceParams
): Promise<any> {
  try {
    const result = await agent.client.getObject({
      id: params.seasonGlobalId,
      options: {
        showContent: true,
        showType: true,
      }
    });

    if (!result.data?.content) {
      throw new Error('Season object not found or has no content');
    }

    const content = result.data.content as any;
    const fields = content.fields || {};
    
    // seasons is a VecMap<u64, Season>, need to access it properly
    const seasonsVecMap = fields.seasons || {};
    const seasonsContents = seasonsVecMap.contents || [];
    
    // Find the specific season
    const seasonEntry = seasonsContents.find((entry: any) => 
      entry.key === params.seasonNumber.toString()
    );
    
    if (!seasonEntry) {
      throw new Error(`Season ${params.seasonNumber} not found`);
    }

    const seasonData = seasonEntry.value;
    const season = seasonData.fields || {};
    const aiVaults = season.ai_vaults || {};
    const vaultContents = aiVaults.contents || [];
    
    if (vaultContents.length === 0) {
      throw new Error('No AI vaults found for this season');
    }

    // Return balances for all vaults
    const vaultBalances = vaultContents.map((entry: any) => {
      const aiName = entry.key;
      const vaultData = entry.value;
      
      return {
        ai_name: aiName,
        authorized_wallet: vaultData.authorized_wallet || '',
        trading_paused: vaultData.trading_paused || false,
        usdc_balance: vaultData.usdc_balance || '0',
        btc_balance: vaultData.btc_balance || '0',
        lp_supply: vaultData.lp_supply?.value || '0',
        trade_history_count: (vaultData.trade_history || []).length
      };
    });

    return {
      season_number: params.seasonNumber,
      total_vaults: vaultBalances.length,
      vaults: vaultBalances
    };

  } catch (error) {
    console.error('Error getting vault balance:', error);
    throw error;
  }
}

export async function getTradeHistory(
  agent: Agent,
  params: TradeHistoryParams
): Promise<any> {
  try {
    const result = await agent.client.getObject({
      id: params.seasonGlobalId,
      options: {
        showContent: true,
        showType: true,
      }
    });

    if (!result.data?.content) {
      throw new Error('Season object not found or has no content');
    }

    const content = result.data.content as any;
    const fields = content.fields || {};
    
    // seasons is a VecMap<u64, Season>, need to access it properly
    const seasonsVecMap = fields.seasons || {};
    const seasonsContents = seasonsVecMap.contents || [];
    
    // Find the specific season
    const seasonEntry = seasonsContents.find((entry: any) => 
      entry.key === params.seasonNumber.toString()
    );
    
    if (!seasonEntry) {
      throw new Error(`Season ${params.seasonNumber} not found`);
    }

    const seasonData = seasonEntry.value;
    const season = seasonData.fields || {};
    const aiVaults = season.ai_vaults || {};
    const vaultContents = aiVaults.contents || [];
    
    // Collect trade history from all AI vaults
    const allTradeHistory: any[] = [];
    
    for (const entry of vaultContents) {
      const aiName = entry.key;
      const vaultData = entry.value;
      const tradeHistory = vaultData.trade_history || [];
      
      // Format trade history for this AI vault
      const formattedHistory = tradeHistory.map((trade: any) => {
        const tradeFields = trade.fields || trade;
        return {
          timestamp: tradeFields.timestamp,
          ai_model: tradeFields.ai_model || aiName,
          action: tradeFields.action,
          pair: tradeFields.pair,
          usdc_amount: tradeFields.usdc_amount,
          btc_amount: tradeFields.btc_amount,
          entry_price: tradeFields.entry_price,
          reasoning: tradeFields.reasoning,
          confidence: tradeFields.confidence,
          walrus_blob_id: tradeFields.walrus_blob_id ? 
            Buffer.from(tradeFields.walrus_blob_id).toString('hex') : null
        };
      });
      
      allTradeHistory.push(...formattedHistory);
    }

    // Sort by timestamp (newest first)
    allTradeHistory.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    return {
      season_number: params.seasonNumber,
      total_trades: allTradeHistory.length,
      trades: allTradeHistory
    };

  } catch (error) {
    console.error('Error getting trade history:', error);
    throw error;
  }
}
