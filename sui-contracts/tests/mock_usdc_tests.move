#[test_only]
module trade_arena::mock_usdc_tests;

use sui::test_scenario::{Self, Scenario, next_tx, ctx};
use sui::coin::{Self, Coin};
use std::unit_test::assert_eq;

use trade_arena::mock_usdc::{Self, USDCGlobal, MOCK_USDC};

// Test accounts
const ADMIN: address = @0x1234;
const USER1: address = @0x4567;
const USER2: address = @0x8901;

// Setup function to initialize the mock USDC
fun setup_test(): Scenario {
    let mut scenario = test_scenario::begin(ADMIN);
    {
        mock_usdc::test_init(ctx(&mut scenario));
    };
    scenario
}

#[test]
fun test_mint_mock_usdc() {
    let mut scenario = setup_test();
    
    // Admin mints USDC to USER1
    let mint_amount = 1000_000000; // 1000 USDC with 6 decimals
    
    next_tx(&mut scenario, ADMIN);
    {
        let mut global = test_scenario::take_shared<USDCGlobal>(&scenario);
        
        mock_usdc::mint(
            &mut global,
            mint_amount,
            USER1,
            ctx(&mut scenario)
        );
        
        test_scenario::return_shared(global);
    };
    
    // Verify USER1 received the USDC
    next_tx(&mut scenario, USER1);
    {
        let usdc_coin = test_scenario::take_from_address<Coin<MOCK_USDC>>(&scenario, USER1);
        assert_eq!(coin::value(&usdc_coin), mint_amount);
        test_scenario::return_to_address(USER1, usdc_coin);
    };
    
    test_scenario::end(scenario);
}

#[test]
fun test_burn_mock_usdc() {
    let mut scenario = setup_test();
    
    // Admin mints USDC to USER1
    let mint_amount = 1000_000000; // 1000 USDC with 6 decimals
    
    next_tx(&mut scenario, ADMIN);
    {
        let mut global = test_scenario::take_shared<USDCGlobal>(&scenario);
        
        mock_usdc::mint(
            &mut global,
            mint_amount,
            USER1,
            ctx(&mut scenario)
        );
        
        test_scenario::return_shared(global);
    };
    
    // USER1 burns half of their USDC
    next_tx(&mut scenario, USER1);
    {
        let mut global = test_scenario::take_shared<USDCGlobal>(&scenario);
        let mut usdc_coin = test_scenario::take_from_address<Coin<MOCK_USDC>>(&scenario, USER1);
        
        // Split the coin in half
        let burn_amount = coin::value(&usdc_coin) / 2;
        let coin_to_burn = coin::split(&mut usdc_coin, burn_amount, ctx(&mut scenario));
        
        // Burn half of the USDC
        mock_usdc::burn(&mut global, coin_to_burn);
        
        test_scenario::return_shared(global);
        test_scenario::return_to_address(USER1, usdc_coin);
    };
    
    // Verify USER1 now has half the amount
    next_tx(&mut scenario, USER1);
    {
        let usdc_coin = test_scenario::take_from_address<Coin<MOCK_USDC>>(&scenario, USER1);
        assert_eq!(coin::value(&usdc_coin), mint_amount / 2);
        test_scenario::return_to_address(USER1, usdc_coin);
    };
    
    test_scenario::end(scenario);
}

#[test]
fun test_multiple_mints() {
    let mut scenario = setup_test();
    
    // Admin mints USDC to multiple users
    let mint_amount1 = 1000_000000; // 1000 USDC
    let mint_amount2 = 2500_000000; // 2500 USDC
    
    next_tx(&mut scenario, ADMIN);
    {
        let mut global = test_scenario::take_shared<USDCGlobal>(&scenario);
        
        // Mint to USER1
        mock_usdc::mint(
            &mut global,
            mint_amount1,
            USER1,
            ctx(&mut scenario)
        );
        
        // Mint to USER2
        mock_usdc::mint(
            &mut global,
            mint_amount2,
            USER2,
            ctx(&mut scenario)
        );
        
        test_scenario::return_shared(global);
    };
    
    // Verify USER1 received correct amount
    next_tx(&mut scenario, USER1);
    {
        let usdc_coin = test_scenario::take_from_address<Coin<MOCK_USDC>>(&scenario, USER1);
        assert_eq!(coin::value(&usdc_coin), mint_amount1);
        test_scenario::return_to_address(USER1, usdc_coin);
    };
    
    // Verify USER2 received correct amount
    next_tx(&mut scenario, USER2);
    {
        let usdc_coin = test_scenario::take_from_address<Coin<MOCK_USDC>>(&scenario, USER2);
        assert_eq!(coin::value(&usdc_coin), mint_amount2);
        test_scenario::return_to_address(USER2, usdc_coin);
    };
    
    test_scenario::end(scenario);
}

#[test]
fun test_transfer_between_users() {
    let mut scenario = setup_test();
    
    // Admin mints USDC to USER1
    let mint_amount = 1000_000000; // 1000 USDC
    let transfer_amount = 300_000000; // 300 USDC
    
    next_tx(&mut scenario, ADMIN);
    {
        let mut global = test_scenario::take_shared<USDCGlobal>(&scenario);
        
        mock_usdc::mint(
            &mut global,
            mint_amount,
            USER1,
            ctx(&mut scenario)
        );
        
        test_scenario::return_shared(global);
    };
    
    // USER1 transfers some USDC to USER2
    next_tx(&mut scenario, USER1);
    {
        let mut usdc_coin = test_scenario::take_from_address<Coin<MOCK_USDC>>(&scenario, USER1);
        
        // Split the coin for transfer
        let coin_to_transfer = coin::split(&mut usdc_coin, transfer_amount, ctx(&mut scenario));
        
        // Transfer to USER2
        sui::transfer::public_transfer(coin_to_transfer, USER2);
        
        test_scenario::return_to_address(USER1, usdc_coin);
    };
    
    // Verify USER1 has remaining amount
    next_tx(&mut scenario, USER1);
    {
        let usdc_coin = test_scenario::take_from_address<Coin<MOCK_USDC>>(&scenario, USER1);
        assert_eq!(coin::value(&usdc_coin), mint_amount - transfer_amount);
        test_scenario::return_to_address(USER1, usdc_coin);
    };
    
    // Verify USER2 received transfer
    next_tx(&mut scenario, USER2);
    {
        let usdc_coin = test_scenario::take_from_address<Coin<MOCK_USDC>>(&scenario, USER2);
        assert_eq!(coin::value(&usdc_coin), transfer_amount);
        test_scenario::return_to_address(USER2, usdc_coin);
    };
    
    test_scenario::end(scenario);
}

#[test]
fun test_mint_and_burn_all() {
    let mut scenario = setup_test();
    
    // Admin mints USDC to USER1
    let mint_amount = 1000_000000; // 1000 USDC
    
    next_tx(&mut scenario, ADMIN);
    {
        let mut global = test_scenario::take_shared<USDCGlobal>(&scenario);
        
        mock_usdc::mint(
            &mut global,
            mint_amount,
            USER1,
            ctx(&mut scenario)
        );
        
        test_scenario::return_shared(global);
    };
    
    // USER1 burns all their USDC
    next_tx(&mut scenario, USER1);
    {
        let mut global = test_scenario::take_shared<USDCGlobal>(&scenario);
        let usdc_coin = test_scenario::take_from_address<Coin<MOCK_USDC>>(&scenario, USER1);
        
        // Burn all of the USDC
        mock_usdc::burn(&mut global, usdc_coin);
        
        test_scenario::return_shared(global);
    };
    
    // Verify USER1 no longer has any USDC
    next_tx(&mut scenario, USER1);
    {
        // Check that there's no USDC coin in USER1's account
        assert!(!test_scenario::has_most_recent_for_address<Coin<MOCK_USDC>>(USER1));
    };
    
    test_scenario::end(scenario);
}
