// Smart contract addresses and configuration for Sui Testnet
export const CONTRACT_ADDRESSES = {
  // Package
  TRADE_ARENA_PACKAGE: '0xa51f1f51ae2e6aa8cc88a1221c4e9da644faccdcd87dde9d2858e042634d285f',
  
  // DEX
  DEX_GLOBAL: '0xe01a60f171b371a10141476fe421c566bb21d52f1924797fcd44a07d9e9d355b',
  DEX_GLOBAL_MANAGER_CAP: '0xb13f92d70cf5ede40b565fdf7752db80caae340889f604b0ab9e4f0b6eda4185',
  
  // Season Manager
  SEASON_GLOBAL: '0x323afc98c387c70f9bc8528d7355aa7e520c352778c2406f15962f6e064bb9da',
  SEASON_GLOBAL_MANAGER_CAP: '0x7f79dda7c5dda63c2a61396b64b7b1c19a40057f6730ae7bc942c893ddc701a3',
  
  // Mock Tokens
  MOCK_USDC_TYPE: '0xa51f1f51ae2e6aa8cc88a1221c4e9da644faccdcd87dde9d2858e042634d285f::mock_usdc::MOCK_USDC',
  MOCK_BTC_TYPE: '0xa51f1f51ae2e6aa8cc88a1221c4e9da644faccdcd87dde9d2858e042634d285f::mock_btc::MOCK_BTC',
  USDC_GLOBAL: '0x1837c2490e780e27f3892ac5a30f241bd4081f80261815f2f381179176327fa1',
  BTC_GLOBAL: '0x632832dd0857cd6edbdcff08a93b6e74d73ef7dabddf7d973c705d3fa31c26db',
  
  // System
  CLOCK: '0x6',
} as const;

// Helper function to get contract function targets
export const CONTRACT_TARGETS = {
  // Season Manager functions
  DEPOSIT_TO_VAULT: `${CONTRACT_ADDRESSES.TRADE_ARENA_PACKAGE}::season_manager::deposit_to_vault`,
  WITHDRAW_FROM_VAULT: `${CONTRACT_ADDRESSES.TRADE_ARENA_PACKAGE}::season_manager::withdraw_from_vault`,
  
  // Mock USDC functions
  MINT_USDC: `${CONTRACT_ADDRESSES.TRADE_ARENA_PACKAGE}::mock_usdc::mint`,
  
  // Mock BTC functions
  MINT_BTC: `${CONTRACT_ADDRESSES.TRADE_ARENA_PACKAGE}::mock_btc::mint`,
} as const;

// Gas configuration
export const GAS_CONFIG = {
  DEFAULT_BUDGET: 10000000, // 0.01 SUI
  HIGH_BUDGET: 50000000,   // 0.05 SUI for complex transactions
} as const;

// Token decimals
export const TOKEN_DECIMALS = {
  USDC: 6,
  BTC: 8,
  SUI: 9,
} as const;

// Helper functions for token conversions
export const convertToDecimals = (amount: number, token: 'USDC' | 'BTC' | 'SUI'): number => {
  const decimals = TOKEN_DECIMALS[token];
  return Math.floor(amount * Math.pow(10, decimals));
};

export const convertFromDecimals = (amount: number, token: 'USDC' | 'BTC' | 'SUI'): number => {
  const decimals = TOKEN_DECIMALS[token];
  return amount / Math.pow(10, decimals);
};

// Type guards and utilities
export const isMockUSDCToken = (tokenType: string): boolean => {
  return tokenType === CONTRACT_ADDRESSES.MOCK_USDC_TYPE;
};

export const isMockBTCToken = (tokenType: string): boolean => {
  return tokenType === CONTRACT_ADDRESSES.MOCK_BTC_TYPE;
};

export const getTokenType = (token: 'USDC' | 'BTC'): string => {
  switch (token) {
    case 'USDC':
      return CONTRACT_ADDRESSES.MOCK_USDC_TYPE;
    case 'BTC':
      return CONTRACT_ADDRESSES.MOCK_BTC_TYPE;
    default:
      throw new Error(`Unsupported token type: ${token}`);
  }
};
