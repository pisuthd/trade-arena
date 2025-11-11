// SPDX-License-Identifier: MIT
#[test_only]
module trade_arena::calculator_tests {
    use sui::test_scenario;
    use sui::transfer;
    
    use trade_arena::calculator::{Self, Calculator};

    const ADMIN: address = @0xA;
    const USER: address = @0xB; 

    #[test]
    fun test_calculator_creation_and_initialization() {
        let mut scenario = test_scenario::begin(ADMIN);
        let ctx = test_scenario::ctx(&mut scenario);
        
        // Test creating a new calculator
        let calculator = calculator::new_calculator(ctx);
        
        // Verify initial result is 0
        let result = calculator::get_result(&calculator);
        assert!(result == 0, 0);
        
        // Clean up
        let final_result = calculator::destroy_calculator(calculator);
        assert!(final_result == 0, 1);
        
        test_scenario::end(scenario);
    }

    #[test]
    fun test_addition_operations() {
        let mut scenario = test_scenario::begin(ADMIN);
        let ctx = test_scenario::ctx(&mut scenario);
        
        let mut calculator = calculator::new_calculator(ctx);
        
        // Test adding positive numbers
        calculator::add(&mut calculator, 10);
        assert!(calculator::get_result(&calculator) == 10, 0);
        
        calculator::add(&mut calculator, 5);
        assert!(calculator::get_result(&calculator) == 15, 1);
        
        // Test adding zero
        calculator::add(&mut calculator, 0);
        assert!(calculator::get_result(&calculator) == 15, 2);
        
        // Test adding large numbers
        calculator::reset(&mut calculator);
        calculator::add(&mut calculator, 1000000);
        assert!(calculator::get_result(&calculator) == 1000000, 3);
        
        // Test multiple additions
        calculator::add(&mut calculator, 500000);
        calculator::add(&mut calculator, 250000);
        assert!(calculator::get_result(&calculator) == 1750000, 4);
        
        // Clean up
        let final_result = calculator::destroy_calculator(calculator);
        assert!(final_result == 1750000, 5);
        
        test_scenario::end(scenario);
    }

    #[test]
    fun test_subtraction_operations() {
        let mut scenario = test_scenario::begin(ADMIN);
        let ctx = test_scenario::ctx(&mut scenario);
        
        let mut calculator = calculator::new_calculator(ctx);
        
        // Set initial value
        calculator::add(&mut calculator, 100);
        
        // Test basic subtraction
        calculator::subtract(&mut calculator, 25);
        assert!(calculator::get_result(&calculator) == 75, 0);
        
        calculator::subtract(&mut calculator, 50);
        assert!(calculator::get_result(&calculator) == 25, 1);
        
        // Test subtracting zero
        calculator::subtract(&mut calculator, 0);
        assert!(calculator::get_result(&calculator) == 25, 2);
        
        // Test subtracting to get zero
        calculator::subtract(&mut calculator, 25);
        assert!(calculator::get_result(&calculator) == 0, 3);
        
        // Test large number subtraction
        calculator::add(&mut calculator, 1000000);
        calculator::subtract(&mut calculator, 750000);
        assert!(calculator::get_result(&calculator) == 250000, 4);
        
        // Clean up
        let final_result = calculator::destroy_calculator(calculator);
        assert!(final_result == 250000, 5);
        
        test_scenario::end(scenario);
    }

    #[test]
    fun test_multiplication_operations() {
        let mut scenario = test_scenario::begin(ADMIN);
        let ctx = test_scenario::ctx(&mut scenario);
        
        let mut calculator = calculator::new_calculator(ctx);
        
        // Test multiplying by 1 (should remain same)
        calculator::add(&mut calculator, 10);
        calculator::multiply(&mut calculator, 1);
        assert!(calculator::get_result(&calculator) == 10, 0);
        
        // Test basic multiplication
        calculator::multiply(&mut calculator, 5);
        assert!(calculator::get_result(&calculator) == 50, 1);
        
        // Test multiplying by 0 (should result in 0)
        calculator::multiply(&mut calculator, 0);
        assert!(calculator::get_result(&calculator) == 0, 2);
        
        // Test multiplying from zero
        calculator::multiply(&mut calculator, 100);
        assert!(calculator::get_result(&calculator) == 0, 3);
        
        // Test large number multiplication
        calculator::reset(&mut calculator);
        calculator::add(&mut calculator, 1000);
        calculator::multiply(&mut calculator, 1000);
        assert!(calculator::get_result(&calculator) == 1000000, 4);
        
        // Test multiple multiplications
        calculator::multiply(&mut calculator, 2);
        calculator::multiply(&mut calculator, 3);
        assert!(calculator::get_result(&calculator) == 6000000, 5);
        
        // Clean up
        let final_result = calculator::destroy_calculator(calculator);
        assert!(final_result == 6000000, 6);
        
        test_scenario::end(scenario);
    }

    #[test]
    fun test_division_operations() {
        let mut scenario = test_scenario::begin(ADMIN);
        let ctx = test_scenario::ctx(&mut scenario);
        
        let mut calculator = calculator::new_calculator(ctx);
        
        // Set initial value
        calculator::add(&mut calculator, 100);
        
        // Test basic division
        calculator::divide(&mut calculator, 2);
        assert!(calculator::get_result(&calculator) == 50, 0);
        
        calculator::divide(&mut calculator, 5);
        assert!(calculator::get_result(&calculator) == 10, 1);
        
        // Test dividing by 1 (should remain same)
        calculator::divide(&mut calculator, 1);
        assert!(calculator::get_result(&calculator) == 10, 2);
        
        // Test division with remainder (integer division)
        calculator::add(&mut calculator, 5); // result is now 15
        calculator::divide(&mut calculator, 4);
        assert!(calculator::get_result(&calculator) == 3, 3); // 15 / 4 = 3 (integer division)
        
        // Test large number division
        calculator::reset(&mut calculator);
        calculator::add(&mut calculator, 1000000);
        calculator::divide(&mut calculator, 1000);
        assert!(calculator::get_result(&calculator) == 1000, 4);
        
        // Test multiple divisions
        calculator::divide(&mut calculator, 10);
        calculator::divide(&mut calculator, 5);
        assert!(calculator::get_result(&calculator) == 20, 5);
        
        // Clean up
        let final_result = calculator::destroy_calculator(calculator);
        assert!(final_result == 20, 6);
        
        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = trade_arena::calculator::EDIVISION_BY_ZERO)]
    fun test_division_by_zero_error() {
        let mut scenario = test_scenario::begin(ADMIN);
        let ctx = test_scenario::ctx(&mut scenario);
        
        let mut calculator = calculator::new_calculator(ctx);
        
        // Set initial value
        calculator::add(&mut calculator, 10);
        
        // This should abort with EDIVISION_BY_ZERO
        calculator::divide(&mut calculator, 0);
        
        test_scenario::end(scenario);
    }

    #[test]
    fun test_reset_functionality() {
        let mut scenario = test_scenario::begin(ADMIN);
        let ctx = test_scenario::ctx(&mut scenario);
        
        let mut calculator = calculator::new_calculator(ctx);
        
        // Perform some operations
        calculator::add(&mut calculator, 100);
        calculator::multiply(&mut calculator, 5);
        calculator::subtract(&mut calculator, 50);
        calculator::divide(&mut calculator, 2);
        
        // Verify result is not zero
        let result_before_reset = calculator::get_result(&calculator);
        assert!(result_before_reset > 0, 0);
        
        // Reset and verify result is zero
        calculator::reset(&mut calculator);
        assert!(calculator::get_result(&calculator) == 0, 1);
        
        // Test that operations work after reset
        calculator::add(&mut calculator, 25);
        assert!(calculator::get_result(&calculator) == 25, 2);
        
        // Clean up
        let final_result = calculator::destroy_calculator(calculator);
        assert!(final_result == 25, 3);
        
        test_scenario::end(scenario);
    } 
}
