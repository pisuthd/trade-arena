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
        network: 'testnet'
    };
}
