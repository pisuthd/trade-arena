// Mock USDC for testing

module trade_arena::mock_usdc {

    use sui::coin::{Self, Coin };
    use sui::balance::{ Self, Supply };
    use sui::object::UID;
    use std::option;
    use sui::transfer;
    use sui::tx_context::TxContext;

    public struct MOCK_USDC has drop {}

    public struct USDCGlobal has key {
        id: UID,
        supply: Supply<MOCK_USDC>
    }

    fun init(witness: MOCK_USDC, ctx: &mut TxContext) {
        let (treasury_cap, metadata) = coin::create_currency<MOCK_USDC>(witness, 6, b"MOCK USDC TOKEN", b"MOCK-USDC", b"", option::none(), ctx);
        transfer::public_freeze_object(metadata);
        
        transfer::share_object(USDCGlobal {
            id: object::new(ctx),
            supply: coin::treasury_into_supply<MOCK_USDC>(treasury_cap)
        })
    }

    public fun mint(
        global: &mut USDCGlobal, amount: u64, recipient: address, ctx: &mut TxContext
    ) {
        let minted_balance = balance::increase_supply<MOCK_USDC>(&mut global.supply, amount);
        transfer::public_transfer(coin::from_balance(minted_balance, ctx), recipient);
    }

    public fun burn(global: &mut USDCGlobal, coin: Coin<MOCK_USDC>) {
        balance::decrease_supply(&mut global.supply, coin::into_balance(coin));
    }

    #[test_only]
    /// Wrapper of module initializer for testing
    public fun test_init(ctx: &mut TxContext) {
        init(MOCK_USDC {}, ctx)
    }

    #[test_only]
    /// Mint for testing - returns the coin instead of transferring
    public fun mint_for_testing(
        global: &mut USDCGlobal, amount: u64, ctx: &mut TxContext
    ): Coin<MOCK_USDC> {
        let minted_balance = balance::increase_supply<MOCK_USDC>(&mut global.supply, amount);
        coin::from_balance(minted_balance, ctx)
    }

}
