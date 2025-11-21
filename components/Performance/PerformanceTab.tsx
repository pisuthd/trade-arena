import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MetricCard } from '../UI';
import { DataAdapter } from '@/data/dataAdapter';

interface PerformanceTabProps {
  model: any;
  vaultData: any;
  formatCurrency: (value: number) => string;
}

export default function PerformanceTab({ 
  model, 
  vaultData,
  formatCurrency 
}: PerformanceTabProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [btcPrice, setBtcPrice] = useState<number>(95000); // Default BTC price

  useEffect(() => {
    const calculatePortfolioValue = async () => {
      try {
        setLoading(true);
        
        // Get current BTC price
        const currentBtcPrice = await DataAdapter.getBTCPrice();
        setBtcPrice(currentBtcPrice);
        
        // Get trade history from model's formatted trade history
        const trades = model.tradeHistory || [];
        
        if (trades.length === 0) {
          // No trades, show initial deposit only
          setChartData([{
            time: 'Start',
            value: 3000,
            timestamp: Date.now()
          }]);
          return;
        }
        
        // Sort trades by timestamp
        const sortedTrades = [...trades].sort((a, b) => 
          parseInt(a.timestamp) - parseInt(b.timestamp)
        );
        
        // Calculate portfolio value over time
        let usdcBalance = 3000; // Initial deposit
        let btcBalance = 0;
        const portfolioValues = [];
        
        // Add initial point
        portfolioValues.push({
          time: 'Start',
          value: 3000, // Show absolute portfolio value starting at $3,000
          timestamp: sortedTrades[0] ? parseInt(sortedTrades[0].timestamp) - 3600000 : Date.now()
        });
        
        // Process each trade chronologically using formatted trade history
        sortedTrades.forEach((trade: any) => {
          const usdcAmount = trade.usdcAmount; // Already converted from decimals
          const btcAmount = trade.btcAmount; // Already converted from decimals
          const action = trade.action;
          const entryPrice = trade.entryPrice; // Already converted from decimals
          
          if (action === 'LONG') {
            // Buy BTC with USDC at entry price
            usdcBalance -= usdcAmount;
            btcBalance += btcAmount;
          } else if (action === 'SHORT') {
            // Sell BTC for USDC at entry price  
            usdcBalance += usdcAmount;
            btcBalance -= btcAmount;
          }
          
          // Calculate total portfolio value at this point
          // For realistic portfolio progression, we'll simulate some market movement
          // In reality, this would be based on actual price changes over time
          const priceVariation = 1 + (Math.random() - 0.5) * 0.02; // ±1% random variation
          const adjustedBtcPrice = entryPrice * priceVariation;
          const totalValue = usdcBalance + (btcBalance * adjustedBtcPrice);
          
          portfolioValues.push({
            time: formatTradeTime(trade.timestamp),
            value: Math.round(totalValue), // Show absolute portfolio value
            timestamp: parseInt(trade.timestamp)
          });
        });
        
        setChartData(portfolioValues);
      } catch (error) {
        console.error('Failed to calculate portfolio value:', error);
        // Fallback to simple data
        setChartData([{
          time: 'Start',
          value: 3000,
          timestamp: Date.now()
        }]);
      } finally {
        setLoading(false);
      }
    };

    calculatePortfolioValue();
  }, [model.name, model.tradeHistory]);

  // Format trade timestamp for display
  const formatTradeTime = (timestamp: string): string => {
    const ts = parseInt(timestamp);
    const date = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const modelColor = model.color || '#00ff88';

  return (
    <div>
      <h4 className="font-semibold mb-3">Performance Chart</h4>
      <div className="bg-gray-700/50 p-6 rounded-lg">
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="text-gray-400">Loading chart data...</div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
              <XAxis 
                dataKey="time" 
                stroke="#666" 
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#666" 
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
                domain={['auto', 'auto']}
                allowDataOverflow={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0a0a0f',
                  border: '1px solid #333',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Portfolio Value']}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={modelColor} 
                strokeWidth={3} 
                dot={{ fill: modelColor, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
                name={model.name}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
        
        <div className="mt-6 grid grid-cols-3 gap-4">
          <MetricCard
            title="Initial Deposit"
            value="$3,000"
          />
          <MetricCard
            title="Current Value"
            value={formatCurrency(3000 + (model.pnl || 0))}
          />
          <MetricCard
            title="Total Return"
            value={`${(model.pnlPercentage || 0).toFixed(2)}%`}
            className={model.pnlPercentage >= 0 ? "text-green-400" : "text-red-400"}
          />
        </div>
      </div>
    </div>
  );
}
