import { Agent } from "../../agent";

export interface TransactionDetails {
    digest: string;
    timestamp: string;
    success: boolean;
    gasUsed: string;
    effects: any;
    events: any[];
}

export interface AccountInfo {
    address: string;
    suiBalance: string;
    objectCount: number;
    txCount: number;
}

/**
 * Get detailed transaction information by digest
 * @param agent Sui agent instance
 * @param digest Transaction digest
 * @returns Transaction details
 */
export async function getTransactionByDigest(
    agent: Agent,
    digest: string
): Promise<TransactionDetails | null> {
    try {
        const txBlock = await agent.client.getTransactionBlock({
            digest,
            options: {
                showInput: true,
                showEffects: true,
                showEvents: true,
                showObjectChanges: true,
                showBalanceChanges: true,
            },
        });

        return {
            digest: txBlock.digest,
            timestamp: txBlock.timestampMs ? new Date(parseInt(txBlock.timestampMs)).toISOString() : "Unknown",
            success: txBlock.effects?.status?.status === "success",
            gasUsed: txBlock.effects?.gasUsed?.computationCost || "0",
            effects: txBlock.effects,
            events: txBlock.events || [],
        };
    } catch (error: any) {
        console.error("Get transaction failed:", error);
        return null;
    }
}

/**
 * Get recent transactions for an address
 * @param agent Sui agent instance
 * @param address Address to get transactions for
 * @param limit Number of transactions to fetch
 * @returns Array of transaction details
 */
export async function getRecentTransactions(
    agent: Agent,
    address: string,
    limit: number = 10
): Promise<TransactionDetails[]> {
    try {
        const txs = await agent.client.queryTransactionBlocks({
            filter: {
                FromOrToAddress: {
                    addr: address,
                },
            },
            limit,
            options: {
                showInput: true,
                showEffects: true,
                showEvents: true,
            },
        });

        return txs.data.map(tx => ({
            digest: tx.digest,
            timestamp: tx.timestampMs ? new Date(parseInt(tx.timestampMs)).toISOString() : "Unknown",
            success: tx.effects?.status?.status === "success",
            gasUsed: tx.effects?.gasUsed?.computationCost || "0",
            effects: tx.effects,
            events: tx.events || [],
        }));
    } catch (error: any) {
        console.error("Get recent transactions failed:", error);
        return [];
    }
}

/**
 * Get comprehensive account information
 * @param agent Sui agent instance
 * @param address Address to get info for
 * @returns Account information
 */
export async function getAccountInfo(
    agent: Agent,
    address: string
): Promise<AccountInfo | null> {
    try {
        // Get SUI balance
        const balance = await agent.client.getBalance({
            owner: address,
            coinType: "0x2::sui::SUI",
        });

        // Get owned objects count
        const objects = await agent.client.getOwnedObjects({
            owner: address,
            options: {
                showType: true,
            },
        });

        // Get transaction count (approximate from recent transactions)
        const recentTxs = await agent.client.queryTransactionBlocks({
            filter: {
                FromOrToAddress: {
                    addr: address,
                },
            },
            limit: 1000, // Get more to estimate total
        });

        return {
            address,
            suiBalance: (parseInt(balance.totalBalance) / 1e9).toFixed(9), // Convert from MIST to SUI
            objectCount: objects.data.length,
            txCount: recentTxs.data.length,
        };
    } catch (error: any) {
        console.error("Get account info failed:", error);
        return null;
    }
}

/**
 * Simulate a transaction without executing it
 * @param agent Sui agent instance
 * @param txBytes Transaction bytes to simulate
 * @returns Simulation result
 */
export async function simulateTransaction(
    agent: Agent,
    txBytes: Uint8Array
): Promise<any> {
    try {
        const result = await agent.client.dryRunTransactionBlock({
            transactionBlock: txBytes,
        });

        return {
            effects: result.effects,
            events: result.events,
            balanceChanges: result.balanceChanges,
            objectChanges: result.objectChanges,
        };
    } catch (error: any) {
        console.error("Simulate transaction failed:", error);
        throw new Error(`Simulation failed: ${error.message}`);
    }
}
