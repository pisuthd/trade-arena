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
  image: string;
}

interface SidebarProps {
  agents: Agent[];
  activeAgent: AgentType;
  onAgentSelect: (agent: AgentType) => void;
}

export default function Sidebar({ agents, activeAgent, onAgentSelect }: SidebarProps) {
  return (
    <div className="w-80 bg-black/60 backdrop-blur-sm border-r border-gray-800 flex flex-col">
      

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
                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                  <img 
                    src={agent.image} 
                    alt={agent.name}
                    className="w-10 h-10 object-cover"
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
 
    </div>
  );
}
