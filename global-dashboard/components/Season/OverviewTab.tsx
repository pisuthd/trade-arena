import React from 'react';
import { MetricCard } from '../UI';

interface OverviewTabProps {
  model: any;
  tradeMetrics: any;
  formatCurrency: (value: number) => string;
}

export default function OverviewTab({ 
  model, 
  tradeMetrics, 
  formatCurrency 
}: OverviewTabProps) {
  const modelIndex = 0; // This would be passed as prop or calculated

  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <h4 className="font-semibold mb-3">Model Strategy</h4>
        <p className="text-gray-400 text-sm mb-4">
          {model.name === 'CLAUDE' && 'Advanced momentum-based trading with breakout detection and dynamic position sizing.'}
          {model.name === 'NOVA' && 'Conservative approach focusing on risk management and sustainable long-term gains.'}
          {model.name === 'LLAMA' && 'Aggressive high-frequency trading with rapid position changes and scalping.'}
        </p>

        <h4 className="font-semibold mb-3">Key Metrics</h4>
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            title="Win Rate"
            value={`${tradeMetrics.winRate}%`}
          />
          <MetricCard
            title="Avg Hold Time"
            value={`${(4.2 + modelIndex * 1.5).toFixed(1)}h`}
          />
        </div>
      </div>

      <div>
        <h4 className="font-semibold mb-3">Performance Stats</h4>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400">Average Win</span>
            <span className="text-green-400">{formatCurrency(tradeMetrics.avgWin)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Average Loss</span>
            <span className="text-red-400">{formatCurrency(tradeMetrics.avgLoss)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Best Trade</span>
            <span className="text-green-400">{formatCurrency(tradeMetrics.maxWin)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Worst Trade</span>
            <span className="text-red-400">{formatCurrency(tradeMetrics.maxLoss)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Active Positions</span>
            <span>{3 - modelIndex}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
