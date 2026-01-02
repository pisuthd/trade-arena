import React from 'react';

interface AssetAllocationProps {
  assetAllocation: {
    usdcPercentage: number;
    btcPercentage: number;
  };
  tradeMetrics: {
    totalTrades: number;
    longPositions: number;
    shortPositions: number;
  };
}

export default function AssetAllocation({ 
  assetAllocation, 
  tradeMetrics 
}: AssetAllocationProps) {
  return (
    <div className="bg-gray-700/50 p-4 rounded-lg">
      <h4 className="font-semibold mb-3">Vault Composition</h4>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-400 mb-2">Asset Allocation</p>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">USDC</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-blue-400 h-2 rounded-full" 
                    style={{ width: `${assetAllocation.usdcPercentage}%` }}
                  ></div>
                </div>
                <span className="text-sm">{assetAllocation.usdcPercentage}%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">BTC</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-orange-400 h-2 rounded-full" 
                    style={{ width: `${assetAllocation.btcPercentage}%` }}
                  ></div>
                </div>
                <span className="text-sm">{assetAllocation.btcPercentage}%</span>
              </div>
            </div>
          </div>
        </div>
        <div>
          <p className="text-sm text-gray-400 mb-2">Position Types</p>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Long Positions</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-green-400 h-2 rounded-full" 
                    style={{ 
                      width: `${tradeMetrics.totalTrades > 0 ? (tradeMetrics.longPositions / tradeMetrics.totalTrades * 100) : 0}%` 
                    }}
                  ></div>
                </div>
                <span className="text-sm">
                  {tradeMetrics.totalTrades > 0 ? Math.round(tradeMetrics.longPositions / tradeMetrics.totalTrades * 100) : 0}%
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Short Positions</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-red-400 h-2 rounded-full" 
                    style={{ 
                      width: `${tradeMetrics.shortPositions > 0 ? (tradeMetrics.shortPositions / tradeMetrics.totalTrades * 100) : 0}%` 
                    }}
                  ></div>
                </div>
                <span className="text-sm">
                  {tradeMetrics.totalTrades > 0 ? Math.round(tradeMetrics.shortPositions / tradeMetrics.totalTrades * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
