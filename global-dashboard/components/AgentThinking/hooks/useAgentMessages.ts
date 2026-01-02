"use client"

import { useState, useEffect } from 'react';

export interface ToolUse {
  toolUseId: string;
  name: string;
  input: any;
}

export interface ToolResult {
  status: string;
  toolUseId: string;
  content: Array<{ text: string }>;
}

export interface MessageContent {
  text?: string;
  toolUse?: ToolUse;
  toolResult?: ToolResult;
}

export interface AgentMessage {
  message: {
    role: 'user' | 'assistant';
    content: MessageContent[];
  };
  message_id: number;
  redact_message: any;
  created_at: string;
  updated_at: string;
}

export const useAgentMessages = (agentType: 'claude' | 'nova' | 'llama') => {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);

      const allMessages: AgentMessage[] = [];
      let messageIndex = 0;
      let hasMoreMessages = true;

      while (hasMoreMessages) {
        try {
          const response = await fetch(
            `https://trade-arena-sessions.s3.us-east-1.amazonaws.com/dev//session_user-walrus-hackathon/agents/agent_${agentType}_trading_agent/messages/message_${messageIndex}.json`
          );

          if (!response.ok) {
            if (response.status === 404) {
              // No more messages available
              hasMoreMessages = false;
              break;
            }
            throw new Error(`Failed to fetch message ${messageIndex}: ${response.status}`);
          }

          const message: AgentMessage = await response.json();
          allMessages.push(message);
          messageIndex++;

          // Safety limit to prevent infinite loops
          if (messageIndex > 100) {
            console.warn('Message fetch limit reached (100 messages)');
            break;
          }
        } catch (err) {
          if (messageIndex === 0) {
            // If we can't even fetch the first message, it's an error
            throw err;
          } else {
            // Otherwise, we've reached the end
            hasMoreMessages = false;
            break;
          }
        }
      }

      setMessages(allMessages);
    } catch (err) {
      console.error(`Error fetching ${agentType} messages:`, err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [agentType]);

  const refetch = () => {
    fetchMessages();
  };

  // Helper function to extract tool calls from messages
  const getToolCalls = () => {
    const toolCalls: (ToolUse & { messageId: number; timestamp: string })[] = [];
    
    messages.forEach((msg) => {
      if (msg.message.role === 'assistant') {
        msg.message.content.forEach((content) => {
          if (content.toolUse) {
            toolCalls.push({
              ...content.toolUse,
              messageId: msg.message_id,
              timestamp: msg.created_at
            });
          }
        });
      }
    });

    return toolCalls;
  };

  // Helper function to extract tool results from messages
  const getToolResults = () => {
    const toolResults: (ToolResult & { messageId: number; timestamp: string })[] = [];
    
    messages.forEach((msg) => {
      if (msg.message.role === 'user') {
        msg.message.content.forEach((content) => {
          if (content.toolResult) {
            toolResults.push({
              ...content.toolResult,
              messageId: msg.message_id,
              timestamp: msg.created_at
            });
          }
        });
      }
    });

    return toolResults;
  };

  // Helper function to get reasoning text
  const getReasoningText = () => {
    const reasoningTexts: { text: string; messageId: number; timestamp: string }[] = [];
    
    messages.forEach((msg) => {
      if (msg.message.role === 'assistant') {
        msg.message.content.forEach((content) => {
          if (content.text) {
            reasoningTexts.push({
              text: content.text,
              messageId: msg.message_id,
              timestamp: msg.created_at
            });
          }
        });
      }
    });

    return reasoningTexts;
  };

  return { 
    messages, 
    loading, 
    error, 
    refetch,
    getToolCalls,
    getToolResults,
    getReasoningText
  };
};
