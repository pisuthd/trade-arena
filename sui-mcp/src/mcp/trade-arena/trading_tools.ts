import { z } from "zod";
import { Agent } from '../../agent';
import { executeLongTrade, executeShortTrade, getVaultBalance, getTradeHistory } from '../../tools/trade-arena/trading';
import { getSuiConfig } from '../../config';
import { type McpTool } from '../../types';

// Helper function to truncate reasoning to 100 characters
const truncateReasoning = (reasoning: string): string => {
  if (reasoning.length <= 100) return reasoning;
  return reasoning.substring(0, 97) + '...';
};

// AI Execute Long Trade Tool
export const tradeArenaAiExecuteLongTool: McpTool = {
  name: 'trade_arena_ai_execute_long',
  description: 'Execute a LONG trade (USDC → BTC) in Trade Arena AI trading competition',
  schema: {
    season_number: z.number().min(1).describe("The season number to execute the trade in"),
    ai_model: z.string().describe("The AI model name executing the trade"),
    usdc_amount: z.number().positive().describe("Amount of USDC to use for the trade (in smallest units, e.g., 100000000 for 100 USDC)"),
    short_reasoning: z.string().max(100).describe("Short AI reasoning summary for executing this trade (max 100 characters)"),
    confidence: z.number().min(0).max(100).describe("Confidence level (0-100) for this trade"),
    walrus_blob_id: z.string().describe("Walrus blob ID containing the trade data (hex string)")
  },
  handler: async (agent: Agent, input: Record<string, any>) => {
    const config = getSuiConfig();
    
    if (!config.tradeArena) {
      throw new Error('Trade Arena configuration not found. Please provide trade arena configuration.');
    }

    const params = {
      seasonGlobalId: config.tradeArena.seasonGlobalId,
      seasonNumber: input.season_number,
      aiModel: input.ai_model,
      dexGlobalId: config.tradeArena.dexGlobalId,
      usdcAmount: input.usdc_amount,
      shortReasoning: truncateReasoning(input.short_reasoning),
      confidence: input.confidence,
      walrusBlobId: input.walrus_blob_id,
      packageId: config.tradeArena.packageId
    };

    const result = await executeLongTrade(agent, params);
    
    return {
      success: result.status === 'success',
      transaction_digest: result.digest,
      error: result.error,
      message: result.status === 'success' 
        ? `LONG trade executed successfully for ${input.ai_model} in season ${input.season_number}`
        : `Failed to execute LONG trade: ${result.error}`
    };
  }
};

// AI Execute Short Trade Tool
export const tradeArenaAiExecuteShortTool: McpTool = {
  name: 'trade_arena_ai_execute_short',
  description: 'Execute a SHORT trade (BTC → USDC) in Trade Arena AI trading competition',
  schema: {
    season_number: z.number().min(1).describe("The season number to execute the trade in"),
    ai_model: z.string().describe("The AI model name executing the trade"),
    btc_amount: z.number().positive().describe("Amount of BTC to use for the trade (in smallest units)"),
    short_reasoning: z.string().max(100).describe("Short AI reasoning summary for executing this trade (max 100 characters)"),
    confidence: z.number().min(0).max(100).describe("Confidence level (0-100) for this trade"),
    walrus_blob_id: z.string().describe("Walrus blob ID containing the trade data (hex string)")
  },
  handler: async (agent: Agent, input: Record<string, any>) => {
    const config = getSuiConfig();
    
    if (!config.tradeArena) {
      throw new Error('Trade Arena configuration not found. Please provide trade arena configuration.');
    }

    const params = {
      seasonGlobalId: config.tradeArena.seasonGlobalId,
      seasonNumber: input.season_number,
      aiModel: input.ai_model,
      dexGlobalId: config.tradeArena.dexGlobalId,
      usdcAmount: 0, // Not used for short trades but required by interface
      btcAmount: input.btc_amount,
      shortReasoning: truncateReasoning(input.short_reasoning),
      confidence: input.confidence,
      walrusBlobId: input.walrus_blob_id,
      packageId: config.tradeArena.packageId
    };

    const result = await executeShortTrade(agent, params);
    
    return {
      success: result.status === 'success',
      transaction_digest: result.digest,
      error: result.error,
      message: result.status === 'success' 
        ? `SHORT trade executed successfully for ${input.ai_model} in season ${input.season_number}`
        : `Failed to execute SHORT trade: ${result.error}`
    };
  }
};

// Get Vault Balance Tool
export const tradeArenaGetVaultBalanceTool: McpTool = {
  name: 'trade_arena_get_vault_balance',
  description: 'Get the current balance of an AI vault for a specific season',
  schema: {
    season_number: z.number().min(1).describe("The season number to get vault balance for"),
    ai_model: z.string().describe("The AI model name to get vault balance for")
  },
  handler: async (agent: Agent, input: Record<string, any>) => {
    const config = getSuiConfig();
    
    if (!config.tradeArena) {
      throw new Error('Trade Arena configuration not found. Please provide trade arena configuration.');
    }

    const params = {
      seasonGlobalId: config.tradeArena.seasonGlobalId,
      seasonNumber: input.season_number,
      aiModel: input.ai_model,
      packageId: config.tradeArena.packageId
    };

    try {
      const result = await getVaultBalance(agent, params);
      
      return {
        success: true,
        data: result,
        message: `Retrieved vault balance for ${input.ai_model} in season ${input.season_number}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: `Failed to get vault balance for ${input.ai_model} in season ${input.season_number}`
      };
    }
  }
};

// Get Trade History Tool
export const tradeArenaGetTradeHistoryTool: McpTool = {
  name: 'trade_arena_get_trade_history',
  description: 'Get the trade history for a specific season and AI model',
  schema: {
    season_number: z.number().min(1).describe("The season number to get trade history for"),
    ai_model: z.string().describe("The AI model name to get trade history for")
  },
  handler: async (agent: Agent, input: Record<string, any>) => {
    const config = getSuiConfig();
    
    if (!config.tradeArena) {
      throw new Error('Trade Arena configuration not found. Please provide trade arena configuration.');
    }

    const params = {
      seasonGlobalId: config.tradeArena.seasonGlobalId,
      seasonNumber: input.season_number,
      aiModel: input.ai_model,
      packageId: config.tradeArena.packageId
    };

    try {
      const result = await getTradeHistory(agent, params);
      
      return {
        success: true,
        data: result,
        message: `Retrieved trade history for ${input.ai_model} in season ${input.season_number}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: `Failed to get trade history for ${input.ai_model} in season ${input.season_number}`
      };
    }
  }
};
