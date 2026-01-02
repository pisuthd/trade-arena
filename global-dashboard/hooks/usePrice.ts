import { useMemo } from 'react';

// Hardcoded price configuration
export const PRICES = {
  SUI: 2.00,      // $2.00 USD
  USDC: 1.00,     // $1.00 USD (stablecoin)
  BTC: 100000,    // $100,000 USD
} as const;

export type TokenType = keyof typeof PRICES;

export interface PriceInfo {
  price: number;
  symbol: string;
  decimals: number;
}

export const TOKEN_INFO: Record<TokenType, PriceInfo> = {
  SUI: {
    price: PRICES.SUI,
    symbol: 'SUI',
    decimals: 9, // SUI uses 9 decimals
  },
  USDC: {
    price: PRICES.USDC,
    symbol: 'USDC',
    decimals: 6, // USDC uses 6 decimals
  },
  BTC: {
    price: PRICES.BTC,
    symbol: 'BTC',
    decimals: 8, // BTC uses 8 decimals
  },
};

export function usePrice() {
  // Convert token amount to USD equivalent
  const convertToUSD = (tokenType: TokenType, amount: number): number => {
    const info = TOKEN_INFO[tokenType];
    const decimalAmount = amount / Math.pow(10, info.decimals);
    return decimalAmount * info.price;
  };

  // Format token amount for display
  const formatTokenAmount = (tokenType: TokenType, amount: number): string => {
    const info = TOKEN_INFO[tokenType];
    const decimalAmount = amount / Math.pow(10, info.decimals);
    
    switch (tokenType) {
      case 'SUI':
        return decimalAmount.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 4,
        });
      case 'USDC':
        return decimalAmount.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      case 'BTC':
        return decimalAmount.toLocaleString('en-US', {
          minimumFractionDigits: 4,
          maximumFractionDigits: 8,
        });
      default:
        return decimalAmount.toString();
    }
  };

  // Format USD amount for display
  const formatUSD = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Get token emoji/icon
  const getTokenEmoji = (tokenType: TokenType): string => {
    const emojis = {
      SUI: '🪙',
      USDC: '💵',
      BTC: '₿',
    };
    return emojis[tokenType];
  };

  // Get all token prices
  const prices = useMemo(() => PRICES, []);

  return {
    prices,
    convertToUSD,
    formatTokenAmount,
    formatUSD,
    getTokenEmoji,
    TOKEN_INFO,
  };
}
