import { z } from "zod";
import { Agent } from "../../agent"
import { type McpTool } from "../../types";
import {
    getAllPrices,
    getTokenPrices,
} from "../../tools/price-api"

export const GetAllPricesTool: McpTool = {
    name: "get_all_prices",
    description: "Get comprehensive market data including prices, market capitalization, 24h trading volume, and 24h price changes for all available tokens from the KiloLend price API (KAIA ecosystem tokens and major cryptocurrencies)",
    schema: {},
    handler: async (agent: Agent, input: Record<string, any>) => {
        const result = await getAllPrices();

        if (!result.success) {
            return {
                status: "error",
                message: (result as any).error
            };
        }

        // Each price object contains: symbol, price, percent_change_24h, market_cap, volume_24h, last_updated, timestamp
        return {
            status: "success",
            prices: result.prices,
            count: result.count,
            timestamp: new Date().toISOString()
        };
    },
};

export const GetMajorCryptoPricesTool: McpTool = {
    name: "get_major_crypto_prices",
    description: "Get comprehensive market data including prices, market capitalization, 24h trading volume, and 24h price changes for major cryptocurrencies (BTC, ETH)",
    schema: {},
    handler: async (agent: Agent, input: Record<string, any>) => {
        const result = await getTokenPrices();

        if (!result.success) {
            return {
                status: "error",
                message: (result as any).error
            };
        }

        const successResult = result as any;
        return {
            status: "success",
            prices: successResult.prices,
            count: successResult.count,
            category: successResult.category,
            timestamp: new Date().toISOString()
        };
    },
};