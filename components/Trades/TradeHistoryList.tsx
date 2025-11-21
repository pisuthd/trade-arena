"use client"

import React, { useState } from 'react';
import { parseWalrusBlobId, truncateBlobId } from '../../lib/utils';
import WalrusTradeDetailsModal from '../WalrusTradeDetailsModal';

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
    walrus_blob_id?: number[];
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
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [selectedBlobId, setSelectedBlobId] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (trade: Trade, blobId: string) => {
    setSelectedTrade(trade);
    setSelectedBlobId(blobId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTrade(null);
    setSelectedBlobId('');
  };

  if (!trades || trades.length === 0) {
    return (
      <div className="bg-gray-700/50 p-6 rounded-lg">
        <p className="text-gray-400 text-center">No trades available</p>
      </div>
    );
  }

  // Sort trades by timestamp (most recent first)
  const sortedTrades = [...trades].sort((a, b) => {
    const timestampA = parseInt(a.fields.timestamp);
    const timestampB = parseInt(b.fields.timestamp);
    return timestampB - timestampA; // Descending order (newest first)
  });

  return (
    <>
      <div className="space-y-2">
        {sortedTrades.map((trade: any, tradeIndex: number) => {

          console.log("trade: ", trade)

          const entryPrice = parseFloat(trade.fields.entry_price) / 10000; // Convert from 6 decimals
          const btcAmount = parseFloat(trade.fields.btc_amount) / 100000000; // Convert from 8 decimals
          const usdcAmount = parseFloat(trade.fields.usdc_amount) / 1000000; // Convert from 6 decimals
          
          // Parse Walrus blob ID if available
          const walrusBlobId = trade.fields.walrus_blob_id 
            ? parseWalrusBlobId(trade.fields.walrus_blob_id) 
            : null;
          
          return (
            <div 
              key={tradeIndex} 
              className={`bg-gray-700/50 p-3 rounded-lg transition-all cursor-pointer hover:bg-gray-700/70 ${
                walrusBlobId ? 'hover:border hover:border-purple-500/30' : ''
              }`}
              onClick={() => walrusBlobId && handleOpenModal(trade, walrusBlobId)}
            >
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
                      {btcAmount.toFixed(5)} BTC @ ${entryPrice.toLocaleString()}
                    </p>
                    <p className="text-xs text-blue-400 mt-1">Confidence: {trade.fields.confidence}%</p>
                    <p className="text-xs text-gray-400 mt-1">{trade.fields.reasoning}</p>
                    {walrusBlobId && (
                      <div className="mt-2 p-2 bg-purple-500/10 rounded border border-purple-500/20">
                        <p className="text-xs text-purple-300 font-medium">Walrus Blob ID</p>
                        <p className="text-xs text-purple-400 font-mono">
                          {truncateBlobId(walrusBlobId)}
                        </p>
                        <p className="text-xs text-purple-500 mt-1">
                          Click card to view details →
                        </p>
                      </div>
                    )}
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
      
      {/* Walrus Trade Details Modal */}
      {selectedTrade && isModalOpen && (
        <WalrusTradeDetailsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          trade={selectedTrade}
          blobId={selectedBlobId}
        />
      )}
    </>
  );
}
