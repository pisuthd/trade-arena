import React from 'react';
import TradeHistoryList from './TradeHistoryList';

interface TradesTabProps {
  vaultData: any;
  formatCurrency: (value: number) => string;
  formatTradeTime: (timestamp: string) => string;
}

export default function TradesTab({ 
  vaultData, 
  formatCurrency, 
  formatTradeTime 
}: TradesTabProps) {
  return (
    <div>
      <h4 className="font-semibold mb-3">Recent Trades</h4>
      <TradeHistoryList
        trades={vaultData?.trade_history || []}
        formatCurrency={formatCurrency}
        formatTradeTime={formatTradeTime}
      />
    </div>
  );
}
