"use client"

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Clock, 
  Activity, 
  MessageSquare, 
  Wrench, 
  CheckCircle, 
  AlertCircle,
  Filter,
  Search,
  Eye,
  Zap,
  Cpu,
  FileText
} from 'lucide-react';
import { useAgentMessages } from '../hooks/useAgentMessages';

interface AgentTabProps {
  agentType: 'claude' | 'nova' | 'llama';
}

const agentConfig = {
  claude: {
    name: 'Claude Sonnet 4.5',
    color: '#00d4ff',
    icon: Brain,
    description: 'Advanced reasoning and market analysis'
  },
  nova: {
    name: 'Amazon Nova Pro',
    color: '#00ff88',
    icon: Cpu,
    description: 'High-performance trading decisions'
  },
  llama: {
    name: 'Llama 4 Maverick',
    color: '#ff00ff',
    icon: Activity,
    description: 'Open-source trading intelligence'
  }
};

export default function AgentTab({ agentType }: AgentTabProps) {
  const { 
    messages, 
    loading, 
    error, 
    getToolCalls, 
    getToolResults, 
    getReasoningText 
  } = useAgentMessages(agentType);
  
  const [expandedMessages, setExpandedMessages] = useState<Set<number>>(new Set());
  const [filter, setFilter] = useState<'all' | 'reasoning' | 'tools' | 'results'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const config = agentConfig[agentType];
  const Icon = config.icon;

  const toggleMessageExpansion = (messageId: number) => {
    const newExpanded = new Set(expandedMessages);
    if (newExpanded.has(messageId)) {
      newExpanded.delete(messageId);
    } else {
      newExpanded.add(messageId);
    }
    setExpandedMessages(newExpanded);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const formatExecutionTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = searchTerm === '' || 
      JSON.stringify(msg.message.content).toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    switch (filter) {
      case 'reasoning':
        return msg.message.content.some(c => c.text);
      case 'tools':
        return msg.message.content.some(c => c.toolUse);
      case 'results':
        return msg.message.content.some(c => c.toolResult);
      default:
        return true;
    }
  });

  const toolCalls = getToolCalls();
  const toolResults = getToolResults();
  const reasoningTexts = getReasoningText();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00ff88] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading {config.name} messages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 mb-2">Error loading agent messages</p>
          <p className="text-gray-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Agent Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/40 backdrop-blur-sm border border-gray-800 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${config.color}20` }}
            >
              <Icon className="w-6 h-6" style={{ color: config.color }} />
            </div>
            <div>
              <h2 className="text-xl font-bold">{config.name}</h2>
              <p className="text-gray-400 text-sm">{config.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-gray-400" />
              <span>{messages.length} messages</span>
            </div>
            <div className="flex items-center space-x-2">
              <Wrench className="w-4 h-4 text-gray-400" />
              <span>{toolCalls.length} tool calls</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-gray-400" />
              <span>{toolResults.length} results</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-[#0a0a0f]/60 border border-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <FileText className="w-4 h-4" style={{ color: config.color }} />
              <span className="text-xs text-gray-400">Reasoning</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: config.color }}>
              {reasoningTexts.length}
            </p>
          </div>
          <div className="bg-[#0a0a0f]/60 border border-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Wrench className="w-4 h-4 text-[#00ff88]" />
              <span className="text-xs text-gray-400">Tool Calls</span>
            </div>
            <p className="text-2xl font-bold text-[#00ff88]">{toolCalls.length}</p>
          </div>
          <div className="bg-[#0a0a0f]/60 border border-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-4 h-4 text-[#ff00ff]" />
              <span className="text-xs text-gray-400">Success Rate</span>
            </div>
            <p className="text-2xl font-bold text-[#ff00ff]">
              {toolResults.length > 0 ? 
                `${Math.round((toolResults.filter(r => r.status === 'success').length / toolResults.length) * 100)}%` : 
                'N/A'
              }
            </p>
          </div>
          <div className="bg-[#0a0a0f]/60 border border-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-4 h-4 text-[#ff6b00]" />
              <span className="text-xs text-gray-400">Last Active</span>
            </div>
            <p className="text-sm font-bold text-[#ff6b00]">
              {messages.length > 0 ? formatExecutionTime(messages[messages.length - 1].created_at) : 'Never'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-black/40 backdrop-blur-sm border border-gray-800 rounded-xl p-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium">Filter:</span>
            </div>
            <div className="flex space-x-2">
              {[
                { value: 'all', label: 'All' },
                { value: 'reasoning', label: 'Reasoning' },
                { value: 'tools', label: 'Tools' },
                { value: 'results', label: 'Results' }
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setFilter(value as any)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    filter === value 
                      ? 'bg-white/20 text-white' 
                      : 'bg-black/60 text-gray-400 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-black/60 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88]"
            />
          </div>
        </div>
      </motion.div>

      {/* Message Thread */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        {filteredMessages.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No messages found</p>
          </div>
        ) : (
          filteredMessages.map((message, index) => (
            <motion.div
              key={message.message_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-black/40 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => toggleMessageExpansion(message.message_id)}
                className="w-full p-4 bg-[#0a0a0f]/60 hover:bg-[#0a0a0f]/80 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      message.message.role === 'user' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {message.message.role === 'user' ? 'U' : 'A'}
                    </div>
                    <div>
                      <span className="font-medium">
                        {message.message.role === 'user' ? 'User' : config.name}
                      </span>
                      <span className="text-gray-400 text-sm ml-2">
                        {formatTimestamp(message.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 text-xs text-gray-400">
                      {message.message.content.some(c => c.text) && (
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded">Text</span>
                      )}
                      {message.message.content.some(c => c.toolUse) && (
                        <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded">Tools</span>
                      )}
                      {message.message.content.some(c => c.toolResult) && (
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded">Results</span>
                      )}
                    </div>
                    <Eye className={`w-4 h-4 text-gray-400 transition-transform ${
                      expandedMessages.has(message.message_id) ? 'rotate-180' : ''
                    }`} />
                  </div>
                </div>
              </button>

              {expandedMessages.has(message.message_id) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="border-t border-gray-800 p-4 bg-black/40"
                >
                  <div className="space-y-4">
                    {message.message.content.map((content, contentIndex) => (
                      <div key={contentIndex}>
                        {content.text && (
                          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                              <FileText className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                              <div>
                                <h4 className="text-sm font-semibold text-purple-300 mb-2">Reasoning</h4>
                                <p className="text-sm text-gray-300 whitespace-pre-wrap">
                                  {content.text}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {content.toolUse && (
                          <div className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/30 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                              <Wrench className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <h4 className="text-sm font-semibold text-orange-300 mb-2">
                                  Tool Call: {content.toolUse.name}
                                </h4>
                                <div className="bg-black/60 border border-gray-800 rounded-lg p-3">
                                  <pre className="text-xs text-gray-300 overflow-x-auto">
                                    {JSON.stringify(content.toolUse.input, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {content.toolResult && (
                          <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                              <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <h4 className="text-sm font-semibold text-blue-300 mb-2">
                                  Tool Result
                                  <span className={`ml-2 px-2 py-1 text-xs rounded ${
                                    content.toolResult.status === 'success' 
                                      ? 'bg-green-500/20 text-green-400' 
                                      : 'bg-red-500/20 text-red-400'
                                  }`}>
                                    {content.toolResult.status}
                                  </span>
                                </h4>
                                <div className="space-y-2">
                                  {content.toolResult.content.map((result, resultIndex) => (
                                    <div key={resultIndex} className="bg-black/60 border border-gray-800 rounded-lg p-3">
                                      <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                                        {result.text}
                                      </pre>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
}
