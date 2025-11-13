import { Agent } from "../../agent";
import { TransactionResponse } from "../../types";
import { Transaction } from "@mysten/sui/transactions";

export const transferCoin = async (
    agent: Agent,
    tokenSymbol: string,
    to: string,
    amount: number
): Promise<TransactionResponse> => {
    const client = agent.client;

    if (!agent.walletAddress) {
        throw new Error("Invalid wallet address")
    }

    if (!agent.wallet) {
        throw new Error("Signer is not provided")
    }

    // get metadata of all coins
    const balances = await client.getAllBalances({
        owner: agent.walletAddress,
    });
    const coins = await Promise.all(
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

    // get the coin metadata to transfer
    const coinMetadata = coins.find((coin) => coin.symbol === tokenSymbol);

    if (!coinMetadata) {
        throw new Error(`Token ${tokenSymbol} not found in wallet`);
    }

    // prepare transaction
    const txb = new Transaction();
    txb.setSender(agent.walletAddress);
    txb.setGasOwner(agent.walletAddress);

    // get the coin object
    const allCoins = await client.getCoins({
        owner: agent.walletAddress,
        coinType: coinMetadata.address,
    });
    const [mainCoin, ...restCoins] = allCoins.data;

    // check if the balance is enough
    const decimals = coinMetadata.decimals;
    const totalBalance = allCoins.data.reduce(
        (output, coin) => output + Number(coin.balance),
        0,
    );

    if (totalBalance / 10 ** decimals < amount) {
        throw new Error("Insufficient balance");
    }

    // split the coin
    const coinObjId =
        tokenSymbol === "SUI" ? txb.gas : mainCoin.coinObjectId;
    const [coin] = txb.splitCoins(coinObjId, [amount * 10 ** decimals]);

    // merge the coins
        if (restCoins.length > 0) {
            txb.mergeCoins(
                txb.object(mainCoin.coinObjectId),
                restCoins.map((coin) => txb.object(coin.coinObjectId)),
            );
        }

    txb.transferObjects([coin], to);

    // execute the transaction
    const txOutput = await client.signAndExecuteTransaction({
        signer: agent.wallet,
        transaction: txb,
    });

    // wait for the transaction to be executed
    const res = await client.waitForTransaction({
        digest: txOutput.digest,
        options: {
            showEffects: true,
        },
    });

    return {
        digest: txOutput.digest,
        status: res.effects?.status.status || "unknown",
    };
}
