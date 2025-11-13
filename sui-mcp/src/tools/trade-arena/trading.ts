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
    const seasons = content.fields?.seasons || {};
    const seasonKey = params.seasonNumber.toString();
    const season = seasons[seasonKey];

    if (!season) {
      throw new Error(`Season ${params.seasonNumber} not found`);
    }

    const vault = season.fields?.ai_vault;
    if (!vault) {
      throw new Error('AI vault not found for this season');
    }

    // Get vault balances
    const usdcBalance = await agent.client.getBalance({
      owner: vault,
      coinType: '0xa51f1f51ae2e6aa8cc88a1221c4e9da644faccdcd87dde9d2858e042634d285f::mock_usdc::MOCK_USDC'
    });

    const btcBalance = await agent.client.getBalance({
      owner: vault,
      coinType: '0xa51f1f51ae2e6aa8cc88a1221c4e9da644faccdcd87dde9d2858e042634d285f::mock_btc::MOCK_BTC'
    });

    return {
      season_number: params.seasonNumber,
      vault_address: vault,
      usdc_balance: usdcBalance.totalBalance,
      btc_balance: btcBalance.totalBalance,
      total_value_usdc: usdcBalance.totalBalance // Add BTC value calculation
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
    const seasons = content.fields?.seasons || {};
    const seasonKey = params.seasonNumber.toString();
    const season = seasons[seasonKey];

    if (!season) {
      throw new Error(`Season ${params.seasonNumber} not found`);
    }

    const tradeHistory = season.fields?.trade_history || [];

    // Format trade history
    const formattedHistory = tradeHistory.map((trade: any) => ({
      timestamp: trade.fields?.timestamp,
      ai_model: trade.fields?.ai_model,
      action: trade.fields?.action,
      usdc_amount: trade.fields?.usdc_amount,
      btc_amount: trade.fields?.btc_amount,
      entry_price: trade.fields?.entry_price,
      reasoning: trade.fields?.reasoning,
      confidence: trade.fields?.confidence,
      walrus_blob_id: trade.fields?.walrus_blob_id ? 
        Buffer.from(trade.fields.walrus_blob_id).toString('hex') : null
    }));

    return {
      season_number: params.seasonNumber,
      total_trades: formattedHistory.length,
      trades: formattedHistory
    };

  } catch (error) {
    console.error('Error getting trade history:', error);
    throw error;
  }
}
