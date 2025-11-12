#[test_only]
module trade_arena::season_manager_tests_3_models {
    use sui::test_scenario::{Self, Scenario, next_tx, ctx};
    use sui::coin::{Self, Coin};
    use sui::clock::{Self, Clock};
    use sui::test_utils;
    use std::string::{String, Self};
    use std::option;
    use std::vector;

    use trade_arena::season_manager::{Self, SeasonGlobal, ManagerCap, VaultShare};
    use trade_arena::mock_usdc::{Self, MOCK_USDC, USDCGlobal};
    use trade_arena::mock_btc::{Self, MOCK_BTC, BTCGlobal};
    use trade_arena::dex_pool::{Self, DEXGlobal, ManagerCap as DEXManagerCap};

    // Test addresses
    const ADMIN: address = @0x1;
    const AI_DEEPSEEK: address = @0x2;
    const AI_CLAUDE: address = @0x3;
    const AI_GPT4: address = @0x4;
    const USER_ALICE: address = @0x5;
    const USER_BOB: address = @0x6;
    const USER_CHARLIE: address = @0x7;
    
    const SEASON_1: u64 = 1;
    const MIN_USER_DEPOSIT: u64 = 10_000_000; // 10 USDC
    const INITIAL_DEPOSIT: u64 = 100_000_000; // 100 USDC
    const LARGE_DEPOSIT: u64 = 500_000_000; // 500 USDC
    const TRADE_AMOUNT_SMALL: u64 = 25_000_000; // 25 USDC
    const TRADE_AMOUNT_MEDIUM: u64 = 50_000_000; // 50 USDC
    const TRADE_AMOUNT_LARGE: u64 = 100_000_000; // 100 USDC
    
    const DEX_FEE: u64 = 30; // 0.3% fee (30 basis points)
    const INITIAL_DEX_USDC: u64 = 10_000_000_000; // 10,000 USDC
    const INITIAL_DEX_BTC: u64 = 1_000_000_000; // 10 BTC (100M sats per BTC)

    // AI Model Names
    fun deepseek_name(): String { string::utf8(b"DeepSeek") }
    fun claude_name(): String { string::utf8(b"Claude") }
    fun gpt4_name(): String { string::utf8(b"GPT-4") }

    // Setup function with proper clock initialization
    fun setup_test(): Scenario {
        let mut scenario = test_scenario::begin(ADMIN);
        
        clock::create_for_testing(ctx(&mut scenario)).share_for_testing();
        
        next_tx(&mut scenario, ADMIN);
        {
            // Initialize all modules
            mock_usdc::test_init(ctx(&mut scenario));
            mock_btc::test_init(ctx(&mut scenario));
            dex_pool::init_for_testing(ctx(&mut scenario));
            season_manager::init_for_testing(ctx(&mut scenario));
        };
        
        // Setup DEX pool
        next_tx(&mut scenario, ADMIN);
        {
            let mut dex_global = test_scenario::take_shared<DEXGlobal>(&scenario);
            let dex_manager_cap = test_scenario::take_from_sender<DEXManagerCap>(&scenario);
            
            // Register USDC/BTC pool
            dex_pool::register_pool<MOCK_USDC, MOCK_BTC>(
                &mut dex_global,
                &dex_manager_cap,
                DEX_FEE,
                ctx(&mut scenario)
            );
            
            test_scenario::return_shared(dex_global);
            test_scenario::return_to_sender(&scenario, dex_manager_cap);
        };
        
        // Add initial liquidity to DEX
        next_tx(&mut scenario, ADMIN);
        {
            let mut dex_global = test_scenario::take_shared<DEXGlobal>(&scenario);
            let mut usdc_global = test_scenario::take_shared<USDCGlobal>(&scenario);
            let mut btc_global = test_scenario::take_shared<BTCGlobal>(&scenario);
            
            let usdc_coin = mock_usdc::mint_for_testing(&mut usdc_global, INITIAL_DEX_USDC, ctx(&mut scenario));
            let btc_coin = mock_btc::mint_for_testing(&mut btc_global, INITIAL_DEX_BTC, ctx(&mut scenario));
            
            let lsp = dex_pool::add_liquidity_internal(
                &mut dex_global,
                usdc_coin,
                btc_coin,
                ctx(&mut scenario)
            );
            
            test_scenario::return_shared(dex_global);
            test_scenario::return_shared(usdc_global);
            test_scenario::return_shared(btc_global);
            test_utils::destroy(lsp);
        };
        
        scenario
    }

    #[test]
    fun test_create_season_with_3_models() {
        let mut scenario = setup_test();
        
        next_tx(&mut scenario, ADMIN);
        {
            let mut global = test_scenario::take_shared<SeasonGlobal>(&scenario);
            let manager_cap = test_scenario::take_from_sender<ManagerCap>(&scenario);
            let clock = test_scenario::take_shared<Clock>(&scenario);
            
            season_manager::create_season(
                &mut global,
                &manager_cap,
                SEASON_1,
                deepseek_name(),
                AI_DEEPSEEK,
                option::some(claude_name()),
                option::some(AI_CLAUDE),
                option::some(gpt4_name()),
                option::some(AI_GPT4),
                option::none<String>(),
                option::none<address>(),
                &clock,
                ctx(&mut scenario)
            );
            
            test_scenario::return_shared(global);
            test_scenario::return_shared(clock);
            test_scenario::return_to_sender(&scenario, manager_cap);
        };
        
        test_scenario::end(scenario);
    }

    #[test]
    fun test_full_season_lifecycle_with_3_models() {
        let mut scenario = setup_test();
        
        // 1. Create Season with 3 AI models
        next_tx(&mut scenario, ADMIN);
        {
            let mut global = test_scenario::take_shared<SeasonGlobal>(&scenario);
            let manager_cap = test_scenario::take_from_sender<ManagerCap>(&scenario);
            let clock = test_scenario::take_shared<Clock>(&scenario);
            
            season_manager::create_season(
                &mut global,
                &manager_cap,
                SEASON_1,
                deepseek_name(),
                AI_DEEPSEEK,
                option::some(claude_name()),
                option::some(AI_CLAUDE),
                option::some(gpt4_name()),
                option::some(AI_GPT4),
                option::none<String>(),
                option::none<address>(),
                &clock,
                ctx(&mut scenario)
            );
            
            test_scenario::return_shared(global);
            test_scenario::return_shared(clock);
            test_scenario::return_to_sender(&scenario, manager_cap);
        };
        
        // 2. Users deposit to different AI vaults
        
        // Alice deposits to DeepSeek
        next_tx(&mut scenario, USER_ALICE);
        {
            let mut global = test_scenario::take_shared<SeasonGlobal>(&scenario);
            let mut usdc_global = test_scenario::take_shared<USDCGlobal>(&scenario);
            let clock = test_scenario::take_shared<Clock>(&scenario);
            
            let usdc_coin = mock_usdc::mint_for_testing(&mut usdc_global, LARGE_DEPOSIT, ctx(&mut scenario));
            
            season_manager::deposit_to_vault(
                &mut global,
                SEASON_1,
                deepseek_name(),
                usdc_coin,
                &clock,
                ctx(&mut scenario)
            );
            
            test_scenario::return_shared(global);
            test_scenario::return_shared(usdc_global);
            test_scenario::return_shared(clock);
        };
        
        // Bob deposits to Claude
        next_tx(&mut scenario, USER_BOB);
        {
            let mut global = test_scenario::take_shared<SeasonGlobal>(&scenario);
            let mut usdc_global = test_scenario::take_shared<USDCGlobal>(&scenario);
            let clock = test_scenario::take_shared<Clock>(&scenario);
            
            let usdc_coin = mock_usdc::mint_for_testing(&mut usdc_global, LARGE_DEPOSIT, ctx(&mut scenario));
            
            season_manager::deposit_to_vault(
                &mut global,
                SEASON_1,
                claude_name(),
                usdc_coin,
                &clock,
                ctx(&mut scenario)
            );
            
            test_scenario::return_shared(global);
            test_scenario::return_shared(usdc_global);
            test_scenario::return_shared(clock);
        };
        
        // Charlie deposits to GPT-4
        next_tx(&mut scenario, USER_CHARLIE);
        {
            let mut global = test_scenario::take_shared<SeasonGlobal>(&scenario);
            let mut usdc_global = test_scenario::take_shared<USDCGlobal>(&scenario);
            let clock = test_scenario::take_shared<Clock>(&scenario);
            
            let usdc_coin = mock_usdc::mint_for_testing(&mut usdc_global, LARGE_DEPOSIT, ctx(&mut scenario));
            
            season_manager::deposit_to_vault(
                &mut global,
                SEASON_1,
                gpt4_name(),
                usdc_coin,
                &clock,
                ctx(&mut scenario)
            );
            
            test_scenario::return_shared(global);
            test_scenario::return_shared(usdc_global);
            test_scenario::return_shared(clock);
        };
        
        // 3. Start Season
        next_tx(&mut scenario, ADMIN);
        {
            let mut global = test_scenario::take_shared<SeasonGlobal>(&scenario);
            let manager_cap = test_scenario::take_from_sender<ManagerCap>(&scenario);
            let clock = test_scenario::take_shared<Clock>(&scenario);
            
            season_manager::start_season(
                &mut global,
                &manager_cap,
                SEASON_1,
                &clock,
                ctx(&mut scenario)
            );
            
            test_scenario::return_shared(global);
            test_scenario::return_shared(clock);
            test_scenario::return_to_sender(&scenario, manager_cap);
        };
        
        // 4. End Season
        next_tx(&mut scenario, ADMIN);
        {
            let mut global = test_scenario::take_shared<SeasonGlobal>(&scenario);
            let manager_cap = test_scenario::take_from_sender<ManagerCap>(&scenario);
            let clock = test_scenario::take_shared<Clock>(&scenario);
            
            season_manager::end_season(
                &mut global,
                &manager_cap,
                SEASON_1,
                &clock,
                ctx(&mut scenario)
            );
            
            test_scenario::return_shared(global);
            test_scenario::return_shared(clock);
            test_scenario::return_to_sender(&scenario, manager_cap);
        };
        
        // 5. Users withdraw their funds
        
        // Alice withdraws
        next_tx(&mut scenario, USER_ALICE);
        {
            let mut global = test_scenario::take_shared<SeasonGlobal>(&scenario);
            let lp_shares = test_scenario::take_from_sender<Coin<VaultShare<String>>>(&scenario);
            
            season_manager::withdraw_from_vault(
                &mut global,
                SEASON_1,
                deepseek_name(),
                lp_shares,
                ctx(&mut scenario)
            );
            
            test_scenario::return_shared(global);
        };
        
        test_scenario::end(scenario);
    }

    #[test]
    fun test_multiple_users_per_vault() {
        let mut scenario = setup_test();
        
        // Create season
        next_tx(&mut scenario, ADMIN);
        {
            let mut global = test_scenario::take_shared<SeasonGlobal>(&scenario);
            let manager_cap = test_scenario::take_from_sender<ManagerCap>(&scenario);
            let clock = test_scenario::take_shared<Clock>(&scenario);
            
            season_manager::create_season(
                &mut global,
                &manager_cap,
                SEASON_1,
                deepseek_name(),
                AI_DEEPSEEK,
                option::some(claude_name()),
                option::some(AI_CLAUDE),
                option::some(gpt4_name()),
                option::some(AI_GPT4),
                option::none<String>(),
                option::none<address>(),
                &clock,
                ctx(&mut scenario)
            );
            
            test_scenario::return_shared(global);
            test_scenario::return_shared(clock);
            test_scenario::return_to_sender(&scenario, manager_cap);
        };
        
        // Multiple users deposit to DeepSeek vault
        let depositors = vector[USER_ALICE, USER_BOB, USER_CHARLIE];
        let mut i = 0;
        while (i < vector::length(&depositors)) {
            let user = *vector::borrow(&depositors, i);
            
            next_tx(&mut scenario, user);
            {
                let mut global = test_scenario::take_shared<SeasonGlobal>(&scenario);
                let mut usdc_global = test_scenario::take_shared<USDCGlobal>(&scenario);
                let clock = test_scenario::take_shared<Clock>(&scenario);
                
                let usdc_coin = mock_usdc::mint_for_testing(&mut usdc_global, INITIAL_DEPOSIT, ctx(&mut scenario));
                
                season_manager::deposit_to_vault(
                    &mut global,
                    SEASON_1,
                    deepseek_name(),
                    usdc_coin,
                    &clock,
                    ctx(&mut scenario)
                );
                
                test_scenario::return_shared(global);
                test_scenario::return_shared(usdc_global);
                test_scenario::return_shared(clock);
            };
            
            i = i + 1;
        };
        
        test_scenario::end(scenario);
    }

    #[test]
    fun test_ai_trading_competition() {
        let mut scenario = setup_test();
        
        // Setup season
        next_tx(&mut scenario, ADMIN);
        {
            let mut global = test_scenario::take_shared<SeasonGlobal>(&scenario);
            let manager_cap = test_scenario::take_from_sender<ManagerCap>(&scenario);
            let clock = test_scenario::take_shared<Clock>(&scenario);
            
            season_manager::create_season(
                &mut global,
                &manager_cap,
                SEASON_1,
                deepseek_name(),
                AI_DEEPSEEK,
                option::some(claude_name()),
                option::some(AI_CLAUDE),
                option::some(gpt4_name()),
                option::some(AI_GPT4),
                option::none<String>(),
                option::none<address>(),
                &clock,
                ctx(&mut scenario)
            );
            
            test_scenario::return_shared(global);
            test_scenario::return_shared(clock);
            test_scenario::return_to_sender(&scenario, manager_cap);
        };
        
        // Each AI gets equal deposits
        let ai_names = vector[deepseek_name(), claude_name(), gpt4_name()];
        let users = vector[USER_ALICE, USER_BOB, USER_CHARLIE];
        
        let mut i = 0;
        while (i < vector::length(&ai_names)) {
            let ai_name = *vector::borrow(&ai_names, i);
            let user = *vector::borrow(&users, i);
            
            next_tx(&mut scenario, user);
            {
                let mut global = test_scenario::take_shared<SeasonGlobal>(&scenario);
                let mut usdc_global = test_scenario::take_shared<USDCGlobal>(&scenario);
                let clock = test_scenario::take_shared<Clock>(&scenario);
                
                let usdc_coin = mock_usdc::mint_for_testing(&mut usdc_global, LARGE_DEPOSIT, ctx(&mut scenario));
                
                season_manager::deposit_to_vault(
                    &mut global,
                    SEASON_1,
                    ai_name,
                    usdc_coin,
                    &clock,
                    ctx(&mut scenario)
                );
                
                test_scenario::return_shared(global);
                test_scenario::return_shared(usdc_global);
                test_scenario::return_shared(clock);
            };
            
            i = i + 1;
        };
        
        // Start season
        next_tx(&mut scenario, ADMIN);
        {
            let mut global = test_scenario::take_shared<SeasonGlobal>(&scenario);
            let manager_cap = test_scenario::take_from_sender<ManagerCap>(&scenario);
            let clock = test_scenario::take_shared<Clock>(&scenario);
            
            season_manager::start_season(
                &mut global,
                &manager_cap,
                SEASON_1,
                &clock,
                ctx(&mut scenario)
            );
            
            test_scenario::return_shared(global);
            test_scenario::return_shared(clock);
            test_scenario::return_to_sender(&scenario, manager_cap);
        };
        
        // DeepSeek
        next_tx(&mut scenario, AI_DEEPSEEK);
        {
            let mut global = test_scenario::take_shared<SeasonGlobal>(&scenario);
            let mut dex_global = test_scenario::take_shared<DEXGlobal>(&scenario);
            let clock = test_scenario::take_shared<Clock>(&scenario);
            
            season_manager::ai_execute_long(
                &mut global,
                SEASON_1,
                deepseek_name(),
                &mut dex_global,
                TRADE_AMOUNT_LARGE,
                string::utf8(b"Strong momentum detected, RSI oversold at 28. Breakout above resistance with 2.5x volume. MACD bullish crossover. Confidence: High"),
                92,
                x"deadbeef01", // Mock Walrus blob ID
                &clock,
                ctx(&mut scenario)
            );
            
            test_scenario::return_shared(global);
            test_scenario::return_shared(dex_global);
            test_scenario::return_shared(clock);
        };
        
        // Claude
        next_tx(&mut scenario, AI_CLAUDE);
        {
            let mut global = test_scenario::take_shared<SeasonGlobal>(&scenario);
            let mut dex_global = test_scenario::take_shared<DEXGlobal>(&scenario);
            let clock = test_scenario::take_shared<Clock>(&scenario);
            
            season_manager::ai_execute_long(
                &mut global,
                SEASON_1,
                claude_name(),
                &mut dex_global,
                TRADE_AMOUNT_SMALL,
                string::utf8(b"Risk-managed entry. RSI at 38, low volatility (12%). Favorable R/R with tight SL at -3%. Conservative position sizing."),
                75,
                x"deadbeef02", // Mock Walrus blob ID
                &clock,
                ctx(&mut scenario)
            );
            
            test_scenario::return_shared(global);
            test_scenario::return_shared(dex_global);
            test_scenario::return_shared(clock);
        };
        
        // GPT-4
        next_tx(&mut scenario, AI_GPT4);
        {
            let mut global = test_scenario::take_shared<SeasonGlobal>(&scenario);
            let mut dex_global = test_scenario::take_shared<DEXGlobal>(&scenario);
            let clock = test_scenario::take_shared<Clock>(&scenario);
            
            season_manager::ai_execute_long(
                &mut global,
                SEASON_1,
                gpt4_name(),
                &mut dex_global,
                TRADE_AMOUNT_MEDIUM,
                string::utf8(b"Scalping opportunity. Quick momentum play, 1-hour timeframe. EMA crossover detected. Fast entry/exit strategy."),
                68,
                x"deadbeef03", // Mock Walrus blob ID
                &clock,
                ctx(&mut scenario)
            );
            
            test_scenario::return_shared(global);
            test_scenario::return_shared(dex_global);
            test_scenario::return_shared(clock);
        };
        
        test_scenario::end(scenario);
    }

    #[test]
    fun test_vault_balance_tracking() {
        let mut scenario = setup_test();
        
        // Create season
        next_tx(&mut scenario, ADMIN);
        {
            let mut global = test_scenario::take_shared<SeasonGlobal>(&scenario);
            let manager_cap = test_scenario::take_from_sender<ManagerCap>(&scenario);
            let clock = test_scenario::take_shared<Clock>(&scenario);
            
            season_manager::create_season(
                &mut global,
                &manager_cap,
                SEASON_1,
                deepseek_name(),
                AI_DEEPSEEK,
                option::some(claude_name()),
                option::some(AI_CLAUDE),
                option::some(gpt4_name()),
                option::some(AI_GPT4),
                option::none<String>(),
                option::none<address>(),
                &clock,
                ctx(&mut scenario)
            );
            
            test_scenario::return_shared(global);
            test_scenario::return_shared(clock);
            test_scenario::return_to_sender(&scenario, manager_cap);
        };
        
        // Check initial balances for all 3 vaults
        next_tx(&mut scenario, USER_ALICE);
        {
            let global = test_scenario::take_shared<SeasonGlobal>(&scenario);
            
            // Check DeepSeek vault
            let (usdc1, btc1, lp1) = season_manager::get_vault_balance(
                &global,
                SEASON_1,
                deepseek_name()
            );
            assert!(usdc1 == 0, 0);
            assert!(btc1 == 0, 1);
            assert!(lp1 == 0, 2);
            
            // Check Claude vault
            let (usdc2, btc2, lp2) = season_manager::get_vault_balance(
                &global,
                SEASON_1,
                claude_name()
            );
            assert!(usdc2 == 0, 3);
            assert!(btc2 == 0, 4);
            assert!(lp2 == 0, 5);
            
            // Check GPT-4 vault
            let (usdc3, btc3, lp3) = season_manager::get_vault_balance(
                &global,
                SEASON_1,
                gpt4_name()
            );
            assert!(usdc3 == 0, 6);
            assert!(btc3 == 0, 7);
            assert!(lp3 == 0, 8);
            
            test_scenario::return_shared(global);
        };
        
        // Users deposit to different vaults
        next_tx(&mut scenario, USER_ALICE);
        {
            let mut global = test_scenario::take_shared<SeasonGlobal>(&scenario);
            let mut usdc_global = test_scenario::take_shared<USDCGlobal>(&scenario);
            let clock = test_scenario::take_shared<Clock>(&scenario);
            
            let usdc_coin = mock_usdc::mint_for_testing(&mut usdc_global, INITIAL_DEPOSIT, ctx(&mut scenario));
            
            season_manager::deposit_to_vault(
                &mut global,
                SEASON_1,
                deepseek_name(),
                usdc_coin,
                &clock,
                ctx(&mut scenario)
            );
            
            test_scenario::return_shared(global);
            test_scenario::return_shared(usdc_global);
            test_scenario::return_shared(clock);
        };
        
        // Verify balance updated
        next_tx(&mut scenario, USER_ALICE);
        {
            let global = test_scenario::take_shared<SeasonGlobal>(&scenario);
            
            let (usdc, btc, lp) = season_manager::get_vault_balance(
                &global,
                SEASON_1,
                deepseek_name()
            );
            
            assert!(usdc == INITIAL_DEPOSIT, 9);
            assert!(btc == 0, 10);
            assert!(lp > 0, 11);
            
            test_scenario::return_shared(global);
        };
        
        test_scenario::end(scenario);
    }

    #[test]
    fun test_pause_resume_ai_trading() {
        let mut scenario = setup_test();
        
        // Setup
        next_tx(&mut scenario, ADMIN);
        {
            let mut global = test_scenario::take_shared<SeasonGlobal>(&scenario);
            let manager_cap = test_scenario::take_from_sender<ManagerCap>(&scenario);
            let clock = test_scenario::take_shared<Clock>(&scenario);
            
            season_manager::create_season(
                &mut global,
                &manager_cap,
                SEASON_1,
                deepseek_name(),
                AI_DEEPSEEK,
                option::some(claude_name()),
                option::some(AI_CLAUDE),
                option::some(gpt4_name()),
                option::some(AI_GPT4),
                option::none<String>(),
                option::none<address>(),
                &clock,
                ctx(&mut scenario)
            );
            
            test_scenario::return_shared(global);
            test_scenario::return_shared(clock);
            test_scenario::return_to_sender(&scenario, manager_cap);
        };
        
        // Pause DeepSeek AI
        next_tx(&mut scenario, ADMIN);
        {
            let mut global = test_scenario::take_shared<SeasonGlobal>(&scenario);
            let manager_cap = test_scenario::take_from_sender<ManagerCap>(&scenario);
            let clock = test_scenario::take_shared<Clock>(&scenario);
            
            season_manager::toggle_ai_trading(
                &mut global,
                &manager_cap,
                SEASON_1,
                deepseek_name(),
                true, // pause
                &clock,
                ctx(&mut scenario)
            );
            
            test_scenario::return_shared(global);
            test_scenario::return_shared(clock);
            test_scenario::return_to_sender(&scenario, manager_cap);
        };
        
        // Resume DeepSeek AI
        next_tx(&mut scenario, ADMIN);
        {
            let mut global = test_scenario::take_shared<SeasonGlobal>(&scenario);
            let manager_cap = test_scenario::take_from_sender<ManagerCap>(&scenario);
            let clock = test_scenario::take_shared<Clock>(&scenario);
            
            season_manager::toggle_ai_trading(
                &mut global,
                &manager_cap,
                SEASON_1,
                deepseek_name(),
                false, // resume
                &clock,
                ctx(&mut scenario)
            );
            
            test_scenario::return_shared(global);
            test_scenario::return_shared(clock);
            test_scenario::return_to_sender(&scenario, manager_cap);
        };
        
        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = season_manager::ESeasonNotInPreSeason)]
    fun test_cannot_deposit_after_season_starts() {
        let mut scenario = setup_test();
        
        // Create season
        next_tx(&mut scenario, ADMIN);
        {
            let mut global = test_scenario::take_shared<SeasonGlobal>(&scenario);
            let manager_cap = test_scenario::take_from_sender<ManagerCap>(&scenario);
            let clock = test_scenario::take_shared<Clock>(&scenario);
            
            season_manager::create_season(
                &mut global,
                &manager_cap,
                SEASON_1,
                deepseek_name(),
                AI_DEEPSEEK,
                option::none<String>(),
                option::none<address>(),
                option::none<String>(),
                option::none<address>(),
                option::none<String>(),
                option::none<address>(),
                &clock,
                ctx(&mut scenario)
            );
            
            test_scenario::return_shared(global);
            test_scenario::return_shared(clock);
            test_scenario::return_to_sender(&scenario, manager_cap);
        };
        
        // Deposit
        next_tx(&mut scenario, USER_ALICE);
        {
            let mut global = test_scenario::take_shared<SeasonGlobal>(&scenario);
            let mut usdc_global = test_scenario::take_shared<USDCGlobal>(&scenario);
            let clock = test_scenario::take_shared<Clock>(&scenario);
            
            let usdc_coin = mock_usdc::mint_for_testing(&mut usdc_global, INITIAL_DEPOSIT, ctx(&mut scenario));
            
            season_manager::deposit_to_vault(
                &mut global,
                SEASON_1,
                deepseek_name(),
                usdc_coin,
                &clock,
                ctx(&mut scenario)
            );
            
            test_scenario::return_shared(global);
            test_scenario::return_shared(usdc_global);
            test_scenario::return_shared(clock);
        };
        
        // Start season
        next_tx(&mut scenario, ADMIN);
        {
            let mut global = test_scenario::take_shared<SeasonGlobal>(&scenario);
            let manager_cap = test_scenario::take_from_sender<ManagerCap>(&scenario);
            let clock = test_scenario::take_shared<Clock>(&scenario);
            
            season_manager::start_season(
                &mut global,
                &manager_cap,
                SEASON_1,
                &clock,
                ctx(&mut scenario)
            );
            
            test_scenario::return_shared(global);
            test_scenario::return_shared(clock);
            test_scenario::return_to_sender(&scenario, manager_cap);
        };
        
        // Try to deposit after season started - should fail
        next_tx(&mut scenario, USER_BOB);
        {
            let mut global = test_scenario::take_shared<SeasonGlobal>(&scenario);
            let mut usdc_global = test_scenario::take_shared<USDCGlobal>(&scenario);
            let clock = test_scenario::take_shared<Clock>(&scenario);
            
            let usdc_coin = mock_usdc::mint_for_testing(&mut usdc_global, INITIAL_DEPOSIT, ctx(&mut scenario));
            
            season_manager::deposit_to_vault(
                &mut global,
                SEASON_1,
                deepseek_name(),
                usdc_coin,
                &clock,
                ctx(&mut scenario)
            );
            
            test_scenario::return_shared(global);
            test_scenario::return_shared(usdc_global);
            test_scenario::return_shared(clock);
        };
        
        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = season_manager::ENotAuthorizedAI)]
    fun test_unauthorized_ai_cannot_trade() {
        let mut scenario = setup_test();
        let unauthorized_wallet = @0x9999;
        
        // Setup and start season
        next_tx(&mut scenario, ADMIN);
        {
            let mut global = test_scenario::take_shared<SeasonGlobal>(&scenario);
            let manager_cap = test_scenario::take_from_sender<ManagerCap>(&scenario);
            let clock = test_scenario::take_shared<Clock>(&scenario);
            
            season_manager::create_season(
                &mut global,
                &manager_cap,
                SEASON_1,
                deepseek_name(),
                AI_DEEPSEEK,
                option::none<String>(),
                option::none<address>(),
                option::none<String>(),
                option::none<address>(),
                option::none<String>(),
                option::none<address>(),
                &clock,
                ctx(&mut scenario)
            );
            
            test_scenario::return_shared(global);
            test_scenario::return_shared(clock);
            test_scenario::return_to_sender(&scenario, manager_cap);
        };
        
        // Deposit
        next_tx(&mut scenario, USER_ALICE);
        {
            let mut global = test_scenario::take_shared<SeasonGlobal>(&scenario);
            let mut usdc_global = test_scenario::take_shared<USDCGlobal>(&scenario);
            let clock = test_scenario::take_shared<Clock>(&scenario);
            
            let usdc_coin = mock_usdc::mint_for_testing(&mut usdc_global, LARGE_DEPOSIT, ctx(&mut scenario));
            
            season_manager::deposit_to_vault(
                &mut global,
                SEASON_1,
                deepseek_name(),
                usdc_coin,
                &clock,
                ctx(&mut scenario)
            );
            
            test_scenario::return_shared(global);
            test_scenario::return_shared(usdc_global);
            test_scenario::return_shared(clock);
        };
        
        // Start season
        next_tx(&mut scenario, ADMIN);
        {
            let mut global = test_scenario::take_shared<SeasonGlobal>(&scenario);
            let manager_cap = test_scenario::take_from_sender<ManagerCap>(&scenario);
            let clock = test_scenario::take_shared<Clock>(&scenario);
            
            season_manager::start_season(
                &mut global,
                &manager_cap,
                SEASON_1,
                &clock,
                ctx(&mut scenario)
            );
            
            test_scenario::return_shared(global);
            test_scenario::return_shared(clock);
            test_scenario::return_to_sender(&scenario, manager_cap);
        };
        
        // Unauthorized wallet tries to trade - should fail
        next_tx(&mut scenario, unauthorized_wallet);
        {
            let mut global = test_scenario::take_shared<SeasonGlobal>(&scenario);
            let mut dex_global = test_scenario::take_shared<DEXGlobal>(&scenario);
            let clock = test_scenario::take_shared<Clock>(&scenario);
            
            season_manager::ai_execute_long(
                &mut global,
                SEASON_1,
                deepseek_name(),
                &mut dex_global,
                TRADE_AMOUNT_SMALL,
                string::utf8(b"Unauthorized trade attempt"),
                50,
                x"deadbeef",
                &clock,
                ctx(&mut scenario)
            );
            
            test_scenario::return_shared(global);
            test_scenario::return_shared(dex_global);
            test_scenario::return_shared(clock);
        };
        
        test_scenario::end(scenario);
    }
}
