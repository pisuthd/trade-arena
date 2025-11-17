import { DelegatedStake, getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";
import { SwapQuote, TokenBalance, TransactionResponse } from "../types";
import { getAllBalances } from "../tools/sui/balance";
import { transferCoin } from "../tools/sui/transfer_coin";
import { getSuiConfig } from "../config";
import { getTransactionByDigest, getRecentTransactions, getAccountInfo } from "../tools/transaction/management";
import { WalrusClient, WalrusConfig } from "../tools/walrus/client";

export class Agent {

    public client: SuiClient
    public wallet: Ed25519Keypair
    public walletAddress: string;
    public network: 'testnet' | 'mainnet'
    public walrusClient: WalrusClient

    constructor() {

        const config = getSuiConfig()

        this.client = new SuiClient({
            url: getFullnodeUrl(config.network)
        });

        this.network = config.network;

        // Initialize wallet using private key only
        this.wallet = Ed25519Keypair.fromSecretKey(config.privateKey);
        this.walletAddress = this.wallet.getPublicKey().toSuiAddress();

        // Initialize Walrus client
        const walrusConfig: WalrusConfig = {
            network: config.network,
            uploadRelayHost: config.walrusUploadRelayHost,
            maxTip: config.walrusMaxTip
        };
        this.walrusClient = new WalrusClient(this.wallet, walrusConfig);
    }

    async getWalletAddress(): Promise<string> {
        return this.walletAddress;
    }

    async getAllBalances(walletAddress: string | undefined): Promise<TokenBalance[]> {
        return getAllBalances(this, walletAddress || this.walletAddress)
    }

    async transferToken(
        tokenSymbol: string,
        to: string,
        amount: number,
    ): Promise<TransactionResponse> {
        return transferCoin(this, tokenSymbol, to, amount);
    }

    // Transaction Management Methods
    async getTransaction(digest: string) {
        return getTransactionByDigest(this, digest);
    }

    async getRecentTransactions(address?: string, limit?: number) {
        return getRecentTransactions(this, address || this.walletAddress, limit || 10);
    }

    async getAccountInfo(address?: string) {
        return getAccountInfo(this, address || this.walletAddress);
    }

    // Walrus Methods
    async storeTradeData(tradeData: any, epochs?: number): Promise<string> {
        return this.walrusClient.storeTradeData(tradeData, epochs);
    }

    async getTradeData(blobId: string): Promise<any> {
        return this.walrusClient.getTradeData(blobId);
    }
 
    async signAndExecuteTransaction(tx: Transaction) {
        const result = await this.client.signAndExecuteTransaction({
            signer: this.wallet,
            transaction: tx,
            options: {
                showEffects: true,
                showEvents: true,
                showObjectChanges: true
            }
        });
        return result;
    }

}
