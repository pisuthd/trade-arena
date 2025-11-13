import { z } from "zod";
import { Agent } from '../../agent';
import { mintMockUsdc, mintMockBtc, getTokenBalance } from '../../tools/trade-arena/faucet';
import { getSuiConfig } from '../../config';
import { type McpTool } from '../../types';

// Mint MOCK_USDC Tool
export const tradeArenaMintMockUsdcTool: McpTool = {
  name: 'trade_arena_mint_mock_usdc',
  description: 'Mint MOCK_USDC tokens using the faucet',
  schema: {
    amount: z.number().positive().describe("Amount of MOCK_USDC to mint (in smallest units, e.g., 100000000 for 100 USDC)"),
    recipient: z.string().describe("Recipient address to receive the tokens")
  },
  handler: async (agent: Agent, input: Record<string, any>) => {
    const config = getSuiConfig();

    if (!config.tradeArena) {
      throw new Error('Trade Arena configuration not found. Please provide trade arena configuration.');
    }

    const params = {
      usdcGlobalId: "0x1837c2490e780e27f3892ac5a30f241bd4081f80261815f2f381179176327fa1",
      packageId: config.tradeArena.packageId,
      amount: input.amount,
      recipient: input.recipient
    };

    const result = await mintMockUsdc(agent, params);

    return {
      success: result.status === 'success',
      transaction_digest: result.digest,
      error: result.error,
      message: result.message
    };
  }
};

// Mint MOCK_BTC Tool
export const tradeArenaMintMockBtcTool: McpTool = {
  name: 'trade_arena_mint_mock_btc',
  description: 'Mint MOCK_BTC tokens using the faucet',
  schema: {
    amount: z.number().positive().describe("Amount of MOCK_BTC to mint (in smallest units, e.g., 100000000 for 1 BTC)"),
    recipient: z.string().describe("Recipient address to receive the tokens")
  },
  handler: async (agent: Agent, input: Record<string, any>) => {
    const config = getSuiConfig();

    if (!config.tradeArena) {
      throw new Error('Trade Arena configuration not found. Please provide trade arena configuration.');
    }

    const params = {
      btcGlobalId: "0x632832dd0857cd6edbdcff08a93b6e74d73ef7dabddf7d973c705d3fa31c26db",
      packageId: config.tradeArena.packageId,
      amount: input.amount,
      recipient: input.recipient
    };

    const result = await mintMockBtc(agent, params);

    return {
      success: result.status === 'success',
      transaction_digest: result.digest,
      error: result.error,
      message: result.message
    };
  }
};

// Get Token Balance Tool
export const tradeArenaGetTokenBalanceTool: McpTool = {
  name: 'trade_arena_get_token_balance',
  description: 'Get token balance for a specific address',
  schema: {
    token_type: z.enum(['MOCK_USDC', 'MOCK_BTC']).describe("Token type (MOCK_USDC or MOCK_BTC)"),
    address: z.string().describe("Address to check balance for")
  },
  handler: async (agent: Agent, input: Record<string, any>) => {
    const config = getSuiConfig();

    if (!config.tradeArena) {
      throw new Error('Trade Arena configuration not found. Please provide trade arena configuration.');
    }

    const tokenType = input.token_type === 'MOCK_USDC'
      ? config.tradeArena.usdcType
      : config.tradeArena.btcType;

    const result = await getTokenBalance(agent, tokenType, input.address);

    return {
      success: !result.error,
      data: {
        token_type: input.token_type,
        address: input.address,
        balance: result.balance,
        decimals: input.token_type === 'MOCK_USDC' ? 6 : 8
      },
      error: result.error,
      message: result.error
        ? `Failed to get balance: ${result.error}`
        : `Retrieved balance for ${input.token_type} at ${input.address}`
    };
  }
};
