import { z } from "zod";
import { Agent } from '../../agent';
import { getSuiConfig } from '../../config';
import { type McpTool } from '../../types';

// Store Trade Data on Walrus Tool
export const tradeArenaWalrusStoreTool: McpTool = {
  name: 'trade_arena_walrus_store',
  description: 'Store trade data on Walrus for permanent verification and transparency',
  schema: {
    ai_model: z.string().describe("The AI model name"),
    action: z.string().describe("The trading action (LONG/SHORT)"),
    pair: z.string().describe("The trading pair (e.g., BTC/USDC)"),
    usdc_amount: z.number().describe("Amount of USDC involved in the trade"),
    btc_amount: z.number().describe("Amount of BTC involved in the trade"),
    entry_price: z.number().describe("Entry price in USDC per BTC (scaled by 1e6)"),
    reasoning: z.string().describe("The AI reasoning for the trade"),
    confidence: z.number().min(0).max(100).describe("Confidence level (0-100)"),
    season_number: z.number().describe("The season number"),
    market_snapshot: z.string().optional().describe("Optional market snapshot data as JSON string"),
    epochs: z.number().min(1).default(2).describe("Number of epochs to store data (default: 2)")
  },
  handler: async (agent: Agent, input: Record<string, any>) => {
    try {
      // Build trade data object with auto-generated timestamp
      const tradeData = {
        timestamp: Math.floor(Date.now() / 1000), // Unix timestamp in seconds
        ai_model: input.ai_model,
        action: input.action,
        pair: input.pair,
        usdc_amount: input.usdc_amount,
        btc_amount: input.btc_amount,
        entry_price: input.entry_price,
        reasoning: input.reasoning,
        confidence: input.confidence,
        season_number: input.season_number,
        market_snapshot: input.market_snapshot ? JSON.parse(input.market_snapshot) : undefined
      };

      const blobId = await agent.storeTradeData(tradeData, input.epochs);

      return {
        success: true,
        data: {
          blob_id: blobId,
          epochs: input.epochs,
          trade_data: tradeData
        },
        message: `Trade data stored successfully on Walrus with blob ID: ${blobId}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to store trade data on Walrus'
      };
    }
  }
};

// Get Trade Data from Walrus Tool
export const tradeArenaWalrusRetrieveTool: McpTool = {
  name: 'trade_arena_walrus_retrieve',
  description: 'Retrieve trade data from Walrus using blob ID',
  schema: {
    blob_id: z.string().describe("Walrus blob ID to retrieve trade data from")
  },
  handler: async (agent: Agent, input: Record<string, any>) => {
    try {
      const tradeData = await agent.getTradeData(input.blob_id);

      return {
        success: true,
        data: {
          blob_id: input.blob_id,
          trade_data: tradeData
        },
        message: `Trade data retrieved successfully from Walrus blob: ${input.blob_id}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: `Failed to retrieve trade data from Walrus blob: ${input.blob_id}`
      };
    }
  }
};
