"use client"

import { useState, useEffect } from 'react';

export interface SwarmNodeResult {
  result: {
    type: "agent_result";
    message: {
      role: "assistant";
      content: Array<{ text: string }>;
    };
  };
  execution_time: number;
  status: string;
  accumulated_usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  accumulated_metrics: {
    latencyMs: number;
  };
  execution_count: number;
}

export interface SwarmData {
  type: "swarm";
  id: string;
  status: "completed" | "running" | "failed";
  node_history: string[];
  node_results: {
    [agentName: string]: SwarmNodeResult;
  };
  next_nodes_to_execute: any[];
  current_task: string;
  context: {
    shared_context: {
      [key: string]: any;
    };
    handoff_message: any;
  };
}

export const useSwarmData = () => {
  const [data, setData] = useState<SwarmData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSwarmData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        'https://trade-arena-sessions.s3.us-east-1.amazonaws.com/dev//session_user-walrus-hackathon/multi_agents/multi_agent_default_swarm/multi_agent.json'
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch swarm data: ${response.status}`);
      }

      const swarmData: SwarmData = await response.json();
      setData(swarmData);
    } catch (err) {
      console.error('Error fetching swarm data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSwarmData();
  }, []);

  const refetch = () => {
    fetchSwarmData();
  };

  return { data, loading, error, refetch };
};
