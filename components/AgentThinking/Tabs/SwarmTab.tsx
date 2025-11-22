"use client"

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Clock, 
  Activity, 
  Brain, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Zap,
  Eye,
  MessageSquare
} from 'lucide-react';
import { useSwarmData, SwarmData } from '../hooks/useSwarmData';

export default function SwarmTab() {
  const { data, loading, error } = useSwarmData();
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const toggleNodeExpansion = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const formatExecutionTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatTokens = (tokens: number) => {
    if (tokens < 1000) return tokens.toString();
    if (tokens < 1000000) return `${(tokens / 1000).toFixed(1)}K`;
    return `${(tokens / 1000000).toFixed(1)}M`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00ff88] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading swarm intelligence data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 mb-2">Error loading swarm data</p>
          <p className="text-gray-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">No swarm data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Swarm Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/40 backdrop-blur-sm border border-gray-800 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-[#00ff88]/20 to-[#00d4ff]/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-[#00ff88]" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Swarm Intelligence</h2>
              <p className="text-gray-400 text-sm">Multi-agent BTC market analysis</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`px-3 py-1 rounded-lg text-sm font-medium ${
              data.status === 'completed' ? 'bg-green-500/20 text-green-400' :
              data.status === 'running' ? 'bg-blue-500/20 text-blue-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {data.status === 'completed' && <CheckCircle className="w-3 h-3 inline mr-1" />}
              {data.status === 'running' && <Activity className="w-3 h-3 inline mr-1" />}
              {data.status === 'failed' && <AlertCircle className="w-3 h-3 inline mr-1" />}
              {data.status.toUpperCase()}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="bg-[#0a0a0f]/60 border border-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Brain className="w-4 h-4 text-[#00ff88]" />
              <span className="text-xs text-gray-400">Active Agents</span>
            </div>
            <p className="text-2xl font-bold text-[#00ff88]">{data.node_history.length}</p>
          </div>
          <div className="bg-[#0a0a0f]/60 border border-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-4 h-4 text-[#00d4ff]" />
              <span className="text-xs text-gray-400">Total Tokens</span>
            </div>
            <p className="text-2xl font-bold text-[#00d4ff]">
              {formatTokens(
                Object.values(data.node_results).reduce(
                  (sum, result) => sum + result.accumulated_usage.totalTokens, 
                  0
                )
              )}
            </p>
          </div>
          <div className="bg-[#0a0a0f]/60 border border-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-4 h-4 text-[#ff00ff]" />
              <span className="text-xs text-gray-400">Total Time</span>
            </div>
            <p className="text-2xl font-bold text-[#ff00ff]">
              {formatExecutionTime(
                Object.values(data.node_results).reduce(
                  (sum, result) => sum + result.execution_time, 
                  0
                )
              )}
            </p>
          </div>
          <div className="bg-[#0a0a0f]/60 border border-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-[#ff6b00]" />
              <span className="text-xs text-gray-400">Success Rate</span>
            </div>
            <p className="text-2xl font-bold text-[#ff6b00]">
              {Object.values(data.node_results).filter(r => r.status === 'completed').length}/{Object.values(data.node_results).length}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Current Task */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6"
      >
        <div className="flex items-start space-x-3">
          <MessageSquare className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-sm mb-2 text-purple-300">Current Task</h3>
            <p className="text-sm text-gray-300">{data.current_task}</p>
          </div>
        </div>
      </motion.div>

      {/* Node Execution Flow */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-black/40 backdrop-blur-sm border border-gray-800 rounded-xl p-6"
      >
        <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
          <Activity className="w-5 h-5 text-[#00ff88]" />
          <span>Execution Flow</span>
        </h3>

        <div className="space-y-3">
          {data.node_history.map((nodeName, index) => {
            const nodeResult = data.node_results[nodeName];
            const isExpanded = expandedNodes.has(nodeName);

            return (
              <motion.div
                key={nodeName}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-800 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleNodeExpansion(nodeName)}
                  className="w-full p-4 bg-[#0a0a0f]/60 hover:bg-[#0a0a0f]/80 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        nodeResult?.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        nodeResult?.status === 'running' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="font-medium">{nodeName}</span>
                    </div>
                    {nodeResult && (
                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        <span>{formatExecutionTime(nodeResult.execution_time)}</span>
                        <span>{formatTokens(nodeResult.accumulated_usage.totalTokens)} tokens</span>
                      </div>
                    )}
                  </div>
                  <Eye className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>

                {isExpanded && nodeResult && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="border-t border-gray-800 p-4 bg-black/40"
                  >
                    <div className="space-y-4">
                      {/* Agent Result */}
                      <div>
                        <h4 className="text-sm font-semibold text-[#00ff88] mb-2">Analysis Result</h4>
                        <div className="bg-black/60 border border-gray-800 rounded-lg p-3">
                          <p className="text-sm text-gray-300 whitespace-pre-wrap">
                            {nodeResult.result.message.content[0]?.text || 'No analysis available'}
                          </p>
                        </div>
                      </div>

                      {/* Performance Metrics */}
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <h5 className="text-xs text-gray-400 mb-1">Execution Time</h5>
                          <p className="text-sm font-medium">{formatExecutionTime(nodeResult.execution_time)}</p>
                        </div>
                        <div>
                          <h5 className="text-xs text-gray-400 mb-1">Input Tokens</h5>
                          <p className="text-sm font-medium">{formatTokens(nodeResult.accumulated_usage.inputTokens)}</p>
                        </div>
                        <div>
                          <h5 className="text-xs text-gray-400 mb-1">Output Tokens</h5>
                          <p className="text-sm font-medium">{formatTokens(nodeResult.accumulated_usage.outputTokens)}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Shared Context */}
      {data.context.shared_context && Object.keys(data.context.shared_context).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-black/40 backdrop-blur-sm border border-gray-800 rounded-xl p-6"
        >
          <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
            <Brain className="w-5 h-5 text-[#00d4ff]" />
            <span>Shared Context</span>
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {Object.entries(data.context.shared_context).map(([key, value]) => (
              <div key={key} className="bg-[#0a0a0f]/60 border border-gray-800 rounded-lg p-3">
                <h4 className="text-xs font-semibold text-[#00d4ff] mb-2 capitalize">
                  {key.replace(/_/g, ' ')}
                </h4>
                <div className="text-sm text-gray-300">
                  {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
