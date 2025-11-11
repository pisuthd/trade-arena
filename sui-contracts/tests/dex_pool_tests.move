#[test_only]
module trade_arena::dex_pool_tests {
    use sui::coin::{Self, Coin, mint_for_testing as mint};
    use sui::test_scenario::{Self as test, Scenario, next_tx, ctx};
    use sui::test_utils;
    use trade_arena::dex_pool::{Self, Pool, LSP};
    use trade_arena::mock_usdc::{Self, MOCK_USDC};
    use trade_arena::mock_btc::{Self, MOCK_BTC};

    /// A witness type for the pool creation;
    /// The pool provider's identifier.
    public struct POOLEY has drop {}

    const USDC_AMT: u64 = 1000000; // 1 USDC (6 decimals)
    const BTC_AMT: u64 = 100000000; // 1 BTC (8 decimals)

    // Tests section
    #[test] 
    fun test_init_pool() {
        let mut scenario = scenario();
        test_init_pool_(&mut scenario);
        test::end(scenario);
    }

    #[test] 
    fun test_add_liquidity() {
        let mut scenario = scenario();
        test_add_liquidity_(&mut scenario);
        test::end(scenario);
    }

    #[test] 
    fun test_swap_usdc_to_btc() {
        let mut scenario = scenario();
        test_swap_usdc_to_btc_(&mut scenario);
        test::end(scenario);
    }

    #[test] 
    fun test_swap_btc_to_usdc() {
        let mut scenario = scenario();
        test_swap_btc_to_usdc_(&mut scenario);
        test::end(scenario);
    }

    #[test] 
    fun test_withdraw_almost_all() {
        let mut scenario = scenario();
        test_withdraw_almost_all_(&mut scenario);
        test::end(scenario);
    }

    #[test] 
    fun test_withdraw_all() {
        let mut scenario = scenario();
        test_withdraw_all_(&mut scenario);
        test::end(scenario);
    }

    // Non-sequential tests
    #[test] 
    fun test_math() {
        let mut scenario = scenario();
        test_math_(&mut scenario);
        test::end(scenario);
    }

    #[test] 
    fun test_empty_pool_swap() {
        let mut scenario = scenario();
        test_empty_pool_swap_(&mut scenario);
        test::end(scenario);
    }

    #[test] 
    fun test_zero_amount_swap() {
        let mut scenario = scenario();
        test_zero_amount_swap_(&mut scenario);
        test::end(scenario);
    }

    #[test_only]
    fun burn<T>(x: Coin<T>): u64 {
        let value = coin::value(&x);
        test_utils::destroy(x);
        value
    }

    /// Init a Pool with 1 USDC and 1 BTC;
    /// Set the ratio USDC : BTC = 1 : 1 (different decimals).
    /// Set LSP token amount based on sqrt of product.
    fun test_init_pool_(test: &mut Scenario) {
        let (owner, _) = people();

        next_tx(test, owner);
        {
            mock_usdc::test_init(ctx(test));
            mock_btc::test_init(ctx(test));
        };

        next_tx(test, owner);
        {
            let mut usdc_global = test::take_shared<mock_usdc::USDCGlobal>(test);
            let usdc_coin = mock_usdc::mint_for_testing(&mut usdc_global, USDC_AMT, ctx(test));
            test::return_shared(usdc_global);
            
            let mut btc_global = test::take_shared<mock_btc::BTCGlobal>(test);
            let btc_coin = mock_btc::mint_for_testing(&mut btc_global, BTC_AMT, ctx(test));
            test::return_shared(btc_global);
            
            let lsp = dex_pool::create_pool(
                POOLEY {},
                usdc_coin,
                btc_coin,
                3, // 0.03% fee
                ctx(test)
            );

            // Expected LSP amount: sqrt(1000000) * sqrt(100000000) = 1000 * 10000 = 10000000
            let actual_lsp = burn(lsp);
            assert!(actual_lsp > 9000000 && actual_lsp < 11000000, 0);
        };

        next_tx(test, owner);
        {
            let mut pool = test::take_shared<Pool<POOLEY, MOCK_USDC, MOCK_BTC>>(test);
            let (amt_usdc, amt_btc, lsp_supply) = dex_pool::get_amounts(&mut pool);

            assert!(lsp_supply > 9000000 && lsp_supply < 11000000, 0);
            assert!(amt_usdc == USDC_AMT, 0);
            assert!(amt_btc == BTC_AMT, 0);

            test::return_shared(pool)
        };
    }

    /// Expect LP tokens to double in supply when the same values passed
    fun test_add_liquidity_(test: &mut Scenario) {
        test_init_pool_(test);

        let (_, theguy) = people();

        next_tx(test, theguy);
        {
            let mut pool = test::take_shared<Pool<POOLEY, MOCK_USDC, MOCK_BTC>>(test);
            let (amt_usdc, amt_btc, lsp_supply) = dex_pool::get_amounts(&mut pool);

            let mut usdc_global = test::take_shared<mock_usdc::USDCGlobal>(test);
            let usdc_coin = mock_usdc::mint_for_testing(&mut usdc_global, amt_usdc, ctx(test));
            test::return_shared(usdc_global);

            let mut btc_global = test::take_shared<mock_btc::BTCGlobal>(test);
            let btc_coin = mock_btc::mint_for_testing(&mut btc_global, amt_btc, ctx(test));
            test::return_shared(btc_global);

            let lsp_tokens = dex_pool::add_liquidity(
                &mut pool,
                usdc_coin,
                btc_coin,
                ctx(test)
            );

            assert!(burn(lsp_tokens) == lsp_supply, 1);

            test::return_shared(pool)
        };
    }

    /// The other guy tries to exchange 5000 USDC for ~ 5000 BTC satoshis,
    /// minus the commission that is paid to the pool.
    fun test_swap_usdc_to_btc_(test: &mut Scenario) {
        test_init_pool_(test);

        let (_, the_guy) = people();

        next_tx(test, the_guy);
        {
            let mut pool = test::take_shared<Pool<POOLEY, MOCK_USDC, MOCK_BTC>>(test);

            let btc = dex_pool::swap_token1_to_token2(&mut pool, mint<MOCK_USDC>(5000, ctx(test)), ctx(test));

            // Check the value of the coin received by the guy.
            // Due to rounding problem the value is not precise
            // (works better on larger numbers).
            assert!(burn(btc) > 490000, 1);

            test::return_shared(pool);
        };
    }

    /// The owner swaps back BTC for USDC and expects an increase in price.
    /// The sent amount of BTC is 100000 satoshis (0.001 BTC), initial price was 1 USDC : 1 BTC;
    fun test_swap_btc_to_usdc_(test: &mut Scenario) {
        test_swap_usdc_to_btc_(test);

        let (owner, _) = people();

        next_tx(test, owner);
        {
            let mut pool = test::take_shared<Pool<POOLEY, MOCK_USDC, MOCK_BTC>>(test);

            let mut btc_global = test::take_shared<mock_btc::BTCGlobal>(test);
            let btc_coin = mock_btc::mint_for_testing(&mut btc_global, 100000, ctx(test));
            test::return_shared(btc_global);

            let usdc = dex_pool::swap_token2_to_token1(&mut pool, btc_coin, ctx(test));

            // Should get approximately 1000 USDC (0.001 BTC * 1 BTC/USDC rate) minus fees
            // Since we swapped 5000 USDC for BTC earlier, the rate changed
            let usdc_value = burn(usdc);
            assert!(usdc_value > 900 && usdc_value < 1100, 2);

            test::return_shared(pool);
        };
    }

    /// Withdraw (LSP_SUPPLY - 1) from the pool
    fun test_withdraw_almost_all_(test: &mut Scenario) {
        test_swap_btc_to_usdc_(test);

        let (owner, _) = people();

        // Get the actual LSP supply first
        next_tx(test, owner);
        {
            let mut pool = test::take_shared<Pool<POOLEY, MOCK_USDC, MOCK_BTC>>(test);
            let (_, _, lsp_supply) = dex_pool::get_amounts(&mut pool);
            test::return_shared(pool);

            // someone tries to pass (LSP_SUPPLY - 1) and hopes there will be just 1 USDC left
            next_tx(test, owner);
            {
                let lsp = mint<LSP<POOLEY, MOCK_USDC, MOCK_BTC>>(lsp_supply - 1, ctx(test));
                let mut pool = test::take_shared<Pool<POOLEY, MOCK_USDC, MOCK_BTC>>(test);

                let (usdc, btc) = dex_pool::remove_liquidity(&mut pool, lsp, ctx(test));
                let (usdc_reserve, btc_reserve, lsp_supply) = dex_pool::get_amounts(&mut pool);

                assert!(lsp_supply == 1, 3);
                assert!(usdc_reserve > 0, 3);
                assert!(btc_reserve > 0, 3);

                burn(usdc);
                burn(btc);

                test::return_shared(pool);
            }
        }
    }

    /// The owner tries to withdraw all liquidity from the pool.
    fun test_withdraw_all_(test: &mut Scenario) {
        test_swap_btc_to_usdc_(test);

        let (owner, _) = people();

        // Get the actual LSP supply first
        next_tx(test, owner);
        {
            let mut pool = test::take_shared<Pool<POOLEY, MOCK_USDC, MOCK_BTC>>(test);
            let (_, _, lsp_supply) = dex_pool::get_amounts(&mut pool);
            test::return_shared(pool);

            next_tx(test, owner);
            {
                let lsp = mint<LSP<POOLEY, MOCK_USDC, MOCK_BTC>>(lsp_supply, ctx(test));
                let mut pool = test::take_shared<Pool<POOLEY, MOCK_USDC, MOCK_BTC>>(test);

                let (usdc, btc) = dex_pool::remove_liquidity(&mut pool, lsp, ctx(test));
                let (usdc_reserve, btc_reserve, lsp_supply) = dex_pool::get_amounts(&mut pool);

                assert!(usdc_reserve == 0, 3);
                assert!(btc_reserve == 0, 3);
                assert!(lsp_supply == 0, 3);

                // make sure that withdrawn assets
                // Due to swaps, the amounts may be different from initial deposits
                // but should be reasonable
                let usdc_withdrawn = burn(usdc);
                let btc_withdrawn = burn(btc);
                assert!(usdc_withdrawn >= USDC_AMT * 90 / 100, 3); // at least 90% of initial
                assert!(btc_withdrawn >= BTC_AMT * 90 / 100, 3); // at least 90% of initial

                test::return_shared(pool);
            };
        }
    }

    /// This just tests the math.
    fun test_math_(_: &mut Scenario) {
        let u64_max = 18446744073709551615;
        let max_val = u64_max / 10000;

        // Try small values
        assert!(dex_pool::get_input_price(10, 1000, 1000, 0) == 9, 0);

        // Even with 0 commission there's this small loss of 1
        assert!(dex_pool::get_input_price(10000, max_val, max_val, 0) == 9999, 0);
        assert!(dex_pool::get_input_price(1000, max_val, max_val, 0) == 999, 0);
        assert!(dex_pool::get_input_price(100, max_val, max_val, 0) == 99, 0);
    }

    /// Test edge case: swapping with minimal liquidity
    fun test_empty_pool_swap_(_: &mut Scenario) {
        let u64_max = 18446744073709551615;
        
        // Test with very small reserves
        let input_amount = 1;
        let input_reserve = 1;
        let output_reserve = 1;
        let fee = 0;
        
        // Should not panic and return reasonable value
        let output = dex_pool::get_input_price(input_amount, input_reserve, output_reserve, fee);
        assert!(output == 0, 0); // With such small numbers, rounding should result in 0
    }

    /// Test edge case: zero amount swap
    fun test_zero_amount_swap_(_: &mut Scenario) {
        let input_amount = 0;
        let input_reserve = 1000000;
        let output_reserve = 1000000;
        let fee = 3;
        
        // Zero input should result in zero output
        let output = dex_pool::get_input_price(input_amount, input_reserve, output_reserve, fee);
        assert!(output == 0, 0);
    }

    // utilities
    fun scenario(): Scenario { test::begin(@0x1) }
    fun people(): (address, address) { (@0xBEEF, @0x1337) }
}
