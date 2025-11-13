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
    console.error("pool data :", content)

    // The object is a dynamic_field::Field, so we need to access fields.value.fields
    if (!content?.fields?.value?.fields) {
      throw new Error('DEX pool object not found or has no content');
    }

    const poolData = content.fields.value.fields;
    const poolName = content.fields.name || 'UNKNOWN_POOL';

    // Extract reserves directly (they are string values)
    const usdcReserveRaw = Number(poolData.coin_x || '0');
    const btcReserveRaw = Number(poolData.coin_y || '0');
    
    // Extract LP supply from nested structure
    const lpSupply = Number(poolData.lp_supply?.fields?.value || '0');
    
    // Extract other fields
    const feePercent = Number(poolData.fee_percent || '3'); // Default 0.3%
    const hasPaused = poolData.has_paused || false;

    // Adjust for decimal places (USDC: 6 decimals, BTC: 8 decimals)
    const USDC_DECIMALS = 6;
    const BTC_DECIMALS = 8;
    
    const usdcReserve = usdcReserveRaw / Math.pow(10, USDC_DECIMALS);
    const btcReserve = btcReserveRaw / Math.pow(10, BTC_DECIMALS);

    // Calculate current prices with proper decimal adjustment
    // BTC per USDC: (USDC amount / 10^6) / (BTC amount / 10^8) = (USDC * 10^2) / BTC
    const btcPerUsdc = btcReserve > 0 ? (usdcReserveRaw * Math.pow(10, BTC_DECIMALS - USDC_DECIMALS)) / btcReserveRaw : 0;
    
    // USDC per BTC: (BTC amount / 10^8) / (USDC amount / 10^6) = (BTC / 10^2) / USDC
    const usdcPerBtc = usdcReserve > 0 ? (btcReserveRaw / Math.pow(10, BTC_DECIMALS - USDC_DECIMALS)) / usdcReserveRaw : 0;

    return {
      pool_address: params.dexGlobalId,
      pool_name: poolName,
      usdc_reserve: usdcReserveRaw,
      btc_reserve: btcReserveRaw,
      usdc_reserve_adjusted: usdcReserve,
      btc_reserve_adjusted: btcReserve,
      lp_supply: lpSupply,
      fee_percentage: feePercent / 1000, // Convert basis points to percentage
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

    // Use raw reserves for calculations (as they're in the same units as input amounts)
    const usdcReserve = poolInfo.usdc_reserve;
    const btcReserve = poolInfo.btc_reserve;
    const feePercent = poolInfo.fee_percentage; 

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
  // AMM formula: output = (input_amount * output_reserve * fee_multiplier) / (input_reserve + input_amount * fee_multiplier)
  // where fee_multiplier = (10000 - fee_basis_points) / 10000
  const FEE_SCALING = 10000;
  const feeBasisPoints = feePercent * 10000; // Convert percentage to basis points
  const feeMultiplier = (FEE_SCALING - feeBasisPoints) / FEE_SCALING;
  
  const inputAmountWithFee = inputAmount * feeMultiplier;
  const numerator = inputAmountWithFee * outputReserve;
  const denominator = inputReserve + inputAmountWithFee;
  
  return Math.floor(numerator / denominator);
}

// Note: addLiquidity function removed as it's not needed for AI trading
