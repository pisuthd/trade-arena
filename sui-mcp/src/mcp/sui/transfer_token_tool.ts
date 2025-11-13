import { z } from "zod";
import { Agent } from "../../agent"
import { type McpTool } from "../../types";

export const TransferTokenTool: McpTool = {
    name: "sui_transfer_token",
    description: "Transfer tokens or SUI to another address",
    schema: {
        token_symbol: z.string().describe("The symbol of the token to transfer (e.g., 'SUI')"),
        to: z.string().describe("The recipient wallet address"),
        amount: z.number().positive().describe("The amount of tokens to transfer")
    },
    handler: async (agent: Agent, input: Record<string, any>) => {
        try {
            const result = await agent.transferToken(input.token_symbol, input.to, input.amount)
            return {
                message: `Successfully transferred ${input.amount} ${input.token_symbol} to ${input.to.substring(0, 10)}...`,
                ...result
            };
        } catch (error: any) {
            throw new Error(`Failed to transfer tokens: ${error.message}`)
        }
    }
};
