import { z } from "zod";
import { Agent } from '../../agent';
import { getPoolInfo, getSwapQuote } from '../../tools/trade-arena/dex';
import { getSuiConfig } from '../../config';
import { type McpTool } from '../../types';

// Get Pool Info Tool
export const tradeArenaGetPoolInfoTool: McpTool = {
  name: 'trade_arena_get_pool_info',
  description: 'Get current DEX pool information including reserves and prices',
  schema: {},
  handler: async (agent: Agent, input: Record<string, any>) => {
    const config = getSuiConfig();
    
    if (!config.tradeArena) {
      throw new Error('Trade Arena configuration not found. Please provide trade arena configuration.');
    }

    const params = {
      dexGlobalId: config.tradeArena.dexGlobalId,
      packageId: config.tradeArena.packageId
    };

    try {
      const result = await getPoolInfo(agent, params);
      
      return {
        success: true,
        data: result,
        message: 'Retrieved DEX pool information successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to get pool information'
      };
    }
  }
};

// Get Swap Quote Tool
export const tradeArenaGetSwapQuoteTool: McpTool = {
  name: 'trade_arena_get_swap_quote',
  description: 'Get a swap quote without executing the trade',
  schema: {
    token_in: z.enum(['USDC', 'BTC']).describe("Input token symbol (USDC or BTC)"),
    token_out: z.enum(['USDC', 'BTC']).describe("Output token symbol (USDC or BTC)"),
    amount_in: z.number().positive().describe("Amount of input tokens (in smallest units)")
  },
  handler: async (agent: Agent, input: Record<string, any>) => {
    const config = getSuiConfig();
    
    if (!config.tradeArena) {
      throw new Error('Trade Arena configuration not found. Please provide trade arena configuration.');
    }

    if (input.token_in === input.token_out) {
      throw new Error('Input and output tokens must be different');
    }

    const params = {
      dexGlobalId: config.tradeArena.dexGlobalId,
      tokenIn: input.token_in,
      tokenOut: input.token_out,
      amountIn: input.amount_in,
      packageId: config.tradeArena.packageId
    };

    try {
      const result = await getSwapQuote(agent, params);
      
      return {
        success: true,
        data: result,
        message: `Generated swap quote for ${input.amount_in} ${input.token_in} → ${input.token_out}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: `Failed to get swap quote for ${input.token_in} → ${input.token_out}`
      };
    }
  }
};

// Note: add_liquidity tool removed as it's not needed for AI trading
