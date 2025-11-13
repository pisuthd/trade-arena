import { Agent } from "../../agent"
import { TokenBalance } from "../../types"

// get all balances by the SDK
export const getAllBalances = async (agent: Agent, walletAddress: string): Promise<TokenBalance[]> => {
    const client = agent.client;
    const balances = await client.getAllBalances({
        owner: walletAddress
    });

    const result = await Promise.all(
        balances.map(async (balance) => {
            const metadata = await client.getCoinMetadata({
                coinType: balance.coinType,
            });
            return {
                address: balance.coinType,
                name: metadata?.name || "",
                symbol: metadata?.symbol || "",
                decimals: metadata?.decimals || 0,
                balance: (
                    Number(balance.totalBalance) /
                    10 ** (metadata?.decimals || 0)
                ).toString(),
            };
        }),
    );

    return result
}
