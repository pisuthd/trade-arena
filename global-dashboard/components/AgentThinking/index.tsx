"use client"

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Activity, Users, Bot } from 'lucide-react';
import Sidebar from './Sidebar';
import SwarmTab from './Tabs/SwarmTab';
import AgentTab from './Tabs/AgentTab';

export type AgentType = 'swarm' | 'claude' | 'nova' | 'llama';

interface AgentThinkingProps {
  className?: string;
}

export default function AgentThinkingContainer({ className = '' }: AgentThinkingProps) {
  const [activeAgent, setActiveAgent] = useState<AgentType>('swarm');

  // Get model icon based on name (same as Home page)
  const getModelIcon = (modelName: string) => {
    if (modelName.toLowerCase().includes('claude')) {
      return '/claude-icon.png';
    } else if (modelName.toLowerCase().includes('nova') || modelName.toLowerCase().includes('amazon')) {
      return '/amazon-nova.png';
    } else if (modelName.toLowerCase().includes('llama')) {
      return '/llama-icon.png';
    }
    return '/claude-icon.png'; // fallback
  };

  const agents = [
    {
      id: 'swarm' as AgentType,
      name: 'Data Swarm',
      icon: Users,
      color: '#00ff88',
      description: 'Multiple specialized agents working together to analyze market conditions',
      image: '/claude-icon.png' // Use a generic icon for swarm
    },
    {
      id: 'claude' as AgentType,
      name: 'Claude Sonnet 4.5',
      icon: Brain,
      color: '#00d4ff',
      description: 'Claude Execution Agent',
      image: '/claude-icon.png'
    },
    {
      id: 'nova' as AgentType,
      name: 'Amazon Nova Pro',
      icon: Bot,
      color: '#00ff88',
      description: 'Nova Execution Agent',
      image: '/amazon-nova.png'
    },
    {
      id: 'llama' as AgentType,
      name: 'Llama 4 Maverick',
      icon: Activity,
      color: '#ff00ff',
      description: 'Llama 4 Execution Agent',
      image: '/llama-icon.png'
    }
  ];

  const currentAgent = agents.find(agent => agent.id === activeAgent);

  return (
    <div className={`min-h-screen bg-[#0a0a0f] text-white ${className}`}>
      {/* Animated gradient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-[800px] h-[800px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(0,255,136,0.08) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
          animate={{
            x: ['-20%', '120%'],
            y: ['-20%', '100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'linear',
          }}
        />
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(0,212,255,0.12) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
          animate={{
            x: ['100%', '-20%'],
            y: ['100%', '-20%'],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'linear',
          }}
        />
      </div>

      <div className="relative z-10 flex h-screen">
        {/* Sidebar */}
        <Sidebar 
          agents={agents}
          activeAgent={activeAgent}
          onAgentSelect={setActiveAgent}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-black/40 backdrop-blur-sm border-b border-gray-800 p-6"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                <img 
                  src={currentAgent?.image} 
                  alt={currentAgent?.name}
                  className="w-12 h-12 object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{currentAgent?.name}</h1>
                <p className="text-gray-400 text-sm">{currentAgent?.description}</p>
              </div>
            </div>
          </motion.div>

          {/* Tab Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex-1 overflow-auto p-6"
          >
            {activeAgent === 'swarm' ? (
              <SwarmTab />
            ) : (
              <AgentTab agentType={activeAgent as 'claude' | 'nova' | 'llama'} />
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
