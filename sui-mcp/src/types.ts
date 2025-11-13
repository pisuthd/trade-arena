

export interface SuiConfig {
    privateKey: string;
    network: 'testnet';
}

export interface McpTool {
    name: string;
    description: string;
    schema: any;
    handler: any;
}

export interface TokenBalance {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    balance: string;
}

export interface TransactionResponse {
    digest?: string;
    status: string;
}

export interface SwapQuote {
    fromToken: string;
    toToken: string;
    inputAmount: number;
    estimatedOutput: number;
}
