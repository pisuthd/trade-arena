/// DEX Pool - Uniswap 50/50 style Automated Market Maker (AMM)
/// 
/// This module implements a decentralized exchange pool following the Uniswap v2 constant product formula:
/// x * y = k, where x and y are the reserves of the two tokens in the pool.
/// 
/// Features:
/// - 50/50 liquidity provision with LP tokens (LSP - Liquidity Share Pool)
/// - Swapping between any two token types T1 and T2
/// - Liquidity addition and removal
/// - Configurable trading fees (basis points)
/// - Mathematical price calculation with slippage protection
/// 
/// The pool maintains a constant product k = reserve_token1 * reserve_token2, ensuring
/// that trades always maintain the pool's liquidity ratio while charging fees.
/// 
/// LP tokens represent a share of the pool's total liquidity and can be redeemed
/// for the underlying assets at any time.
module trade_arena::dex_pool {
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Supply, Balance};
    use std::u64;
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    const EZeroAmount: u64 = 0;
    const EWrongFee: u64 = 1;
    const EReservesEmpty: u64 = 2;
    const EPoolFull: u64 = 4;

    const FEE_SCALING: u128 = 10000;

    const MAX_POOL_VALUE: u64 = {
        18446744073709551615 / 10000
    };

    /// LP token representing a share of liquidity in a specific token pair pool
    public struct LSP<phantom P, phantom T1, phantom T2> has drop {}

    /// A pool containing two different token types for trading
    public struct Pool<phantom P, phantom T1, phantom T2> has key {
        id: UID,
        balance1: Balance<T1>,
        balance2: Balance<T2>,
        lsp_supply: Supply<LSP<P, T1, T2>>,
        fee_percent: u64
    }

    /// Create a new pool with two different tokens
    public fun create_pool<P: drop, T1, T2>(
        _: P,
        token1: Coin<T1>,
        token2: Coin<T2>,
        fee_percent: u64,
        ctx: &mut TxContext
    ): Coin<LSP<P, T1, T2>> {
        let amt1 = coin::value(&token1);
        let amt2 = coin::value(&token2);

        assert!(amt1 > 0 && amt2 > 0, EZeroAmount);
        assert!(amt1 < MAX_POOL_VALUE && amt2 < MAX_POOL_VALUE, EPoolFull);
        assert!(fee_percent >= 0 && fee_percent < 10000, EWrongFee);

        let share = u64::sqrt(amt1) * u64::sqrt(amt2);
        let mut lsp_supply = balance::create_supply(LSP<P, T1, T2> {});
        let lsp = balance::increase_supply(&mut lsp_supply, share);

        transfer::share_object(Pool {
            id: object::new(ctx),
            balance1: coin::into_balance(token1),
            balance2: coin::into_balance(token2),
            lsp_supply,
            fee_percent
        });

        coin::from_balance(lsp, ctx)
    }

    /// Entry function to swap token1 for token2
    public entry fun swap_token1_to_token2_<P, T1, T2>(
        pool: &mut Pool<P, T1, T2>, 
        token1: Coin<T1>, 
        ctx: &mut TxContext
    ) {
        transfer::public_transfer(
            swap_token1_to_token2(pool, token1, ctx),
            tx_context::sender(ctx)
        )
    }

    /// Swap token1 for token2
    public fun swap_token1_to_token2<P, T1, T2>(
        pool: &mut Pool<P, T1, T2>, 
        token1: Coin<T1>, 
        ctx: &mut TxContext
    ): Coin<T2> {
        assert!(coin::value(&token1) > 0, EZeroAmount);

        let token1_balance = coin::into_balance(token1);
        let (reserve1, reserve2, _) = get_amounts(pool);

        assert!(reserve1 > 0 && reserve2 > 0, EReservesEmpty);

        let output_amount = get_input_price(
            balance::value(&token1_balance),
            reserve1,
            reserve2,
            pool.fee_percent
        );

        balance::join(&mut pool.balance1, token1_balance);
        coin::take(&mut pool.balance2, output_amount, ctx)
    }

    /// Entry function to swap token2 for token1
    public entry fun swap_token2_to_token1_<P, T1, T2>(
        pool: &mut Pool<P, T1, T2>, 
        token2: Coin<T2>, 
        ctx: &mut TxContext
    ) {
        transfer::public_transfer(
            swap_token2_to_token1(pool, token2, ctx),
            tx_context::sender(ctx)
        )
    }

    /// Swap token2 for token1
    public fun swap_token2_to_token1<P, T1, T2>(
        pool: &mut Pool<P, T1, T2>, 
        token2: Coin<T2>, 
        ctx: &mut TxContext
    ): Coin<T1> {
        assert!(coin::value(&token2) > 0, EZeroAmount);

        let token2_balance = coin::into_balance(token2);
        let (reserve1, reserve2, _) = get_amounts(pool);

        assert!(reserve1 > 0 && reserve2 > 0, EReservesEmpty);

        let output_amount = get_input_price(
            balance::value(&token2_balance),
            reserve2,
            reserve1,
            pool.fee_percent
        );

        balance::join(&mut pool.balance2, token2_balance);
        coin::take(&mut pool.balance1, output_amount, ctx)
    }

    /// Entry function to add liquidity
    public entry fun add_liquidity_<P, T1, T2>(
        pool: &mut Pool<P, T1, T2>, 
        token1: Coin<T1>, 
        token2: Coin<T2>, 
        ctx: &mut TxContext
    ) {
        transfer::public_transfer(
            add_liquidity(pool, token1, token2, ctx),
            tx_context::sender(ctx)
        );
    }

    /// Add liquidity to the pool and receive LP tokens
    public fun add_liquidity<P, T1, T2>(
        pool: &mut Pool<P, T1, T2>, 
        token1: Coin<T1>, 
        token2: Coin<T2>, 
        ctx: &mut TxContext
    ): Coin<LSP<P, T1, T2>> {
        assert!(coin::value(&token1) > 0, EZeroAmount);
        assert!(coin::value(&token2) > 0, EZeroAmount);

        let token1_balance = coin::into_balance(token1);
        let token2_balance = coin::into_balance(token2);

        let (amount1, amount2, lsp_supply) = get_amounts(pool);

        let added1 = balance::value(&token1_balance);
        let added2 = balance::value(&token2_balance);
        let share_minted = u64::min(
            (added1 * lsp_supply) / amount1,
            (added2 * lsp_supply) / amount2
        );

        let amt1 = balance::join(&mut pool.balance1, token1_balance);
        let amt2 = balance::join(&mut pool.balance2, token2_balance);

        assert!(amt1 < MAX_POOL_VALUE, EPoolFull);
        assert!(amt2 < MAX_POOL_VALUE, EPoolFull);

        let balance = balance::increase_supply(&mut pool.lsp_supply, share_minted);
        coin::from_balance(balance, ctx)
    }

    /// Entry function to remove liquidity
    public entry fun remove_liquidity_<P, T1, T2>(
        pool: &mut Pool<P, T1, T2>,
        lsp: Coin<LSP<P, T1, T2>>,
        ctx: &mut TxContext
    ) {
        let (token1, token2) = remove_liquidity(pool, lsp, ctx);
        let sender = tx_context::sender(ctx);

        transfer::public_transfer(token1, sender);
        transfer::public_transfer(token2, sender);
    }

    /// Remove liquidity from the pool and receive both tokens
    public fun remove_liquidity<P, T1, T2>(
        pool: &mut Pool<P, T1, T2>,
        lsp: Coin<LSP<P, T1, T2>>,
        ctx: &mut TxContext
    ): (Coin<T1>, Coin<T2>) {
        let lsp_amount = coin::value(&lsp);

        assert!(lsp_amount > 0, EZeroAmount);

        let (amount1, amount2, lsp_supply) = get_amounts(pool);
        let removed1 = (amount1 * lsp_amount) / lsp_supply;
        let removed2 = (amount2 * lsp_amount) / lsp_supply;

        balance::decrease_supply(&mut pool.lsp_supply, coin::into_balance(lsp));

        (
            coin::take(&mut pool.balance1, removed1, ctx),
            coin::take(&mut pool.balance2, removed2, ctx)
        )
    }

    /// Get the price for swapping token1 to token2
    public fun token1_to_token2_price<P, T1, T2>(pool: &Pool<P, T1, T2>, to_sell: u64): u64 {
        let (amount1, amount2, _) = get_amounts(pool);
        get_input_price(to_sell, amount1, amount2, pool.fee_percent)
    }

    /// Get the price for swapping token2 to token1
    public fun token2_to_token1_price<P, T1, T2>(pool: &Pool<P, T1, T2>, to_sell: u64): u64 {
        let (amount1, amount2, _) = get_amounts(pool);
        get_input_price(to_sell, amount2, amount1, pool.fee_percent)
    }

    /// Get the current reserves and LP token supply
    public fun get_amounts<P, T1, T2>(pool: &Pool<P, T1, T2>): (u64, u64, u64) {
        (
            balance::value(&pool.balance1),
            balance::value(&pool.balance2),
            balance::supply_value(&pool.lsp_supply)
        )
    }

    /// Calculate output amount based on constant product formula with fees
    public fun get_input_price(
        input_amount: u64, input_reserve: u64, output_reserve: u64, fee_percent: u64
    ): u64 {
        let (
            input_amount,
            input_reserve,
            output_reserve,
            fee_percent
        ) = (
            (input_amount as u128),
            (input_reserve as u128),
            (output_reserve as u128),
            (fee_percent as u128)
        );

        let input_amount_with_fee = input_amount * (FEE_SCALING - fee_percent);
        let numerator = input_amount_with_fee * output_reserve;
        let denominator = (input_reserve * FEE_SCALING) + input_amount_with_fee;

        (numerator / denominator as u64)
    }

    #[test_only]
    public fun init_for_testing(_ctx: &mut TxContext) {
        // No initialization needed for this module
    }
}
