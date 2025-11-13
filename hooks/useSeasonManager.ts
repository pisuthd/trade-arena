"use client"

import { useCurrentAccount, useSuiClient, useSuiClientQuery } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';

// Contract constants
const SEASON_GLOBAL_ID = '0x323afc98c387c70f9bc8528d7355aa7e520c352778c2406f15962f6e064bb9da';
const MIN_USER_DEPOSIT = 10_000_000; // 10 USDC (6 decimals)

// Types
export interface VaultBalance {
  usdc_balance: number;
  btc_balance: number;
  lp_supply: number;
}

export interface SeasonInfo {
  season_number: number;
  status: number; // 0 = Pre-Season, 1 = Active, 2 = Ended
  ai_models: Array<{
    name: string;
    wallet_address: string;
  }>;
  created_at: number;
  started_at: number;
  ended_at: number;
  total_trades: number;
  total_volume: number;
}

export interface VaultInfo {
  ai_name: string;
  balances: VaultBalance;
  tvl: number;
  depositors: number;
  apy: number;
}

// Hook to get current season info
export function useCurrentSeason(seasonNumber: number = 1) {
  const suiClient = useSuiClient();
  
  return useSuiClientQuery('getObject', {
    id: SEASON_GLOBAL_ID,
    options: {
      showContent: true,
      showType: true,
    },
  });
}

// Hook to get vault balance
export function useVaultBalance(seasonNumber: number, aiName: string) {
  const suiClient = useSuiClient();
  
  return useSuiClientQuery('getDynamicFields', {
    parentId: SEASON_GLOBAL_ID,
  });
}

// Hook to get user's LP tokens
export function useUserLPTokens(userAddress?: string) {
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();
  
  return useSuiClientQuery('getOwnedObjects', {
    owner: userAddress || currentAccount?.address || '',
    filter: {
      StructType: 'trade_arena::season_manager::VaultShare<String>',
    },
    options: {
      showContent: true,
      showType: true,
    },
  });
}

// Hook for depositing to vault
export function useDepositToVault() {
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();

  const depositToVault = async (
    seasonNumber: number,
    aiName: string,
    amount: number
  ) => {
    if (!currentAccount?.address) {
      throw new Error('Wallet not connected');
    }

    try {
      const tx = new Transaction();
      
      // Add deposit_to_vault call
      tx.moveCall({
        target: `${SEASON_GLOBAL_ID}::season_manager::deposit_to_vault`,
        arguments: [
          tx.object(SEASON_GLOBAL_ID),
          tx.pure.u64(seasonNumber),
          tx.pure.string(aiName),
          tx.splitCoins(tx.gas, [amount]), // USDC amount
          tx.object('0x6'), // Clock object
        ],
        typeArguments: ['trade_arena::mock_usdc::MOCK_USDC'],
      });

      const result = await suiClient.signAndExecuteTransaction({
        transaction: tx,
        signer: currentAccount as any,
      });

      return result;
    } catch (error) {
      console.error('Deposit failed:', error);
      throw error;
    }
  };

  return { depositToVault };
}

// Hook for withdrawing from vault
export function useWithdrawFromVault() {
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();

  const withdrawFromVault = async (
    seasonNumber: number,
    aiName: string,
    lpTokenId: string
  ) => {
    if (!currentAccount?.address) {
      throw new Error('Wallet not connected');
    }

    try {
      const tx = new Transaction();
      
      // Add withdraw_from_vault call
      tx.moveCall({
        target: `${SEASON_GLOBAL_ID}::season_manager::withdraw_from_vault`,
        arguments: [
          tx.object(SEASON_GLOBAL_ID),
          tx.pure.u64(seasonNumber),
          tx.pure.string(aiName),
          tx.object(lpTokenId), // LP token object
        ],
      });

      const result = await suiClient.signAndExecuteTransaction({
        transaction: tx,
        signer: currentAccount as any,
      });

      return result;
    } catch (error) {
      console.error('Withdrawal failed:', error);
      throw error;
    }
  };

  return { withdrawFromVault };
}

// Helper functions
export const formatUSDC = (amount: number) => {
  return (amount / 1_000_000).toFixed(2);
};

export const formatBTC = (amount: number) => {
  return (amount / 1_000_000_000).toFixed(8);
};

export const getSeasonStatusText = (status: number) => {
  switch (status) {
    case 0:
      return { text: 'Pre-Season', color: 'text-blue-400', bg: 'bg-blue-400/10' };
    case 1:
      return { text: 'Active', color: 'text-green-400', bg: 'bg-green-400/10' };
    case 2:
      return { text: 'Ended', color: 'text-red-400', bg: 'bg-red-400/10' };
    default:
      return { text: 'Unknown', color: 'text-gray-400', bg: 'bg-gray-400/10' };
  }
};

export const canDeposit = (status: number) => status === 0; // Pre-Season only
export const canWithdraw = (status: number) => status === 2; // Ended only
