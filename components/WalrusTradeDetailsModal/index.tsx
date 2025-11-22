"use client"

import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Copy, CheckCircle, AlertCircle, Loader2, Eye, EyeOff, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { walrusClient } from '@/lib/walrus-client';

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
    ai_model?: string;
    walrus_blob_id?: number[];
  };
}

interface WalrusTradeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  trade: Trade;
  blobId: string;
}

export default function WalrusTradeDetailsModal({
  isOpen,
  onClose,
  trade,
  blobId
}: WalrusTradeDetailsModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [walrusData, setWalrusData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [showFullJson, setShowFullJson] = useState(true);

  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(parseInt(timestamp));
    return date.toLocaleString();
  };

  // Calculate trade values
  const entryPrice = parseFloat(trade.fields.entry_price) / 10000;
  const btcAmount = parseFloat(trade.fields.btc_amount) / 100000000;
  const usdcAmount = parseFloat(trade.fields.usdc_amount) / 1000000;

  // Fetch Walrus data when modal opens
  useEffect(() => {
    if (isOpen && blobId && walrusClient.isValidBlobId(blobId)) {
      fetchWalrusData();
    }
  }, [isOpen, blobId]);

  const fetchWalrusData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await walrusClient.getTradeData(blobId);
      setWalrusData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch Walrus data');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, itemType: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(itemType);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadJson = () => {
    if (!walrusData) return;

    const dataStr = JSON.stringify(walrusData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `trade-${trade.fields.pair}-${trade.fields.timestamp}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleClose = () => {
    setWalrusData(null);
    setError(null);
    setShowFullJson(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-gray-900 border border-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800">
            <div className="flex items-center space-x-3">
              {/* <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Eye className="w-6 h-6 text-purple-400" />
              </div> */}
              <div>
                <h3 className="text-xl font-bold">AI Trade History</h3>
                <p className="text-sm text-gray-400">Verify every AI decision and trade on-chain with immutable Walrus proof </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              <div className='col-span-2'>
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-purple-300">Walrus Blob ID</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => copyToClipboard(blobId, 'blobId')}
                        className="text-purple-400 hover:text-purple-300 transition-colors"
                        title="Copy Blob ID"
                      >
                        {copiedItem === 'blobId' ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <a
                        href={walrusClient.getWalruscanUrl(blobId)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300 transition-colors"
                        title="View on Walruscan"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                  <p className="font-mono text-xs text-purple-400 break-all">{blobId}</p>
                </div>
              </div>

              {/* Blockchain Trade Entry */}
              <div className="space-y-4">
                {/* <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <h4 className="text-lg font-semibold">Blockchain Trade Entry</h4>
                </div> */}

                <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Action</span>
                    <div className={`px-2 py-1 rounded text-xs font-semibold ${trade.fields.action === 'LONG'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                      }`}>
                      {trade.fields.action}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-400">Trading Pair</span>
                    <span className="font-semibold">{trade.fields.pair}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-400">Entry Price</span>
                    <span className="font-semibold">${entryPrice.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-400">BTC Amount</span>
                    <span className="font-semibold">{btcAmount.toFixed(5)} BTC</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-400">USDC Amount</span>
                    <span className="font-semibold">{formatCurrency(usdcAmount)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-400">Confidence</span>
                    <span className="font-semibold text-blue-400">{trade.fields.confidence}%</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-400">AI Model</span>
                    <span className="font-semibold">{trade.fields.ai_model || 'Unknown'}</span>
                  </div>

                  <div className="pt-2 border-t border-gray-700">
                    <span className="text-gray-400 text-sm">Reasoning</span>
                    <p className="text-sm mt-1 text-gray-300">{trade.fields.reasoning}</p>
                  </div>

                  <div className="flex justify-between pt-2 border-t border-gray-700">
                    <span className="text-gray-400">Timestamp</span>
                    <span className="font-mono text-xs">{formatTimestamp(trade.fields.timestamp)}</span>
                  </div>
                </div>
              </div>

              {/* Walrus AI Decision Proof */}
              <div className="space-y-4">

                {/* Walrus Data Section */}
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">Stored AI Data on Walrus</span>
                    <div className="flex items-center space-x-2">
                      {isLoading && (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                      )}
                      {error && (
                        <div className="relative group">
                          <AlertCircle className="w-4 h-4 text-red-400" />
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-xs text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {error}
                          </div>
                        </div>
                      )}
                      {walrusData && (
                        <>
                          <button
                            onClick={() => setShowFullJson(!showFullJson)}
                            className="text-gray-400 hover:text-white transition-colors"
                            title={showFullJson ? "Show Summary" : "Show Full JSON"}
                          >
                            {showFullJson ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={downloadJson}
                            className="text-gray-400 hover:text-white transition-colors"
                            title="Download JSON"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {isLoading && (
                    <div className="text-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-400" />
                      <p className="text-sm text-gray-400">Fetching AI decision data from Walrus...</p>
                    </div>
                  )}

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                      <p className="text-red-400 text-sm mb-2">{error}</p>
                      <p className="text-red-300 text-xs">
                        <strong>Note:</strong> Walrus blob data is stored for only 2 epochs.
                        This trade's AI decision proof may have expired. Try viewing more recent trade entries
                        to see active Walrus data.
                      </p>
                    </div>
                  )}

                  {walrusData && !showFullJson && (
                    <div className="space-y-2">
                      {Object.entries(walrusData).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-start">
                          <span className="text-gray-400 text-sm capitalize">{key.replace(/_/g, ' ')}</span>
                          <span className="text-sm text-gray-300 text-right max-w-[60%] break-words">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {walrusData && showFullJson && (
                    <div className="bg-gray-900 rounded-lg p-3 overflow-x-auto">
                      <pre className="text-xs text-gray-300 font-mono">
                        {JSON.stringify(walrusData, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
