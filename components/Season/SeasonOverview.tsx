import React from 'react';
import { MetricCard } from '../UI';

interface SeasonOverviewProps {
  season: any;
  formatCurrency: (value: number) => string;
  formatDate: (dateString: string | null) => string;
}

export default function SeasonOverview({ 
  season, 
  formatCurrency, 
  formatDate 
}: SeasonOverviewProps) {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-3">Overview</h3>
      <p className="text-gray-400 mb-4">{season.description}</p>

      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          title="Created"
          value={formatDate(season.createdAt)}
        />
        <MetricCard
          title="Started"
          value={formatDate(season.startedAt)}
        />
        <MetricCard
          title="Ended"
          value={formatDate(season.endedAt)}
        />
        <MetricCard
          title="Depositors"
          value={season.metrics.totalDepositors}
        />
      </div>
    </div>
  );
}
