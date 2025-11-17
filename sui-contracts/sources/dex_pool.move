/// DEX Pool - Uniswap 50/50 style AMM
/// 
/// This module implements a decentralized exchange pool following constant product AMM principles:
/// Uses the standard x * y = k formula for fair and efficient trading.
///  
/// Features:
/// - Liquidity provision with LP tokens (LSP - Liquidity Share Pool)
/// - Swapping between any two token types T1 and T2
/// - Liquidity addition and removal
/// - Configurable trading fees (basis points)
/// - Global pool management with admin controls
/// - Standard 50/50 constant product formula
/// 
/// The pool maintains a constant product (x * y = k), ensuring
/// that trades always maintain the pool's liquidity while charging fees.
/// 
/// LP tokens represent a share of the pool's total liquidity and can be redeemed
/// for the underlying assets at any time.

module trade_arena::dex_pool {

    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Supply, Balance};
    use std::{u64};
    use sui::object::{Self, ID, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::bag::{Self, Bag};
    use sui::event::emit; 
    use std::string::{Self, String}; 
    use std::type_name::{get, into_string};
    use std::ascii::into_bytes; 
     

    const EZeroAmount: u64 = 0;
    const EWrongFee: u64 = 1;
    const EReservesEmpty: u64 = 2;
    const ENotRegistered: u64 = 3;
    const EPaused: u64 = 4;
    const ESameCoin: u64 = 5;
    const ENotOrder: u64 = 6;

    const FEE_SCALING: u128 = 10000;

    /// LP token representing a share of liquidity in a specific token pair pool
    public struct LSP<phantom T1, phantom T2> has drop {}

    /// A pool containing two different token types for trading
    public struct Pool<phantom T1, phantom T2> has store {
        global: ID,
        coin_x: Balance<T1>,
        coin_y: Balance<T2>,
        lp_supply: Supply<LSP<T1, T2>>,
        min_liquidity: Balance<LSP<T1, T2>>,
        fee_percent: u64,
        has_paused: bool
    }

    /// Global DEX management system
    public struct DEXGlobal has key {
        id: UID,
        pools: Bag,           // Collection of all pools
        treasury: address      // Address where fees are collected
    }

    /// Admin capability for managing the DEX
    public struct ManagerCap has key {
        id: UID
    }

    // Events
    public struct RegisterPoolEvent has copy, drop {
        global: ID,
        pool_name: String,
        fee_percent: u64
    }

    public struct AddLiquidityEvent has copy, drop {
        global: ID,
        pool_name: String,
        lp_amount: u64
    }

    public struct RemoveLiquidityEvent has copy, drop {
        global: ID,
        pool_name: String,
        lp_amount: u64,
        coin_x_amount: u64,
        coin_y_amount: u64
    }

    public struct SwappedEvent has copy, drop {
        global: ID,
        pool_name: String,
        coin_in_amount: u64,
        coin_out_amount: u64
    }

    // ======== Initialization ========

    /// Initialize the DEX system
    fun init(ctx: &mut TxContext) {
        transfer::transfer(
            ManagerCap {id: object::new(ctx)},
            tx_context::sender(ctx)
        );

        let global = DEXGlobal {
            id: object::new(ctx),
            pools: bag::new(ctx),
            treasury: tx_context::sender(ctx)
        };

        transfer::share_object(global)
    }

    // ======== Admin Functions ========

    /// Register a new pool (admin only)
    public entry fun register_pool<T1, T2>(
        global: &mut DEXGlobal,
        _manager_cap: &ManagerCap,
        fee_percent: u64,
        ctx: &mut TxContext
    ) {
        assert!(fee_percent >= 0 && fee_percent < 10000, EWrongFee);

        let pool_name = generate_pool_name<T1, T2>();
        assert!(!bag::contains_with_type<String, Pool<T1, T2>>(&global.pools, pool_name), ENotRegistered);

        let lp_supply = balance::create_supply(LSP<T1, T2> {});

        bag::add(&mut global.pools, pool_name, Pool {
            global: object::uid_to_inner(&global.id),
            coin_x: balance::zero<T1>(),
            coin_y: balance::zero<T2>(),
            lp_supply,
            min_liquidity: balance::zero<LSP<T1, T2>>(),
            fee_percent,
            has_paused: false
        });

        emit(
            RegisterPoolEvent {
                global: object::id(global),
                pool_name,
                fee_percent
            }
        )
    }

    /// Update pool fee (admin only)
    public entry fun update_pool_fee<T1, T2>(
        global: &mut DEXGlobal,
        _manager_cap: &ManagerCap,
        fee_percent: u64
    ) {
        assert!(fee_percent >= 0 && fee_percent < 10000, EWrongFee);
        let pool = get_mut_pool<T1, T2>(global);
        pool.fee_percent = fee_percent;
    }


    /// Pause a pool (admin only)
    public entry fun pause_pool<T1, T2>(
        global: &mut DEXGlobal,
        _manager_cap: &ManagerCap
    ) {
        let pool = get_mut_pool<T1, T2>(global);
        pool.has_paused = true;
    }

    /// Resume a pool (admin only)
    public entry fun resume_pool<T1, T2>(
        global: &mut DEXGlobal,
        _manager_cap: &ManagerCap
    ) {
        let pool = get_mut_pool<T1, T2>(global);
        pool.has_paused = false;
    }

    /// Update treasury address (admin only)
    public entry fun update_treasury(
        global: &mut DEXGlobal,
        _manager_cap: &ManagerCap,
        treasury_address: address
    ) {
        global.treasury = treasury_address;
    }

    // ======== Public Functions ========

    /// Entry function to swap token X for token Y
    public entry fun swap_x_to_y<T1, T2>(
        global: &mut DEXGlobal,
        coin_in: Coin<T1>,
        ctx: &mut TxContext
    ) {
        let coin_out: Coin<T2> = swap_x_to_y_internal(global, coin_in, ctx);
        transfer::public_transfer(coin_out, tx_context::sender(ctx));
    }

    /// Swap token X for token Y
    public fun swap_x_to_y_internal<T1, T2>(
        global: &mut DEXGlobal,
        coin_in: Coin<T1>,
        ctx: &mut TxContext
    ): Coin<T2> {
        assert!(coin::value(&coin_in) > 0, EZeroAmount);

        let treasury_addr = global.treasury;
        let global_id = object::id(global);
        let pool = get_mut_pool<T1, T2>(global);
        assert!(!pool.has_paused, EPaused);

        let (reserve_x, reserve_y, _) = get_reserves(pool);
        assert!(reserve_x > 0 && reserve_y > 0, EReservesEmpty);

        let coin_in_value = coin::value(&coin_in);
        let pool_fee_percent = pool.fee_percent;
        
        let output_amount = get_input_price(
            coin_in_value,
            reserve_x,
            reserve_y,
            pool_fee_percent
        );

        let mut coin_in_balance = coin::into_balance(coin_in);
        
        // Calculate and send fee to treasury
        let fee_amount = (coin_in_value * pool_fee_percent) / 10000;
        if (fee_amount > 0) {
            let fee_coin = coin::from_balance(balance::split(&mut coin_in_balance, fee_amount), ctx);
            transfer::public_transfer(fee_coin, treasury_addr);
        };

        balance::join(&mut pool.coin_x, coin_in_balance);

        let pool_name = generate_pool_name<T1, T2>();
        emit(
            SwappedEvent {
                global: global_id,
                pool_name,
                coin_in_amount: coin_in_value,
                coin_out_amount: output_amount
            }
        );

        coin::take(&mut pool.coin_y, output_amount, ctx)
    }

    /// Entry function to swap token Y for token X
    public entry fun swap_y_to_x<T1, T2>(
        global: &mut DEXGlobal,
        coin_in: Coin<T2>,
        ctx: &mut TxContext
    ) {
        let coin_out: Coin<T1> = swap_y_to_x_internal(global, coin_in, ctx);
        transfer::public_transfer(coin_out, tx_context::sender(ctx));
    }

    /// Swap token Y for token X
    public fun swap_y_to_x_internal<T1, T2>(
        global: &mut DEXGlobal,
        coin_in: Coin<T2>,
        ctx: &mut TxContext
    ): Coin<T1> {
        assert!(coin::value(&coin_in) > 0, EZeroAmount);

        let treasury_addr = global.treasury;
        let global_id = object::id(global);
        let pool = get_mut_pool<T1, T2>(global);
        assert!(!pool.has_paused, EPaused);

        let (reserve_x, reserve_y, _) = get_reserves(pool);
        assert!(reserve_x > 0 && reserve_y > 0, EReservesEmpty);

        let coin_in_value = coin::value(&coin_in);
        let pool_fee_percent = pool.fee_percent;
        
        let output_amount = get_input_price(
            coin_in_value,
            reserve_y,
            reserve_x,
            pool_fee_percent
        );

        let mut coin_in_balance = coin::into_balance(coin_in);
        
        // Calculate and send fee to treasury
        let fee_amount = (coin_in_value * pool_fee_percent) / 10000;
        if (fee_amount > 0) {
            let fee_coin = coin::from_balance(balance::split(&mut coin_in_balance, fee_amount), ctx);
            transfer::public_transfer(fee_coin, treasury_addr);
        };

        balance::join(&mut pool.coin_y, coin_in_balance);

        let pool_name = generate_pool_name<T1, T2>();
        emit(
            SwappedEvent {
                global: global_id,
                pool_name,
                coin_in_amount: coin_in_value,
                coin_out_amount: output_amount
            }
        );

        coin::take(&mut pool.coin_x, output_amount, ctx)
    }

    /// Entry function to add liquidity
    public entry fun add_liquidity<T1, T2>(
        global: &mut DEXGlobal,
        coin_x: Coin<T1>,
        coin_y: Coin<T2>,
        ctx: &mut TxContext
    ) {
        let lp_tokens = add_liquidity_internal(global, coin_x, coin_y, ctx);
        transfer::public_transfer(lp_tokens, tx_context::sender(ctx));
    }

    /// Add liquidity to the pool and receive LP tokens
    public fun add_liquidity_internal<T1, T2>(
        global: &mut DEXGlobal,
        coin_x: Coin<T1>,
        coin_y: Coin<T2>,
        ctx: &mut TxContext
    ): Coin<LSP<T1, T2>> {
        assert!(coin::value(&coin_x) > 0 && coin::value(&coin_y) > 0, EZeroAmount);

        let global_id = object::id(global);
        let pool = get_mut_pool<T1, T2>(global);
        assert!(!pool.has_paused, EPaused);

        let coin_x_value = coin::value(&coin_x);
        let coin_y_value = coin::value(&coin_y);

        let (reserve_x, reserve_y, lp_supply) = get_reserves(pool);

        let (optimal_x, optimal_y) = if (reserve_x == 0 && reserve_y == 0) {
            (coin_x_value, coin_y_value)
        } else {
            calculate_optimal_amounts(
                coin_x_value,
                coin_y_value,
                reserve_x,
                reserve_y
            )
        };

        let mut coin_x_balance = coin::into_balance(coin_x);
        let mut coin_y_balance = coin::into_balance(coin_y);

        // Return excess coins
        if (optimal_x < coin_x_value) {
            let excess = coin_x_value - optimal_x;
            transfer::public_transfer(
                coin::from_balance(balance::split(&mut coin_x_balance, excess), ctx),
                tx_context::sender(ctx)
            );
        };
        if (optimal_y < coin_y_value) {
            let excess = coin_y_value - optimal_y;
            transfer::public_transfer(
                coin::from_balance(balance::split(&mut coin_y_balance, excess), ctx),
                tx_context::sender(ctx)
            );
        };

        balance::join(&mut pool.coin_x, coin_x_balance);
        balance::join(&mut pool.coin_y, coin_y_balance);

        let lp_amount = if (lp_supply == 0) {
            u64::sqrt(optimal_x) * u64::sqrt(optimal_y)
        } else {
            u64::min(
                (optimal_x * lp_supply) / reserve_x,
                (optimal_y * lp_supply) / reserve_y
            )
        };

        let balance = balance::increase_supply(&mut pool.lp_supply, lp_amount);

        let pool_name = generate_pool_name<T1, T2>();
        emit(
            AddLiquidityEvent {
                global: global_id,
                pool_name,
                lp_amount
            }
        );

        coin::from_balance(balance, ctx)
    }

    /// Entry function to remove liquidity
    public entry fun remove_liquidity<T1, T2>(
        global: &mut DEXGlobal,
        lp_tokens: Coin<LSP<T1, T2>>,
        ctx: &mut TxContext
    ) {
        let (coin_x, coin_y) = remove_liquidity_internal(global, lp_tokens, ctx);
        let sender = tx_context::sender(ctx);
        transfer::public_transfer(coin_x, sender);
        transfer::public_transfer(coin_y, sender);
    }

    /// Remove liquidity from the pool and receive both tokens
    public fun remove_liquidity_internal<T1, T2>(
        global: &mut DEXGlobal,
        lp_tokens: Coin<LSP<T1, T2>>,
        ctx: &mut TxContext
    ): (Coin<T1>, Coin<T2>) {
        let lp_amount = coin::value(&lp_tokens);
        assert!(lp_amount > 0, EZeroAmount);

        let global_id = object::id(global);
        let pool = get_mut_pool<T1, T2>(global);
        let (reserve_x, reserve_y, lp_supply) = get_reserves(pool);

        let removed_x = (reserve_x * lp_amount) / lp_supply;
        let removed_y = (reserve_y * lp_amount) / lp_supply;

        balance::decrease_supply(&mut pool.lp_supply, coin::into_balance(lp_tokens));

        let pool_name = generate_pool_name<T1, T2>();
        emit(
            RemoveLiquidityEvent {
                global: global_id,
                pool_name,
                lp_amount,
                coin_x_amount: removed_x,
                coin_y_amount: removed_y
            }
        );

        (
            coin::take(&mut pool.coin_x, removed_x, ctx),
            coin::take(&mut pool.coin_y, removed_y, ctx)
        )
    }

    // ======== Helper Functions ========

    /// Generate pool name from token types
    fun generate_pool_name<T1, T2>(): String {
        let mut lp_name = string::utf8(b"");
        string::append_utf8(&mut lp_name, b"LP-"); 
        string::append_utf8(&mut lp_name, into_bytes(into_string(get<T1>())));
        string::append_utf8(&mut lp_name, b"-");
        string::append_utf8(&mut lp_name, into_bytes(into_string(get<T2>())));

        lp_name
    }

    /// Get mutable pool reference
    fun get_mut_pool<T1, T2>(global: &mut DEXGlobal): &mut Pool<T1, T2> {
        let pool_name = generate_pool_name<T1, T2>();
        assert!(bag::contains_with_type<String, Pool<T1, T2>>(&global.pools, pool_name), ENotRegistered);
        bag::borrow_mut<String, Pool<T1, T2>>(&mut global.pools, pool_name)
    }

    /// Get current reserves and LP supply
    public fun get_reserves<T1, T2>(pool: &Pool<T1, T2>): (u64, u64, u64) {
        (
            balance::value(&pool.coin_x),
            balance::value(&pool.coin_y),
            balance::supply_value(&pool.lp_supply)
        )
    }

    /// Calculate optimal amounts for adding liquidity
    fun calculate_optimal_amounts(
        desired_x: u64,
        desired_y: u64,
        reserve_x: u64,
        reserve_y: u64
    ): (u64, u64) {
        // Calculate the optimal Y based on desired X and current ratio (50/50)
        let optimal_y = (desired_x * reserve_y) / reserve_x;
        
        if (optimal_y <= desired_y) {
            (desired_x, optimal_y)
        } else {
            // Calculate the optimal X based on desired Y
            let optimal_x = (desired_y * reserve_x) / reserve_y;
            (optimal_x, desired_y)
        }
    }


    /// Get the price for swapping X to Y
    public fun x_to_y_price<T1, T2>(global: &DEXGlobal, to_sell: u64): u64 {
        let pool_name = generate_pool_name<T1, T2>();
        let pool = bag::borrow<String, Pool<T1, T2>>(&global.pools, pool_name);
        let (reserve_x, reserve_y, _) = get_reserves(pool);
        get_input_price(
            to_sell,
            reserve_x,
            reserve_y,
            pool.fee_percent
        )
    }

    /// Get the price for swapping Y to X
    public fun y_to_x_price<T1, T2>(global: &DEXGlobal, to_sell: u64): u64 {
        let pool_name = generate_pool_name<T1, T2>();
        let pool = bag::borrow<String, Pool<T1, T2>>(&global.pools, pool_name);
        let (reserve_x, reserve_y, _) = get_reserves(pool);
        get_input_price(
            to_sell,
            reserve_y,
            reserve_x,
            pool.fee_percent
        )
    }

    /// Get pool information
    public fun get_pool_info<T1, T2>(global: &DEXGlobal): (u64, u64, u64, u64, bool) {
        let pool_name = generate_pool_name<T1, T2>();
        let pool = bag::borrow<String, Pool<T1, T2>>(&global.pools, pool_name);
        let (reserve_x, reserve_y, lp_supply) = get_reserves(pool);
        (reserve_x, reserve_y, lp_supply, pool.fee_percent, pool.has_paused)
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

    // ======== Test-related Functions =========


    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx);
    }

}