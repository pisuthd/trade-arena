import { Transaction } from '@mysten/sui/transactions';
import { Agent } from '../../agent';
import { FaucetParams, TransactionResult } from '../../types';

/**
 * Mint MOCK_USDC tokens using the faucet
 */
export async function mintMockUsdc(
  agent: Agent,
  params: FaucetParams
): Promise<TransactionResult> {
  try {
    if (!params.usdcGlobalId) {
      throw new Error('USDC Global ID is required for minting MOCK_USDC');
    }

    const tx = new Transaction();
    
    // Call the mint function
    tx.moveCall({
      target: `${params.packageId}::mock_usdc::mint`,
      arguments: [
        tx.object(params.usdcGlobalId),
        tx.pure.u64(params.amount),
        tx.pure.address(params.recipient)
      ]
    });

    const result = await agent.signAndExecuteTransaction(tx);
    
    return {
      status: 'success',
      digest: result.digest,
      message: `Successfully minted ${params.amount} MOCK_USDC for ${params.recipient}`
    };
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      message: `Failed to mint MOCK_USDC: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Mint MOCK_BTC tokens using the faucet
 */
export async function mintMockBtc(
  agent: Agent,
  params: FaucetParams
): Promise<TransactionResult> {
  try {
    if (!params.btcGlobalId) {
      throw new Error('BTC Global ID is required for minting MOCK_BTC');
    }

    const tx = new Transaction();
    
    // Call the mint function
    tx.moveCall({
      target: `${params.packageId}::mock_btc::mint`,
      arguments: [
        tx.object(params.btcGlobalId),
        tx.pure.u64(params.amount),
        tx.pure.address(params.recipient)
      ]
    });

    const result = await agent.signAndExecuteTransaction(tx);
    
    return {
      status: 'success',
      digest: result.digest,
      message: `Successfully minted ${params.amount} MOCK_BTC for ${params.recipient}`
    };
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      message: `Failed to mint MOCK_BTC: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Get token balance for a specific address
 */
export async function getTokenBalance(
  agent: Agent,
  tokenType: string,
  address: string
): Promise<{ balance: string; error?: string }> {
  try {
    const balance = await agent.client.getBalance({
      owner: address,
      coinType: tokenType
    });
    
    return {
      balance: balance.totalBalance
    };
  } catch (error) {
    return {
      balance: '0',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
