module trade_arena::mock_btc {
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Supply};
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::TxContext;
    use std::option;

    /// Mock BTC token for testing
    public struct MOCK_BTC has drop {}

    /// Global state for the mock BTC token
    public struct BTCGlobal has key {
        id: UID,
        supply: Supply<MOCK_BTC>
    }

    /// Initialize the mock BTC token
    fun init(witness: MOCK_BTC, ctx: &mut TxContext) {
        let (treasury_cap, metadata) = coin::create_currency<MOCK_BTC>(
            witness,
            8, // 8 decimals like real BTC
            b"MOCK BTC TOKEN",
            b"MOCK-BTC",
            b"",
            option::none(),
            ctx
        );
        
        transfer::public_freeze_object(metadata);
        transfer::share_object(BTCGlobal {
            id: object::new(ctx),
            supply: coin::treasury_into_supply(treasury_cap)
        });
    }

    /// Mint mock BTC tokens
    public fun mint(
        global: &mut BTCGlobal, 
        amount: u64, 
        recipient: address, 
        ctx: &mut TxContext
    ) {
        let minted_balance = balance::increase_supply(&mut global.supply, amount);
        transfer::public_transfer(coin::from_balance(minted_balance, ctx), recipient);
    }

    /// Burn mock BTC tokens
    public fun burn(global: &mut BTCGlobal, coin: Coin<MOCK_BTC>) {
        balance::decrease_supply(&mut global.supply, coin::into_balance(coin));
    }

    /// Get the total supply
    public fun total_supply(global: &BTCGlobal): u64 {
        balance::supply_value(&global.supply)
    }

    #[test_only]
    public fun test_init(ctx: &mut TxContext) {
        init(MOCK_BTC {}, ctx)
    }

    #[test_only]
    public fun mint_for_testing(
        global: &mut BTCGlobal, 
        amount: u64, 
        ctx: &mut TxContext
    ): Coin<MOCK_BTC> {
        let minted_balance = balance::increase_supply(&mut global.supply, amount);
        coin::from_balance(minted_balance, ctx)
    }
}
