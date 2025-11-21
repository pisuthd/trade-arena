import React from 'react';

interface Trade {
  fields: {
    action: string;
    pair: string;
    btc_amount: string;
    entry_price: string;
    usdc_amount: string;
    confidence: string;
    reasoning: string;
    timestamp: string;
  };
}

interface TradeHistoryListProps {
  trades: Trade[];
  formatCurrency: (value: number) => string;
  formatTradeTime: (timestamp: string) => string;
}

export default function TradeHistoryList({ 
  trades, 
  formatCurrency, 
  formatTradeTime 
}: TradeHistoryListProps) {
  if (!trades || trades.length === 0) {
    return (
      <div className="bg-gray-700/50 p-6 rounded-lg">
        <p className="text-gray-400 text-center">No trades available</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {trades.map((trade: any, tradeIndex: number) => {
        const entryPrice = parseFloat(trade.fields.entry_price) / 100000000; // Convert from 8 decimals
        const btcAmount = parseFloat(trade.fields.btc_amount) / 100000000; // Convert from 8 decimals
        const usdcAmount = parseFloat(trade.fields.usdc_amount) / 1000000; // Convert from 6 decimals
        
        return (
          <div key={tradeIndex} className="bg-gray-700/50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`px-2 py-1 rounded text-xs font-semibold ${
                  trade.fields.action === 'LONG' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {trade.fields.action}
                </div>
                <div>
                  <p className="font-semibold text-sm">{trade.fields.pair}</p>
                  <p className="text-xs text-gray-400">
                    {btcAmount.toFixed(5)} BTC @ ${entryPrice.toFixed(2)}
                  </p>
                  <p className="text-xs text-blue-400 mt-1">Confidence: {trade.fields.confidence}%</p>
                  <p className="text-xs text-gray-400 mt-1">{trade.fields.reasoning}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">
                  Size: {formatCurrency(usdcAmount)}
                </p>
                <p className="text-xs text-gray-400">{formatTradeTime(trade.fields.timestamp)}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
