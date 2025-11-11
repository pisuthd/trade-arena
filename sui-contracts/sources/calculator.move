/// Module: trade_arena 
module trade_arena::calculator {
     

    /// Error codes
    const EDIVISION_BY_ZERO: u64 = 0;

    /// Calculator struct that holds the current result
    public struct Calculator has key, store {
        id: UID,
        result: u64,
    }

    /// Create a new calculator with initial result of 0
    public fun new_calculator(ctx: &mut TxContext): Calculator {
        Calculator {
            id: object::new(ctx),
            result: 0,
        }
    }

    /// Add a value to the current result
    public fun add(calculator: &mut Calculator, value: u64) {
        calculator.result = calculator.result + value;
    }

    /// Subtract a value from the current result
    public fun subtract(calculator: &mut Calculator, value: u64) {
        calculator.result = calculator.result - value;
    }

    /// Multiply the current result by a value
    public fun multiply(calculator: &mut Calculator, value: u64) {
        calculator.result = calculator.result * value;
    }

    /// Divide the current result by a value
    /// Aborts with EDIVISION_BY_ZERO if value is 0
    public fun divide(calculator: &mut Calculator, value: u64) {
        if (value == 0) {
            abort EDIVISION_BY_ZERO
        };
        calculator.result = calculator.result / value;
    }

    /// Get the current result
    public fun get_result(calculator: &Calculator): u64 {
        calculator.result
    }

    /// Reset the calculator result to 0
    public fun reset(calculator: &mut Calculator) {
        calculator.result = 0;
    }

    /// Destroy the calculator and return the final result (for testing)
    public fun destroy_calculator(calculator: Calculator): u64 {
        let Calculator { id, result } = calculator;
        object::delete(id);
        result
    }

    /// Initialize and share a calculator for everyone to use
    fun init(ctx: &mut TxContext) {
        let calculator = new_calculator(ctx);
        transfer::share_object(calculator);
    }
}
