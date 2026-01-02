import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, ChevronDown, ChevronUp } from 'lucide-react';
import { StatusBadge } from '../UI';
import SeasonOverview from './SeasonOverview';
import AIModelTabs from './AIModelTabs';
import AIModelContent from './AIModelContent';

interface SeasonCardProps {
  season: any;
  expandedSeason: number | null;
  activeModel: string | null;
  activeContentTab: string;
  formatCurrency: (value: number) => string;
  formatDate: (dateString: string | null) => string;
  getModelEmoji: (modelName: string) => string;
  getVaultData: (modelName: string, season: any) => any;
  calculateAssetAllocation: (vaultData: any, btcPrice: number) => { usdcPercentage: number; btcPercentage: number };
  processTradeHistory: (tradeHistory: any[]) => any;
  btcPrice: number;
  onToggleExpand: (seasonId: number) => void;
  onModelClick: (modelName: string) => void;
  onContentTabClick: (tab: string) => void;
  onDeposit: (model: any) => void;
  onWithdraw: (model: any) => void;
}

export default function SeasonCard({
  season,
  expandedSeason,
  activeModel,
  activeContentTab,
  formatCurrency,
  formatDate,
  getModelEmoji,
  getVaultData,
  calculateAssetAllocation,
  processTradeHistory,
  btcPrice,
  onToggleExpand,
  onModelClick,
  onContentTabClick,
  onDeposit,
  onWithdraw
}: SeasonCardProps) {
  const isExpanded = expandedSeason === season.id;
 
  return (
    <div className="border border-gray-800 rounded-xl overflow-hidden bg-gray-900/50">
      {/* Season Header */}
      <div
        className="p-6 cursor-pointer hover:bg-gray-800/50 transition-colors"
        onClick={() => onToggleExpand(season.id)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <Trophy className="w-8 h-8 text-yellow-400" />
              <div>
                <h2 className="text-xl font-bold">Season {season.seasonNumber}</h2>
                <p className="text-sm text-gray-400">{season.title}</p>
              </div>
            </div>

            <StatusBadge
              type="season"
              status={season.status}
            />
          </div>

          <div className="flex items-center space-x-8">
            <div className="text-right">
              <p className="text-sm text-gray-400">Total Volume</p>
              <p className="text-xl font-bold">{formatCurrency(season.totalVolume)}</p>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-400">Total Trades</p>
              <p className="text-xl font-bold">{season.totalTrades.toLocaleString()}</p>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-400">AI Models</p>
              <p className="text-xl font-bold">{season.aiModels.length}</p>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-400">Current Value</p>
              <p className="text-xl font-bold">{formatCurrency(season.metrics.totalTVL)}</p>
            </div>

            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-gray-800"
        >
          <div className="p-6">
            <SeasonOverview
              season={season}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
            />

            {/* AI Models Performance with Tabs Layout */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">AI Models Performance</h3>

              <div className="bg-gray-800/50 rounded-xl overflow-hidden">
                <AIModelTabs
                  aiModels={season.aiModels}
                  activeModel={activeModel}
                  onModelClick={onModelClick}
                  getModelEmoji={getModelEmoji}
                />

                {/* Tab Content for Active Model */}
                <div className="p-6">
                  {season.aiModels.map((model: any) => {
                    const isActive = activeModel === model.name;

                    if (!isActive) return null;

                    const vaultData = getVaultData(model.name, season);
                    const assetAllocation = calculateAssetAllocation(vaultData, btcPrice);
                    const tradeMetrics = processTradeHistory(vaultData?.trade_history || []);

                    return (
                      <AIModelContent
                        key={model.name}
                        model={model}
                        season={season}
                        activeContentTab={activeContentTab}
                        vaultData={vaultData}
                        assetAllocation={assetAllocation}
                        tradeMetrics={tradeMetrics}
                        formatCurrency={formatCurrency}
                        handleDeposit={onDeposit}
                        handleWithdraw={onWithdraw}
                        handleContentTabClick={onContentTabClick}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
