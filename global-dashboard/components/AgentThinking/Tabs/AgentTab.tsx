"use client"

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Wrench, 
  CheckCircle, 
  AlertCircle,
  Search,
  Eye,
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
    description: 'Advanced reasoning and market analysis',
    image: '/claude-icon.png'
  },
  nova: {
    name: 'Amazon Nova Pro',
    color: '#00ff88',
    description: 'High-performance trading decisions',
    image: '/amazon-nova.png'
  },
  llama: {
    name: 'Llama 4 Maverick',
    color: '#ff00ff',
    description: 'Open-source trading intelligence',
    image: '/llama-icon.png'
  }
};

export default function AgentTab({ agentType }: AgentTabProps) {
  const { 
    messages, 
    loading, 
    error
  } = useAgentMessages(agentType);
  
  const [expandedMessages, setExpandedMessages] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const config = agentConfig[agentType];

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

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = searchTerm === '' || 
      JSON.stringify(msg.message.content).toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

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

      {/* Simple Search Only */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-black/40 backdrop-blur-sm border border-gray-800 rounded-xl p-3"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-black/60 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88]"
          />
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
                      {message.message.role === 'user' ? 'T' : 'A'}
                    </div>
                    <div>
                      <span className="font-medium">
                        {message.message.role === 'user' ? 'Tool Results' : config.name}
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
                  <div className="space-y-3">
                    {message.message.content.map((content, contentIndex) => (
                      <div key={contentIndex}>
                        {content.text && (
                          <div className="bg-black/60 border border-gray-700 rounded-lg p-3">
                            <h4 className="text-sm font-semibold text-purple-300 mb-2">Reasoning</h4>
                            <p className="text-sm text-gray-300 whitespace-pre-wrap">
                              {content.text}
                            </p>
                          </div>
                        )}

                        {content.toolUse && (
                          <div className="bg-black/60 border border-gray-700 rounded-lg p-3">
                            <h4 className="text-sm font-semibold text-orange-300 mb-2">
                              Tool: {content.toolUse.name}
                            </h4>
                            <pre className="text-xs text-gray-400 overflow-x-auto">
                              {JSON.stringify(content.toolUse.input, null, 2)}
                            </pre>
                          </div>
                        )}

                        {content.toolResult && (
                          <div className="bg-black/60 border border-gray-700 rounded-lg p-3">
                            <h4 className="text-sm font-semibold text-blue-300 mb-2">
                              Result
                              <span className={`ml-2 px-2 py-1 text-xs rounded ${
                                content.toolResult.status === 'success' 
                                  ? 'bg-green-500/20 text-green-400' 
                                  : 'bg-red-500/20 text-red-400'
                              }`}>
                                {content.toolResult.status}
                              </span>
                            </h4>
                            <div className="text-xs text-gray-400 whitespace-pre-wrap">
                              {content.toolResult.content.map((result, resultIndex) => (
                                <div key={resultIndex} className="mb-1">
                                  {result.text}
                                </div>
                              ))}
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
