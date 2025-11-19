import React from 'react';
import { MetricCard } from '../UI';
import { VaultTab } from '../Vault';
import { TradesTab } from '../Trades';
import { PerformanceTab } from '../Performance';
import OverviewTab from './OverviewTab';

interface AIModelContentProps {
  model: any;
  season: any;
  activeContentTab: string;
  vaultData: any;
  assetAllocation: {
    usdcPercentage: number;
    btcPercentage: number;
  };
  tradeMetrics: any;
  formatCurrency: (value: number) => string;
  handleDeposit: (model: any) => void;
  handleWithdraw: (model: any) => void;
  handleContentTabClick: (tab: string) => void;
}

export default function AIModelContent({ 
  model, 
  season, 
  activeContentTab, 
  vaultData, 
  assetAllocation, 
  tradeMetrics, 
  formatCurrency, 
  handleDeposit, 
  handleWithdraw, 
  handleContentTabClick 
}: AIModelContentProps) {

 

  return (
    <div key={model.name}>
      {/* Model Stats Row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Total Value Locked"
          value={formatCurrency(model.tvl)}
        />
        <MetricCard
          title="Total Trades"
          value={tradeMetrics.totalTrades}
        />
        
        <MetricCard
          title="PnL"
          value={formatCurrency(model.pnl || 0)}
          className={model.pnl >= 0 ? "text-green-400" : "text-red-400"}
        />
        <MetricCard
          title="PnL %"
          value={`${(model.pnlPercentage || 0).toFixed(2)}%`}
          className={model.pnlPercentage >= 0 ? "text-green-400" : "text-red-400"}
        />
        {/* <MetricCard
          title="Win Rate"
          value={`${model.winRate || 0}%`}
          className="text-blue-400"
        /> */}
      </div>

      {/* Content Tabs */}
      <div className="flex border-b border-gray-700 mb-4">
        {['vault', 'trades', 'performance'].map((tab) => (
          <button
            key={tab}
            onClick={() => handleContentTabClick(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
              activeContentTab === tab
                ? 'text-[#00ff88] border-b-2 border-[#00ff88]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {/* {activeContentTab === 'overview' && (
          <OverviewTab
            model={model}
            tradeMetrics={tradeMetrics}
            formatCurrency={formatCurrency}
          />
        )} */}

        {activeContentTab === 'vault' && (
          <VaultTab
            model={model}
            season={season}
            vaultData={vaultData}
            assetAllocation={assetAllocation}
            tradeMetrics={tradeMetrics}
            formatCurrency={formatCurrency}
            handleDeposit={handleDeposit}
            handleWithdraw={handleWithdraw}
          />
        )}

        {activeContentTab === 'trades' && (
          <TradesTab
            vaultData={vaultData}
            formatCurrency={formatCurrency}
            formatTradeTime={(timestamp: string) => {
              const ts = parseInt(timestamp);
              const date = new Date(ts / 1000);
              const now = new Date();
              const diffMs = now.getTime() - date.getTime();
              const diffMins = Math.floor(diffMs / (1000 * 60));
              const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
              const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
              
              if (diffMins < 60) return `${diffMins} min ago`;
              if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
              return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
            }}
          />
        )}

        {activeContentTab === 'performance' && (
          <PerformanceTab
            model={model}
            formatCurrency={formatCurrency}
          />
        )}
      </div>
    </div>
  );
}
