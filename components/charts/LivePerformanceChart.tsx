import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Vault } from '@/lib/types';
import { formatCurrency, formatTimeAgo } from '@/lib/utils';

interface LivePerformanceChartProps {
  vaults: Vault[];
  data: any[];
  timeRange: '1H' | '24H' | '7D' | '30D' | 'ALL';
  className?: string;
}

const vaultColors = {
  'vault-1': '#10b981', // emerald
  'vault-2': '#3b82f6', // blue
  'vault-3': '#f59e0b', // amber
  'vault-4': '#ef4444', // red
};

export function LivePerformanceChart({ 
  vaults, 
  data, 
  timeRange, 
  className 
}: LivePerformanceChartProps) {
  const formatXAxis = (tickItem: Date) => {
    switch (timeRange) {
      case '1H':
        return tickItem.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      case '24H':
        return tickItem.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      case '7D':
        return tickItem.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case '30D':
        return tickItem.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case 'ALL':
        return tickItem.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      default:
        return '';
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface-elevated border border-border rounded-lg p-3 shadow-lg">
          <p className="text-text-secondary text-sm mb-2">
            {label instanceof Date ? formatXAxis(label) : label}
          </p>
          {payload.map((entry: any, index: number) => {
            const vault = vaults.find(vault => vault.id === entry.dataKey);
            if (!vault) return null;
            
            return (
              <div key={index} className="flex items-center justify-between gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: vaultColors[entry.dataKey as keyof typeof vaultColors] }}
                  />
                  <span className="text-text-primary">{vault.name}</span>
                </div>
                <span className="font-mono text-text-primary">
                  {formatCurrency(entry.value)}
                </span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  const CustomLegend = () => {
    return (
      <div className="flex flex-wrap gap-4 justify-center mt-4">
        {vaults.map((vault) => (
          <div key={vault.id} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: vaultColors[vault.id as keyof typeof vaultColors] }}
            />
            <span className="text-sm text-text-secondary">{vault.name}</span>
            <span className="text-sm font-mono text-text-primary">
              {formatCurrency(vault.currentUsdcValue)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
          <XAxis 
            dataKey="timestamp"
            tickFormatter={formatXAxis}
            stroke="#9ca3af"
            fontSize={12}
          />
          <YAxis 
            tickFormatter={(value) => `$${value}`}
            stroke="#9ca3af"
            fontSize={12}
            domain={['dataMin - 1', 'dataMax + 1']}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
          
          {vaults.map((vault) => (
            <Line
              key={vault.id}
              type="monotone"
              dataKey={vault.id}
              stroke={vaultColors[vault.id as keyof typeof vaultColors]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              animationDuration={300}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MiniChart({ 
  vault, 
  data, 
  className 
}: { 
  vault: Vault; 
  data: any[]; 
  className?: string;
}) {
  const color = vaultColors[vault.id as keyof typeof vaultColors];
  const latestValue = data[data.length - 1]?.[vault.id] || 20;
  const firstValue = data[0]?.[vault.id] || 20;
  const change = latestValue - firstValue;
  const changePercent = (change / firstValue) * 100;

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-text-secondary">{vault.name}</span>
        <div className="text-right">
          <div className="text-sm font-mono text-text-primary">
            {formatCurrency(latestValue)}
          </div>
          <div className={`text-xs font-mono ${change >= 0 ? 'profit' : 'loss'}`}>
            {change >= 0 ? '+' : ''}{changePercent.toFixed(1)}%
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={60}>
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey={vault.id}
            stroke={color}
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
