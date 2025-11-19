import React from 'react';
import { MetricCard } from '../UI';
import AssetAllocation from './AssetAllocation';
import { convertFromDecimals } from '../../config/contracts';

interface VaultTabProps {
  model: any;
  season: any;
  vaultData: any;
  assetAllocation: {
    usdcPercentage: number;
    btcPercentage: number;
  };
  tradeMetrics: any;
  formatCurrency: (value: number) => string;
  handleDeposit: (model: any) => void;
  handleWithdraw: (model: any) => void;
}

export default function VaultTab({ 
  model, 
  season, 
  vaultData, 
  assetAllocation, 
  tradeMetrics, 
  formatCurrency, 
  handleDeposit, 
  handleWithdraw 
}: VaultTabProps) {
 

  return (
    <div className="space-y-6">
      {/* Vault Actions Section */}
      <div className="bg-gray-700/50 p-4 rounded-lg">
        <h4 className="font-semibold mb-2">Vault Information</h4>
        <p className="text-gray-400 text-sm mb-4">
          This vault allows users to deposit funds that will be automatically traded by AI model.
          All profits and losses are shared proportionally among depositors.
        </p>
        <div className="flex space-x-3">
          {season.status === 'pre-season' && (
            <button
              onClick={() => handleDeposit(model)}
              className="bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-black font-semibold px-6 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              Deposit to Vault
            </button>
          )}

          {season.status === 'active' && (
            <button
              disabled
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold px-6 py-2 rounded-lg opacity-75 cursor-not-allowed"
            >
              Trading in Progress
            </button>
          )}

          {season.status === 'ended' && (
            <button
              onClick={() => handleWithdraw(model)}
              className="bg-gradient-to-r from-[#ff6b00] to-[#ff00ff] text-white font-semibold px-6 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              Withdraw Funds
            </button>
          )}
        </div>
      </div>

      {/* Vault Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Initial Deposit"
          value={vaultData?.btc_balance > 0 ? "$3,000" : "$0"}
          className="text-gray-300"
        />
        <MetricCard
          title="Win Rate"
          value={`${model.winRate || 0}%`}
          className="text-green-400"
        />
        <MetricCard
          title="USDC Balance"
          value={vaultData?.usdc_balance ? formatCurrency(convertFromDecimals(vaultData.usdc_balance, 'USDC')) : "$0"}
          className="text-blue-400"
        />
        <MetricCard
          title="BTC Balance"
          value={vaultData?.btc_balance ? `${convertFromDecimals(vaultData.btc_balance, 'BTC').toFixed(8)} BTC` : "0 BTC"}
          className="text-orange-400"
        />
      </div>


      <AssetAllocation
        assetAllocation={assetAllocation}
        tradeMetrics={tradeMetrics}
      />
    </div>
  );
}
