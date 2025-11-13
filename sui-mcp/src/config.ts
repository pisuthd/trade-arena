#!/usr/bin/env node

import { SuiConfig } from './types';

const getArgs = () =>
    process.argv.reduce((args: any, arg: any) => {
        // long arg
        if (arg.slice(0, 2) === "--") {
            const longArg = arg.split("=");
            const longArgFlag = longArg[0].slice(2);
            const longArgValue = longArg.length > 1 ? longArg[1] : true;
            args[longArgFlag] = longArgValue;
        }
        // flags
        else if (arg[0] === "-") {
            const flags = arg.slice(1).split("");
            flags.forEach((flag: any) => {
                args[flag] = true;
            });
        }
        return args;
    }, {});

export function validateEnvironment(): void {
    const args = getArgs();

    // Check if private key is provided
    const hasPrivateKey = !!(args?.sui_private_key);

    if (!hasPrivateKey) {
        throw new Error(
            'Missing required environment variable: SUI_PRIVATE_KEY must be provided'
        );
    }

}

export function getSuiConfig(): SuiConfig {
    validateEnvironment();

    const args = getArgs();

    const currentEnv = {
        SUI_PRIVATE_KEY: args?.sui_private_key
    };

    return {
        privateKey: currentEnv.SUI_PRIVATE_KEY!,
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
