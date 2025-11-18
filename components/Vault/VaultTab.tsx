import React from 'react';
import { MetricCard } from '../UI';
import AssetAllocation from './AssetAllocation';

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
          title="Total Value Locked"
          value={formatCurrency(model.tvl)}
          trend={{ value: '+12.5% this week', color: 'text-green-400' }}
        />
        <MetricCard
          title="Total Depositors"
          value={Math.floor(model.tvl / 2500)}
          trend={{ value: '+3 today', color: 'text-blue-400' }}
        />
        <MetricCard
          title="Current APY"
          value={`${(45.2 - (season.aiModels?.findIndex((m: any) => m.name === model.name) || 0) * 8).toFixed(1)}%`}
          subtitle="Annualized"
          className="text-green-400"
        />
        <MetricCard
          title="Your Share"
          value="0.00%"
          subtitle="Connect wallet"
        />
      </div>

      {/* Vault Performance & Risk Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-700/50 p-4 rounded-lg">
          <h4 className="font-semibold mb-3">Performance Metrics</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Total Return</span>
              <span className="font-semibold text-green-400">+0%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Win Rate</span>
              <span className="font-semibold">{tradeMetrics.winRate}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Sharpe Ratio</span>
              <span className="font-semibold">{tradeMetrics.sharpeRatio.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Avg Daily Return</span>
              <span className="font-semibold text-green-400">
                +{((45.2 - (season.aiModels?.findIndex((m: any) => m.name === model.name) || 0) * 8) / 365).toFixed(3)}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-700/50 p-4 rounded-lg">
          <h4 className="font-semibold mb-3">Risk Metrics</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Max Drawdown</span>
              <span className="font-semibold text-red-400">{tradeMetrics.maxDrawdown.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Volatility</span>
              <span className="font-semibold">
                {(12.5 + (season.aiModels?.findIndex((m: any) => m.name === model.name) || 0) * 3.1).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Risk Score</span>
              <span className="font-semibold text-yellow-400">
                {3 + (season.aiModels?.findIndex((m: any) => m.name === model.name) || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Beta</span>
              <span className="font-semibold">
                {(0.8 + (season.aiModels?.findIndex((m: any) => m.name === model.name) || 0) * 0.1).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <AssetAllocation
        assetAllocation={assetAllocation}
        tradeMetrics={tradeMetrics}
      />
    </div>
  );
}
