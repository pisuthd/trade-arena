import { z } from "zod";
import { Agent } from "../../agent"
import { type McpTool } from "../../types";

export const GetAllTokenBalancesTool: McpTool = {
    name: "sui_get_all_token_balances",
    description: "Get all token balances for an account on Sui.",
    schema: {
        walletAddress: z.string().optional().describe("The wallet address to check the token balances for. If omitted, the tool will return the token balances of the connected account.")
    },
    handler: async (agent: Agent, input: Record<string, any>) => {
        const result = await agent.getAllBalances(input?.walletAddress)
        return {
            status: "success",
            balances: result
        };
    },
}
