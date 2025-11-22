"use client"

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { AgentType } from '../index';

interface Agent {
  id: AgentType;
  name: string;
  icon: LucideIcon;
  color: string;
  description: string;
}

interface SidebarProps {
  agents: Agent[];
  activeAgent: AgentType;
  onAgentSelect: (agent: AgentType) => void;
}

export default function Sidebar({ agents, activeAgent, onAgentSelect }: SidebarProps) {
  return (
    <div className="w-80 bg-black/60 backdrop-blur-sm border-r border-gray-800 flex flex-col">
      {/* Sidebar Header */}
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-xl font-bold mb-2">Agent Intelligence</h2>
        <p className="text-sm text-gray-400">
          Explore how AI agents analyze markets and make trading decisions
        </p>
      </div>

      {/* Agent Navigation */}
      <div className="flex-1 p-4 space-y-2">
        {agents.map((agent, index) => {
          const Icon = agent.icon;
          const isActive = activeAgent === agent.id;

          return (
            <motion.button
              key={agent.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              onClick={() => onAgentSelect(agent.id)}
              className={`
                w-full p-4 rounded-xl border transition-all duration-200 text-left
                ${isActive 
                  ? 'bg-gradient-to-r from-white/10 to-white/5 border-white/20 shadow-lg' 
                  : 'bg-black/40 border-gray-800 hover:border-gray-700 hover:bg-black/60'
                }
              `}
              style={{
                borderColor: isActive ? agent.color : undefined,
                boxShadow: isActive ? `0 0 20px ${agent.color}20` : undefined
              }}
            >
              <div className="flex items-center space-x-3">
                <div 
                  className={`
                    w-10 h-10 rounded-lg flex items-center justify-center
                    ${isActive ? 'bg-white/20' : 'bg-black/40'}
                  `}
                >
                  <Icon 
                    className="w-5 h-5" 
                    style={{ color: agent.color }}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{agent.name}</h3>
                  <p className="text-xs text-gray-400 mt-1">{agent.description}</p>
                </div>
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: agent.color }}
                  />
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-gray-800">
        <div className="bg-gradient-to-r from-[#00ff88]/10 to-[#00d4ff]/10 border border-[#00ff88]/30 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 rounded-full bg-[#00ff88] mt-1.5 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-semibold text-[#00ff88] mb-1">Live Intelligence</h4>
              <p className="text-xs text-gray-400">
                Real-time AI reasoning and decision-making processes stored on Walrus
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
