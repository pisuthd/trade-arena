import { useState, useEffect, useCallback } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { usePrice, TokenType } from './usePrice';
import { DataAdapter } from '@/data/dataAdapter';

export interface WalletBalances {
  SUI: number;
  USDC: number;
  BTC: number;
}

export interface WalletBalanceState {
  balances: WalletBalances;
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

export function useWalletBalance() {
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const { convertToUSD, formatTokenAmount, formatUSD, getTokenEmoji } = usePrice();
  
  const [state, setState] = useState<WalletBalanceState>({
    balances: {
      SUI: 0,
      USDC: 0,
      BTC: 0,
    },
    loading: false,
    error: null,
    lastUpdated: null,
  });

  const [faucetLoading, setFaucetLoading] = useState(false);
  const [faucetError, setFaucetError] = useState<string | null>(null);

  // Fetch wallet balances
  const fetchBalances = useCallback(async () => {
    if (!account?.address) {
      setState(prev => ({
        ...prev,
        error: 'No wallet connected',
        loading: false,
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const balances = await DataAdapter.getWalletBalances(account.address);
      
      setState({
        balances,
        loading: false,
        error: null,
        lastUpdated: Date.now(),
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch balances',
      }));
    }
  }, [account?.address]);

  // Request mock USDC from faucet
  const requestMockUSDC = useCallback(async () => {
    if (!account?.address) {
      setFaucetError('No wallet connected');
      return false;
    }

    setFaucetLoading(true);
    setFaucetError(null);

    try {
      const success = await DataAdapter.requestMockUSDC(account.address, signAndExecuteTransaction);
      
      if (success) {
        // Refresh balances after successful faucet request
        await fetchBalances();
      }
      
      return success;
    } catch (error) {
      setFaucetError(error instanceof Error ? error.message : 'Failed to request USDC');
      return false;
    } finally {
      setFaucetLoading(false);
    }
  }, [account?.address, fetchBalances, signAndExecuteTransaction]);

  // Get balance info for a specific token
  const getTokenBalanceInfo = useCallback((tokenType: TokenType) => {
    const balance = state.balances[tokenType];
    const usdValue = convertToUSD(tokenType, balance);
    
    return {
      balance,
      formattedAmount: formatTokenAmount(tokenType, balance),
      usdValue,
      formattedUSD: formatUSD(usdValue),
      emoji: getTokenEmoji(tokenType),
    };
  }, [state.balances, convertToUSD, formatTokenAmount, formatUSD, getTokenEmoji]);

  // Auto-fetch balances on mount and account change
  useEffect(() => {
    if (account?.address) {
      fetchBalances();
    }
  }, [account?.address, fetchBalances]);

  // Set up periodic balance refresh (every 30 seconds)
  useEffect(() => {
    if (!account?.address) return;

    const interval = setInterval(() => {
      fetchBalances();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [account?.address, fetchBalances]);

  return {
    // State
    balances: state.balances,
    loading: state.loading,
    error: state.error,
    lastUpdated: state.lastUpdated,
    faucetLoading,
    faucetError,
    
    // Actions
    fetchBalances,
    requestMockUSDC,
    
    // Helpers
    getTokenBalanceInfo,
    
    // Computed
    hasBalances: Object.values(state.balances).some(balance => balance > 0),
    totalUSD: Object.entries(state.balances).reduce((total, [tokenType, balance]) => {
      return total + convertToUSD(tokenType as TokenType, balance);
    }, 0),
  };
}
