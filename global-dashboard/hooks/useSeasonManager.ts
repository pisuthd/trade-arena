"use client"

import { useCurrentAccount, useSuiClient, useSuiClientQuery, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { CONTRACT_ADDRESSES, CONTRACT_TARGETS, GAS_CONFIG, convertToDecimals } from '../config/contracts';
import { DataAdapter } from '../data/dataAdapter';

// Contract constants
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
    id: CONTRACT_ADDRESSES.SEASON_GLOBAL,
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
    parentId: CONTRACT_ADDRESSES.SEASON_GLOBAL,
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

// Hook to get user's USDC balance
export function useUserUSDCBalance(userAddress?: string) {
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();

  return useSuiClientQuery('getBalance', {
    owner: userAddress || currentAccount?.address || '',
    coinType: CONTRACT_ADDRESSES.MOCK_USDC_TYPE,
  });
}

// Hook for depositing to vault
export function useDepositToVault() {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const depositToVault = async (
    seasonNumber: number,
    aiName: string,
    amount: number
  ) => {
    if (!currentAccount?.address) {
      throw new Error('Wallet not connected');
    }

    // Validate AI model name and ensure we're using the contract name
    if (!DataAdapter.isValidContractModelName(aiName)) {
      throw new Error(`Invalid AI model name: ${aiName}. Valid names are: CLAUDE, NOVA, LLAMA`);
    }

    // Ensure we're using the contract name (short name) for the transaction
    const contractModelName = aiName.toUpperCase(); // Ensure it's in the correct format
    console.log("Using contract model name:", contractModelName);

    // Convert amount to 6 decimals for USDC
    const amountInDecimals = convertToDecimals(amount, 'USDC');

    try {
      // Get user's USDC coins
      const allCoins = await suiClient.getCoins({
        owner: currentAccount.address,
        coinType: CONTRACT_ADDRESSES.MOCK_USDC_TYPE,
      });

      if (allCoins.data.length === 0) {
        throw new Error('No USDC coins found in wallet');
      }

      // Check if balance is sufficient
      const totalBalance = allCoins.data.reduce(
        (sum, coin) => sum + Number(coin.balance),
        0
      );

      if (totalBalance < amountInDecimals) {
        throw new Error(`Insufficient USDC balance. Available: ${(totalBalance / 1_000_000).toFixed(2)}, Required: ${amount}`);
      }

      const tx = new Transaction();
      tx.setGasBudget(GAS_CONFIG.DEFAULT_BUDGET);

      // Get the main coin and rest coins for merging
      const [mainCoin, ...restCoins] = allCoins.data;

      // Merge all USDC coins into the main coin
      if (restCoins.length > 0) {
        tx.mergeCoins(
          tx.object(mainCoin.coinObjectId),
          restCoins.map((coin) => tx.object(coin.coinObjectId)),
        );
      }

      // Split the exact amount needed for deposit 
      const [depositCoin] = tx.splitCoins(mainCoin.coinObjectId, [amountInDecimals]);

      // Add deposit_to_vault call
      tx.moveCall({
        target: CONTRACT_TARGETS.DEPOSIT_TO_VAULT,
        arguments: [
          tx.object(CONTRACT_ADDRESSES.SEASON_GLOBAL),
          tx.pure.u64(seasonNumber),
          tx.pure.string(contractModelName),
          depositCoin, // Use the split coin 
          tx.object(CONTRACT_ADDRESSES.CLOCK), // Clock object 
        ]
      });

      const result = await signAndExecuteTransaction({
        transaction: tx
      });

      // Check transaction status - new version returns digest for successful transactions
      // If there's a digest, the transaction was successful
      if (!result.digest) {
        throw new Error('Transaction failed - no digest returned');
      }

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
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const withdrawFromVault = async (
    seasonNumber: number,
    aiName: string,
    lpTokenId: string
  ) => {
    if (!currentAccount?.address) {
      throw new Error('Wallet not connected');
    }

    // Validate AI model name and ensure we're using the contract name
    if (!DataAdapter.isValidContractModelName(aiName)) {
      throw new Error(`Invalid AI model name: ${aiName}. Valid names are: CLAUDE, NOVA, LLAMA`);
    }

    // Ensure we're using the contract name (short name) for the transaction
    const contractModelName = aiName.toUpperCase(); // Ensure it's in correct format
    console.log("Using contract model name for withdrawal:", contractModelName);

    try {
      const tx = new Transaction();
      tx.setGasBudget(GAS_CONFIG.DEFAULT_BUDGET);

      // Add withdraw_from_vault call
      tx.moveCall({
        target: CONTRACT_TARGETS.WITHDRAW_FROM_VAULT,
        arguments: [
          tx.object(CONTRACT_ADDRESSES.SEASON_GLOBAL),
          tx.pure.u64(seasonNumber),
          tx.pure.string(contractModelName),
          tx.object(lpTokenId), // LP token object
        ],
      });

      const result = await signAndExecuteTransaction({
        transaction: tx,
      });

      // Check transaction status - new version returns digest for successful transactions
      // If there's a digest, the transaction was successful
      if (!result.digest) {
        throw new Error('Transaction failed - no digest returned');
      }

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
