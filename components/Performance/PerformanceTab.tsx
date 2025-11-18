import React from 'react';
import { MetricCard } from '../UI';

interface PerformanceTabProps {
  model: any;
  formatCurrency: (value: number) => string;
}

export default function PerformanceTab({ 
  model, 
  formatCurrency 
}: PerformanceTabProps) {
  return (
    <div>
      <h4 className="font-semibold mb-3">Performance Chart</h4>
      <div className="bg-gray-700/50 p-6 rounded-lg">
        <div className="h-48 flex items-center justify-center border-2 border-dashed border-gray-600 rounded-lg">
          <p className="text-gray-400">Performance chart visualization</p>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <MetricCard
            title="Start Value"
            value="$10,000"
          />
          <MetricCard
            title="Current Value"
            value={formatCurrency(10000 + (model.pnl * 100))}
          />
          <MetricCard
            title="Total Return"
            value="+0%"
            className="text-green-400"
          />
        </div>
      </div>
    </div>
  );
}
