import { z } from "zod";
import { Agent } from "../../agent";
import { type McpTool } from "../../types";
import { getTransactionByDigest, getRecentTransactions, getAccountInfo } from "../../tools/transaction/management";

export const GetTransactionTool: McpTool = {
    name: "sui_get_transaction",
    description: "Get detailed information about a transaction by its digest.",
    schema: {
        digest: z.string().describe("Transaction digest to look up")
    },
    handler: async (agent: Agent, input: Record<string, any>) => {
        try {
            const transaction = await getTransactionByDigest(agent, input.digest);
            if (!transaction) {
                return {
                    status: "error",
                    message: "Transaction not found"
                };
            }
            return {
                status: "success",
                transaction: transaction
            };
        } catch (error: any) {
            return {
                status: "error",
                message: error.message
            };
        }
    }
};

export const GetRecentTransactionsTool: McpTool = {
    name: "sui_get_recent_transactions",
    description: "Get recent transactions for an address with detailed information.",
    schema: {
        address: z.string().optional().describe("Address to get transactions for. If omitted, uses connected wallet."),
        limit: z.number().min(1).max(100).optional().default(10).describe("Number of transactions to fetch (1-100)")
    },
    handler: async (agent: Agent, input: Record<string, any>) => {
        try {
            const address = input?.address || agent.walletAddress;
            const limit = input?.limit || 10;
            const transactions = await getRecentTransactions(agent, address, limit);
            return {
                status: "success",
                transactions: transactions,
                count: transactions.length
            };
        } catch (error: any) {
            return {
                status: "error",
                message: error.message
            };
        }
    }
};

export const GetAccountInfoTool: McpTool = {
    name: "sui_get_account_info",
    description: "Get comprehensive account information including balance, object count, and transaction history.",
    schema: {
        address: z.string().optional().describe("Address to get info for. If omitted, uses connected wallet.")
    },
    handler: async (agent: Agent, input: Record<string, any>) => {
        try {
            const address = input?.address || agent.walletAddress;
            const accountInfo = await getAccountInfo(agent, address);
            if (!accountInfo) {
                return {
                    status: "error",
                    message: "Could not fetch account information"
                };
            }
            return {
                status: "success",
                accountInfo: accountInfo
            };
        } catch (error: any) {
            return {
                status: "error",
                message: error.message
            };
        }
    }
};
