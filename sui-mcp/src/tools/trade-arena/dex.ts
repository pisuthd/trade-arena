import { Agent } from '../../agent';
import { TransactionResponse } from '../../types';
import { Transaction } from '@mysten/sui/transactions';

export interface PoolInfoParams {
  dexGlobalId: string;
  packageId: string;
}

export interface SwapQuoteParams {
  dexGlobalId: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: number;
  packageId: string;
}

export async function getPoolInfo(
  agent: Agent,
  params: PoolInfoParams
): Promise<any> {
  try {

    const result = await agent.client.getObject({
      id: "0x245c85c4496f6278d0a0d4622265b64ff3c43a25491c6dd49410276b0aa6af04",
      options: {
        showContent: true,
        showType: true,
      }
    });

    if (!result.data?.content) {
      throw new Error('DEX pool object not found or has no content');
    }

    const content = result.data.content as any;
    const pool = content.fields || {};

    console.error("pool data :", pool)

    if (!pool) {
      throw new Error('USDC/BTC pool not found');
    }

    const poolFields = pool.fields || {};
    const usdcReserve = Number(poolFields.coin_x?.fields?.value || '0');
    const btcReserve = Number(poolFields.coin_y?.fields?.value || '0');
    const lpSupply = Number(poolFields.lp_supply?.fields?.value || '0');
    const feePercent = Number(poolFields.fee_percent || '30'); // Default 0.3% = 30 basis points
    const hasPaused = poolFields.has_paused || false;

    // Calculate current prices
    const btcPerUsdc = btcReserve > 0 ? usdcReserve / btcReserve : 0;
    const usdcPerBtc = usdcReserve > 0 ? btcReserve / usdcReserve : 0;

    return {
      pool_address: params.dexGlobalId,
      pool_name: "POOL_USDC_BTC",
      usdc_reserve: usdcReserve,
      btc_reserve: btcReserve,
      lp_supply: lpSupply,
      fee_percentage: feePercent / 100, // Convert basis points to percentage
      is_paused: hasPaused,
      btc_per_usdc: btcPerUsdc,
      usdc_per_btc: usdcPerBtc,
      total_liquidity_usdc: usdcReserve + (btcReserve * usdcPerBtc)
    };

  } catch (error) {
    console.error('Error getting pool info:', error);
    throw error;
  }
}

export async function getSwapQuote(
  agent: Agent,
  params: SwapQuoteParams
): Promise<any> {
  try {
    // Get current pool info
    const poolInfo = await getPoolInfo(agent, {
      dexGlobalId: params.dexGlobalId,
      packageId: params.packageId
    });

    if (poolInfo.is_paused) {
      throw new Error('Pool is currently paused');
    }

    const usdcReserve = poolInfo.usdc_reserve;
    const btcReserve = poolInfo.btc_reserve;
    const feePercent = poolInfo.fee_percentage / 100; // Convert to decimal

    let outputAmount: number;
    let priceImpact: number;

    if (params.tokenIn === 'USDC' && params.tokenOut === 'BTC') {
      // USDC to BTC swap using contract's get_input_price formula
      outputAmount = calculateOutputAmount(params.amountIn, usdcReserve, btcReserve, feePercent);
      const idealOutput = (params.amountIn * btcReserve) / usdcReserve;
      priceImpact = ((idealOutput - outputAmount) / idealOutput) * 100;
    } else if (params.tokenIn === 'BTC' && params.tokenOut === 'USDC') {
      // BTC to USDC swap
      outputAmount = calculateOutputAmount(params.amountIn, btcReserve, usdcReserve, feePercent);
      const idealOutput = (params.amountIn * usdcReserve) / btcReserve;
      priceImpact = ((idealOutput - outputAmount) / idealOutput) * 100;
    } else {
      throw new Error('Unsupported token pair. Only USDC/BTC swaps are supported.');
    }

    return {
      token_in: params.tokenIn,
      token_out: params.tokenOut,
      amount_in: params.amountIn,
      estimated_output: outputAmount,
      price_impact_percent: Math.abs(priceImpact),
      fee_amount: params.amountIn * feePercent,
      pool_info: poolInfo
    };

  } catch (error) {
    console.error('Error getting swap quote:', error);
    throw error;
  }
}

// Helper function to calculate output amount using constant product formula with fees
function calculateOutputAmount(
  inputAmount: number,
  inputReserve: number,
  outputReserve: number,
  feePercent: number
): number {
  const FEE_SCALING = 10000;
  const inputAmountWithFee = inputAmount * (FEE_SCALING - feePercent * 100);
  const numerator = inputAmountWithFee * outputReserve;
  const denominator = (inputReserve * FEE_SCALING) + inputAmountWithFee;
  
  return Math.floor(numerator / denominator);
}

// Note: addLiquidity function removed as it's not needed for AI trading
