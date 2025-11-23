/// Trade Arena - AI Trading Competition Season Manager
/// 
/// This contract manages seasons where multiple AI models compete in trading.
/// Users can deposit USDC into AI vaults during pre-season, then watch them compete.
/// 
/// Key Features:
/// - Season-based competition (Pre-season → Active → Post-season)
/// - LP share system for proportional ownership
/// - Multi-token support (USDC + BTC)
/// - AI wallet authorization
/// - Walrus blob ID storage for trade verification
/// - Emergency withdrawal capabilities

module trade_arena::season_manager {

    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance, Supply};
    use sui::vec_map::{Self, VecMap};
    use std::string::{String, Self};
    use std::option::{Self, Option};
    use sui::clock::{Self, Clock};
    use sui::event;
    use std::vector;

    use trade_arena::mock_btc::{MOCK_BTC};
    use trade_arena::mock_usdc::{MOCK_USDC};
    use trade_arena::dex_pool::{Self, DEXGlobal};

    // ============ Error Codes ============
    const ENotAdmin: u64 = 1;
    const ESeasonNotInPreSeason: u64 = 2;
    const ESeasonNotActive: u64 = 3;
    const ESeasonNotEnded: u64 = 4;
    const EInvalidAI: u64 = 5;
    const EInsufficientDeposit: u64 = 6;
    const ENoDeposit: u64 = 7;
    const ESeasonAlreadyStarted: u64 = 8;
    const EMinimumDepositNotMet: u64 = 9;
    const ETradingPaused: u64 = 10;
    const ENotAuthorizedAI: u64 = 11;
    const ENoLPShares: u64 = 12;
    const EInsufficientBalance: u64 = 13;
    const EInvalidWalrusBlob: u64 = 14;

    // ============ Constants ============
    const MIN_USER_DEPOSIT: u64 = 10_000_000; // 10 USDC (6 decimals)
    const MIN_INITIAL_DEPOSIT: u64 = 100_000_000; // 100 USDC minimum per AI vault

    // ============ Enums ============
    const STATUS_PRE_SEASON: u8 = 0;
    const STATUS_ACTIVE: u8 = 1;
    const STATUS_ENDED: u8 = 2;

    // ============ Structs ============

    /// LP token representing a share of an AI vault
    public struct VaultShare<phantom AI_NAME> has drop {}

    /// Trade record stored on Walrus
    public struct TradeRecord has store, copy, drop {
        timestamp: u64,
        ai_model: String,
        action: String,         // "LONG", "SHORT", "CLOSE"
        pair: String,           // "BTC/USDC"  
        usdc_amount: u64,
        btc_amount: u64,
        entry_price: u64,       // Price in USDC per BTC (scaled by 1e6)
        reasoning: String,      // AI's decision reasoning
        confidence: u64,        // 0-100
        walrus_blob_id: vector<u8>, // Reference to full data on Walrus
    }

    /// Multi-token AI vault
    public struct AIVault<phantom AI_NAME> has store {
        usdc_balance: Balance<MOCK_USDC>,
        btc_balance: Balance<MOCK_BTC>,
        lp_supply: Supply<VaultShare<AI_NAME>>,
        authorized_wallet: address,
        trading_paused: bool,
        trade_history: vector<TradeRecord>,
    }

    /// AI Model configuration
    public struct AIModel has store, drop, copy {
        name: String,
        wallet_address: address,
    }

    /// Main season object
    public struct Season has store { 
        season_number: u64,
        status: u8,
        ai_models: vector<AIModel>,
        ai_vaults: VecMap<String, AIVault<String>>,
        created_at: u64,
        started_at: u64,
        ended_at: u64,
        total_trades: u64,
        total_volume: u64,
    }

    /// Admin capability
    public struct ManagerCap has key {
        id: UID
    }

    /// Global Season management system
    public struct SeasonGlobal has key {
        id: UID,
        seasons: VecMap<u64, Season>
    }

    // ============ Events ============

    public struct SeasonCreated has copy, drop { 
        season_number: u64,
        admin: address,
        ai_models: vector<String>,
    }

    public struct SeasonStarted has copy, drop {
        season_id: ID,
        season_number: u64,
        total_ai_count: u64,
        timestamp: u64,
    }

    public struct SeasonEnded has copy, drop {
        season_id: ID,
        season_number: u64,
        timestamp: u64,
    }

    public struct UserDeposited has copy, drop {
        season_id: ID,
        user: address,
        ai_name: String,
        amount: u64,
        lp_shares: u64,
        new_vault_total: u64,
    }

    public struct UserWithdrew has copy, drop {
        season_id: ID,
        user: address,
        ai_name: String,
        lp_shares: u64,
        usdc_amount: u64,
        btc_amount: u64,
    }

    public struct TradeExecuted has copy, drop {
        season_id: ID,
        ai_name: String,
        action: String,
        pair: String,
        usdc_amount: u64,
        btc_amount: u64,
        confidence: u64,
        walrus_blob_id: vector<u8>,
        timestamp: u64,
    }

    public struct TradingPaused has copy, drop {
        season_id: ID,
        ai_name: String,
        paused: bool,
        timestamp: u64,
    }

    // ======== Initialization ========

    fun init(ctx: &mut TxContext) {
        transfer::transfer(
            ManagerCap {id: object::new(ctx)},
            tx_context::sender(ctx)
        );

        let global = SeasonGlobal {
            id: object::new(ctx),
            seasons: vec_map::empty<u64, Season>()
        };

        transfer::share_object(global)
    }

    // ======== Admin Functions ========

    /// Create a new season with AI vaults
    public entry fun create_season(
        global: &mut SeasonGlobal,
        _manager_cap: &ManagerCap,
        season_number: u64,
        ai_model_1_name: String,
        ai_model_1_wallet_address: address,
        ai_model_2_name: Option<String>,
        ai_model_2_wallet_address: Option<address>,
        ai_model_3_name: Option<String>,
        ai_model_3_wallet_address: Option<address>,
        ai_model_4_name: Option<String>,
        ai_model_4_wallet_address: Option<address>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx); 

        let mut ai_vaults = vec_map::empty<String, AIVault<String>>();
        let mut ai_names = vector::empty<String>();
        let mut ai_models_vector = vector::empty<AIModel>();
        
        // AI Model 1 (required)
        let ai_model_1 = AIModel {
            name: ai_model_1_name,
            wallet_address: ai_model_1_wallet_address,
        };
        vector::push_back(&mut ai_models_vector, ai_model_1);

        let ai_vault_1 = AIVault<String> {
            usdc_balance: balance::zero<MOCK_USDC>(),
            btc_balance: balance::zero<MOCK_BTC>(),
            lp_supply: balance::create_supply(VaultShare<String> {}),
            authorized_wallet: ai_model_1_wallet_address,
            trading_paused: false,
            trade_history: vector::empty<TradeRecord>(),
        };
        vec_map::insert(&mut ai_vaults, ai_model_1_name, ai_vault_1);
        vector::push_back(&mut ai_names, ai_model_1_name);

        // AI Model 2-4 (optional) - Similar pattern
        if (option::is_some(&ai_model_2_name)) {
            let name_2 = option::destroy_some(ai_model_2_name);
            let wallet_2 = option::destroy_some(ai_model_2_wallet_address);
            
            let ai_model_2 = AIModel { name: name_2, wallet_address: wallet_2 };
            vector::push_back(&mut ai_models_vector, ai_model_2);
            
            let ai_vault_2 = AIVault<String> {
                usdc_balance: balance::zero<MOCK_USDC>(),
                btc_balance: balance::zero<MOCK_BTC>(),
                lp_supply: balance::create_supply(VaultShare<String> {}),
                authorized_wallet: wallet_2,
                trading_paused: false,
                trade_history: vector::empty<TradeRecord>(),
            };
            vec_map::insert(&mut ai_vaults, name_2, ai_vault_2);
            vector::push_back(&mut ai_names, name_2);
        } else {
            option::destroy_none(ai_model_2_name);
            option::destroy_none(ai_model_2_wallet_address);
        };

        // Similar for AI 3 & 4...
        if (option::is_some(&ai_model_3_name)) {
            let name_3 = option::destroy_some(ai_model_3_name);
            let wallet_3 = option::destroy_some(ai_model_3_wallet_address);
            let ai_model_3 = AIModel { name: name_3, wallet_address: wallet_3 };
            vector::push_back(&mut ai_models_vector, ai_model_3);
            let ai_vault_3 = AIVault<String> {
                usdc_balance: balance::zero<MOCK_USDC>(),
                btc_balance: balance::zero<MOCK_BTC>(),
                lp_supply: balance::create_supply(VaultShare<String> {}),
                authorized_wallet: wallet_3,
                trading_paused: false,
                trade_history: vector::empty<TradeRecord>(),
            };
            vec_map::insert(&mut ai_vaults, name_3, ai_vault_3);
            vector::push_back(&mut ai_names, name_3);
        } else {
            option::destroy_none(ai_model_3_name);
            option::destroy_none(ai_model_3_wallet_address);
        };

        if (option::is_some(&ai_model_4_name)) {
            let name_4 = option::destroy_some(ai_model_4_name);
            let wallet_4 = option::destroy_some(ai_model_4_wallet_address);
            let ai_model_4 = AIModel { name: name_4, wallet_address: wallet_4 };
            vector::push_back(&mut ai_models_vector, ai_model_4);
            let ai_vault_4 = AIVault<String> {
                usdc_balance: balance::zero<MOCK_USDC>(),
                btc_balance: balance::zero<MOCK_BTC>(),
                lp_supply: balance::create_supply(VaultShare<String> {}),
                authorized_wallet: wallet_4,
                trading_paused: false,
                trade_history: vector::empty<TradeRecord>(),
            };
            vec_map::insert(&mut ai_vaults, name_4, ai_vault_4);
            vector::push_back(&mut ai_names, name_4);
        } else {
            option::destroy_none(ai_model_4_name);
            option::destroy_none(ai_model_4_wallet_address);
        };
 
        let season = Season { 
            season_number,
            status: STATUS_PRE_SEASON,
            ai_models: ai_models_vector,
            ai_vaults,
            created_at: clock::timestamp_ms(clock),
            started_at: 0,
            ended_at: 0,
            total_trades: 0,
            total_volume: 0,
        };

        vec_map::insert(&mut global.seasons, season_number, season);

        event::emit(SeasonCreated { 
            season_number,
            admin: sender,
            ai_models: ai_names,
        });
    }

    /// Start the season (locks deposits, enables trading)
    public entry fun start_season(
        global: &mut SeasonGlobal,
        _manager_cap: &ManagerCap,
        season_number: u64,
        clock: &Clock,
        _ctx: &mut TxContext
    ) {
        let season = vec_map::get_mut(&mut global.seasons, &season_number);
        assert!(season.status == STATUS_PRE_SEASON, ESeasonAlreadyStarted);
        
        // Verify minimum deposits met
        let vault_keys = vec_map::keys(&season.ai_vaults);
        let mut i = 0;
        while (i < vector::length(&vault_keys)) {
            let key = vector::borrow(&vault_keys, i);
            let vault = vec_map::get(&season.ai_vaults, key);
            let total = balance::value(&vault.usdc_balance);
            assert!(total >= MIN_INITIAL_DEPOSIT, EMinimumDepositNotMet);
            i = i + 1;
        };
        
        season.status = STATUS_ACTIVE;
        season.started_at = clock::timestamp_ms(clock);
        
        event::emit(SeasonStarted {
            season_id: object::uid_to_inner(&global.id),
            season_number,
            total_ai_count: (vector::length(&season.ai_models) as u64),
            timestamp: clock::timestamp_ms(clock),
        });
    }

    /// End the season
    public entry fun end_season(
        global: &mut SeasonGlobal,
        _manager_cap: &ManagerCap,
        season_number: u64,
        clock: &Clock,
        _ctx: &mut TxContext
    ) {
        let season = vec_map::get_mut(&mut global.seasons, &season_number);
        assert!(season.status == STATUS_ACTIVE, ESeasonNotActive);
        
        season.status = STATUS_ENDED;
        season.ended_at = clock::timestamp_ms(clock);
        
        event::emit(SeasonEnded {
            season_id: object::uid_to_inner(&global.id),
            season_number,
            timestamp: clock::timestamp_ms(clock),
        });
    }

    // ======== User Functions ========

    /// Deposit USDC to an AI vault (pre-season only)
    public entry fun deposit_to_vault(
        global: &mut SeasonGlobal,
        season_number: u64,
        ai_name: String,
        usdc: Coin<MOCK_USDC>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let season = vec_map::get_mut(&mut global.seasons, &season_number);
        assert!(season.status == STATUS_PRE_SEASON, ESeasonNotInPreSeason);
        
        let deposit_amount = coin::value(&usdc);
        assert!(deposit_amount >= MIN_USER_DEPOSIT, EInsufficientDeposit);
        
        let vault = vec_map::get_mut(&mut season.ai_vaults, &ai_name);
        let usdc_balance_value = balance::value(&vault.usdc_balance);
        
        // Calculate LP shares
        let lp_amount = if (usdc_balance_value == 0) {
            deposit_amount // 1:1 for first depositor
        } else {
            let total_supply = balance::supply_value(&vault.lp_supply);
            (deposit_amount * total_supply) / usdc_balance_value
        };
        
        balance::join(&mut vault.usdc_balance, coin::into_balance(usdc));
        let lp_balance = balance::increase_supply(&mut vault.lp_supply, lp_amount);
        let lp_coin = coin::from_balance(lp_balance, ctx);
        
        transfer::public_transfer(lp_coin, sender);
        
        event::emit(UserDeposited {
            season_id: object::uid_to_inner(&global.id),
            user: sender,
            ai_name,
            amount: deposit_amount,
            lp_shares: lp_amount,
            new_vault_total: balance::value(&vault.usdc_balance),
        });
    }

    /// Withdraw from vault (post-season only)
    public entry fun withdraw_from_vault(
        global: &mut SeasonGlobal,
        season_number: u64,
        ai_name: String,
        lp_shares: Coin<VaultShare<String>>,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let season = vec_map::get_mut(&mut global.seasons, &season_number);
        assert!(season.status == STATUS_ENDED, ESeasonNotEnded);
        
        let lp_amount = coin::value(&lp_shares);
        assert!(lp_amount > 0, ENoLPShares);
        
        let vault = vec_map::get_mut(&mut season.ai_vaults, &ai_name);
        let total_lp = balance::supply_value(&vault.lp_supply);
        let usdc_reserve = balance::value(&vault.usdc_balance);
        let btc_reserve = balance::value(&vault.btc_balance);
        
        // Calculate proportional amounts
        let usdc_amount = (usdc_reserve * lp_amount) / total_lp;
        let btc_amount = (btc_reserve * lp_amount) / total_lp;
        
        // Burn LP tokens
        balance::decrease_supply(&mut vault.lp_supply, coin::into_balance(lp_shares));
        
        // Withdraw tokens
        if (usdc_amount > 0) {
            let usdc_coin = coin::take(&mut vault.usdc_balance, usdc_amount, ctx);
            transfer::public_transfer(usdc_coin, sender);
        };
        
        if (btc_amount > 0) {
            let btc_coin = coin::take(&mut vault.btc_balance, btc_amount, ctx);
            transfer::public_transfer(btc_coin, sender);
        };
        
        event::emit(UserWithdrew {
            season_id: object::uid_to_inner(&global.id),
            user: sender,
            ai_name,
            lp_shares: lp_amount,
            usdc_amount,
            btc_amount,
        });
    }

    // ======== AI Trading Functions ========

    /// AI executes LONG (swap USDC → BTC)
    public entry fun ai_execute_long(
        global: &mut SeasonGlobal,
        season_number: u64,
        ai_name: String,
        dex_global: &mut DEXGlobal,
        usdc_amount: u64,
        reasoning: String,
        confidence: u64,
        walrus_blob_id: vector<u8>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let season = vec_map::get_mut(&mut global.seasons, &season_number);
        assert!(season.status == STATUS_ACTIVE, ESeasonNotActive);
        
        let vault = vec_map::get_mut(&mut season.ai_vaults, &ai_name);
        assert!(sender == vault.authorized_wallet, ENotAuthorizedAI);
        assert!(!vault.trading_paused, ETradingPaused);
        assert!(vector::length(&walrus_blob_id) > 0, EInvalidWalrusBlob);
        
        let usdc_balance_value = balance::value(&vault.usdc_balance);
        assert!(usdc_balance_value >= usdc_amount, EInsufficientBalance);
        
        // Take USDC from vault
        let usdc_coin = coin::take(&mut vault.usdc_balance, usdc_amount, ctx);
        
        // Get BTC price before swap
        let btc_out_estimate = dex_pool::x_to_y_price<MOCK_USDC, MOCK_BTC>(dex_global, usdc_amount);
        let entry_price = if (btc_out_estimate > 0) {
            (usdc_amount * 1_000_000) / btc_out_estimate // Price scaled by 1e6
        } else { 0 };
        
        // Execute swap on DEX: USDC → BTC
        let btc_coin = dex_pool::swap_x_to_y_internal<MOCK_USDC, MOCK_BTC>(
            dex_global,
            usdc_coin,
            ctx
        );
        
        let btc_amount = coin::value(&btc_coin);
        balance::join(&mut vault.btc_balance, coin::into_balance(btc_coin));
        
        // Store trade record
        let trade_record = TradeRecord {
            timestamp: clock::timestamp_ms(clock),
            ai_model: ai_name,
            action: string::utf8(b"LONG"),
            pair: string::utf8(b"BTC/USDC"),
            usdc_amount,
            btc_amount,
            entry_price,
            reasoning,
            confidence,
            walrus_blob_id,
        };
        vector::push_back(&mut vault.trade_history, trade_record);
        
        // Update season stats
        season.total_trades = season.total_trades + 1;
        season.total_volume = season.total_volume + usdc_amount;
        
        event::emit(TradeExecuted {
            season_id: object::uid_to_inner(&global.id),
            ai_name,
            action: string::utf8(b"LONG"),
            pair: string::utf8(b"BTC/USDC"),
            usdc_amount,
            btc_amount,
            confidence,
            walrus_blob_id,
            timestamp: clock::timestamp_ms(clock),
        });
    }

    /// AI executes SHORT (swap BTC → USDC)
    public entry fun ai_execute_short(
        global: &mut SeasonGlobal,
        season_number: u64,
        ai_name: String,
        dex_global: &mut DEXGlobal,
        btc_amount: u64,
        reasoning: String,
        confidence: u64,
        walrus_blob_id: vector<u8>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let season = vec_map::get_mut(&mut global.seasons, &season_number);
        assert!(season.status == STATUS_ACTIVE, ESeasonNotActive);
        
        let vault = vec_map::get_mut(&mut season.ai_vaults, &ai_name);
        assert!(sender == vault.authorized_wallet, ENotAuthorizedAI);
        assert!(!vault.trading_paused, ETradingPaused);
        assert!(vector::length(&walrus_blob_id) > 0, EInvalidWalrusBlob);
        
        let btc_balance_value = balance::value(&vault.btc_balance);
        assert!(btc_balance_value >= btc_amount, EInsufficientBalance);
        
        // Take BTC from vault
        let btc_coin = coin::take(&mut vault.btc_balance, btc_amount, ctx);
        
        // Get USDC price before swap
        let usdc_out_estimate = dex_pool::y_to_x_price<MOCK_USDC, MOCK_BTC>(dex_global, btc_amount);
        let entry_price = if (btc_amount > 0) {
            (usdc_out_estimate * 1_000_000) / btc_amount
        } else { 0 };
        
        // Execute swap on DEX: BTC → USDC
        let usdc_coin = dex_pool::swap_y_to_x_internal<MOCK_USDC, MOCK_BTC>(
            dex_global,
            btc_coin,
            ctx
        );
        
        let usdc_amount = coin::value(&usdc_coin);
        balance::join(&mut vault.usdc_balance, coin::into_balance(usdc_coin));
        
        // Store trade record
        let trade_record = TradeRecord {
            timestamp: clock::timestamp_ms(clock),
            ai_model: ai_name,
            action: string::utf8(b"SHORT"),
            pair: string::utf8(b"BTC/USDC"),
            usdc_amount,
            btc_amount,
            entry_price,
            reasoning,
            confidence,
            walrus_blob_id,
        };
        vector::push_back(&mut vault.trade_history, trade_record);
        
        season.total_trades = season.total_trades + 1;
        season.total_volume = season.total_volume + usdc_amount;
        
        event::emit(TradeExecuted {
            season_id: object::uid_to_inner(&global.id),
            ai_name,
            action: string::utf8(b"SHORT"),
            pair: string::utf8(b"BTC/USDC"),
            usdc_amount,
            btc_amount,
            confidence,
            walrus_blob_id,
            timestamp: clock::timestamp_ms(clock),
        });
    }

    /// Pause/resume AI trading
    public entry fun toggle_ai_trading(
        global: &mut SeasonGlobal,
        _manager_cap: &ManagerCap,
        season_number: u64,
        ai_name: String,
        pause: bool,
        clock: &Clock,
        _ctx: &mut TxContext
    ) {
        let season = vec_map::get_mut(&mut global.seasons, &season_number);
        let vault = vec_map::get_mut(&mut season.ai_vaults, &ai_name);
        vault.trading_paused = pause;
        
        event::emit(TradingPaused {
            season_id: object::uid_to_inner(&global.id),
            ai_name,
            paused: pause,
            timestamp: clock::timestamp_ms(clock),
        });
    }

    // ======== View Functions ========

    /// Get vault balance info
    public fun get_vault_balance(
        global: &SeasonGlobal,
        season_number: u64,
        ai_name: String
    ): (u64, u64, u64) {
        let season = vec_map::get(&global.seasons, &season_number);
        let vault = vec_map::get(&season.ai_vaults, &ai_name);
        (
            balance::value(&vault.usdc_balance),
            balance::value(&vault.btc_balance),
            balance::supply_value(&vault.lp_supply)
        )
    }

    // ======== Test Functions =========

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx);
    }
}
