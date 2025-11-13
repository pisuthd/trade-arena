import { SuiConfig } from './types';

export function validateEnvironment(): void {

    const privateKey = process.env.SUI_PRIVATE_KEY;

    if (!privateKey) {
        throw new Error(
            'Missing required environment variable: SUI_PRIVATE_KEY must be provided\n' +
            'Please set SUI_PRIVATE_KEY in your .env file'
        );
    }
 
}

export function getSuiConfig(): SuiConfig {
    
    validateEnvironment();

    const privateKey = process.env.SUI_PRIVATE_KEY!;

    return {
        privateKey,
        network: 'testnet',
        walrusUploadRelayHost: 'https://walrus-testnet.walrus.ai',
        walrusMaxTip: 10000000,
        tradeArena: {
            seasonGlobalId: "0x323afc98c387c70f9bc8528d7355aa7e520c352778c2406f15962f6e064bb9da",
            dexGlobalId: "0xe01a60f171b371a10141476fe421c566bb21d52f1924797fcd44a07d9e9d355b",
            usdcType: "0xa51f1f51ae2e6aa8cc88a1221c4e9da644faccdcd87dde9d2858e042634d285f::mock_usdc::MOCK_USDC",
            btcType: "0xa51f1f51ae2e6aa8cc88a1221c4e9da644faccdcd87dde9d2858e042634d285f::mock_btc::MOCK_BTC",
            packageId: "0xa51f1f51ae2e6aa8cc88a1221c4e9da644faccdcd87dde9d2858e042634d285f"
        }
    };
}
