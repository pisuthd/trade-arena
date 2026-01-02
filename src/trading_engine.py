import asyncio
import logging
import sys
from datetime import datetime
import random
from mcp import stdio_client, StdioServerParameters
from strands import Agent
from strands.tools.mcp import MCPClient
from strands.multiagent import Swarm
from strands.session.s3_session_manager import S3SessionManager
import boto3
from strands_tools import http_request
from strands.models import BedrockModel

def main():
    """Main entry point for the trading engine"""
    boto_session = boto3.Session(region_name="us-east-1")

    # Enable debug logs
    logger = logging.getLogger("strands.multiagent")
    logger.setLevel(logging.DEBUG)
    logging.basicConfig(
        format="%(levelname)s | %(name)s | %(message)s",
        handlers=[logging.StreamHandler()]
    )

    # Create Trade Arena MCP client
    mcp_client = MCPClient(lambda: stdio_client(
        StdioServerParameters(
            command="node", 
            args=["sui-mcp/dist/index.js"]
        )
    ))

    # Create a session manager that stores data in S3
    session_manager = S3SessionManager(
        session_id="user-walrus-hackathon",
        bucket="trade-arena-sessions",
        prefix="dev/",
        boto_session=boto_session,  
        region_name="us-east-1",
        ttl_seconds=3600 * 24 * 3,  # 3 days TTL
        max_session_size_mb=50,  # 50MB limit
        cleanup_policy="auto"
    )

    with mcp_client:

        # Initialize the round
        cycle_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.info(f"🔄 Starting trading cycle at {cycle_time}")

        # Get the tools from the MCP server
        sui_tools = mcp_client.list_tools_sync()
        logger.info(f"🔧 Successfully loaded {len(sui_tools)} MCP tools")
        
        # Phase 1: Collect market data using a swarm of specialized agents
        
        # Create price agent with access to CoinMarketCap API via MCP
        price_agent = Agent(
            name="price_researcher",
            system_prompt=(
                "You are a Bitcoin price research specialist. Your job is to analyze BTC market data and deliver "
                "concise, actionable insights.\n\n"
                "Do the following:\n"
                "1. Use get_major_crypto_prices to retrieve BTC price, market cap, volume, and 24h changes.\n"
                "2. Analyze key metrics: momentum, volatility, volume trends, and support/resistance levels.\n"
                "3. Provide a short summary of current market conditions and key price levels to watch.\n\n"
                "Do not provide trading decisions. Only report analysis and data."
            ),
            tools=[sui_tools]
        )
        
        # Create news research agent with web search
        news_agent = Agent(
            name="news_researcher",
            system_prompt=(
                "You are a Bitcoin news researcher. Your job is to find and summarize news from the last 24–48 hours "
                "that may impact BTC price.\n\n"
                "Do the following:\n"
                "1. Search for recent BTC-related news using http_request (regulation, institutional moves, tech updates, macro events, market sentiment).\n"
                "2. Classify each item as bullish, bearish, or neutral.\n"
                "3. Provide a concise summary of overall news impact and whether it supports or contradicts technical signals.\n\n"
                "Always include credible sources and briefly estimate potential market impact."
            ),
            tools=[http_request]
        )

        # Create trading research swarm
        swarm = Swarm(
            [price_agent, news_agent],
            entry_point=price_agent,  # Start with price analysis
            max_handoffs=10,
            max_iterations=15,
            execution_timeout=600.0,  # 10 minutes
            node_timeout=180.0,       # 3 minutes per agent
            repetitive_handoff_detection_window=6,
            repetitive_handoff_min_unique_agents=2,
            session_manager=session_manager
        )

        # Execute trading research swarm 
        research_task = (
            "Conduct a Bitcoin market research cycle. Do not provide a trading decision.\n\n"
            "Your output must include:\n"
            "1. BTC price analysis (momentum, volatility, volume, key levels).\n"
            "2. News impact summary from the last 24–48 hours (bullish/bearish/neutral).\n"
            "3. Combined interpretation of market structure + news.\n"
            "4. Important levels to watch (supports, resistances, volatility zones).\n"
            "5. Any significant risks or uncertainties.\n\n"
            "Only provide analysis. The execution agent will decide whether to trade."
        )
        
        logger.info('🤖 Starting trading research swarm...')
        result = swarm(research_task)
        
        # Display results
        print(f"\n{'='*60}")
        print("📊 TRADING RESEARCH RESULTS")
        print(f"{'='*60}")
        print(f"Status: {result.status}")
        print(f"Execution Time: {result.execution_time:.2f}s")
        print(f"Agent Handoffs: {len(result.node_history) - 1}")
        
        logger.info("✅ Trading research completed successfully")

        # Phase 2: Models independently analyze the swarm output and execute transactions

        logger.info("🤖 Starting Phase 2: Individual AI Trading Execution")
        
        claude_agent = Agent(
            name="claude_trading_agent", 
            agent_id="claude_trading_agent", 
            tools=[sui_tools],  
            model=(BedrockModel(
                model_id="us.anthropic.claude-sonnet-4-5-20250929-v1:0",
                boto_session=boto_session
            )),
            session_manager=session_manager
        )

        nova_agent = Agent(
            name="nova_trading_agent", 
            agent_id="nova_trading_agent", 
            tools=[sui_tools],  
            model=(BedrockModel(
                model_id="us.amazon.nova-pro-v1:0",
                boto_session=boto_session
            )),
            session_manager=session_manager
        )

        llama_agent = Agent(
            name="llama_trading_agent", 
            agent_id="llama_trading_agent", 
            tools=[sui_tools],  
            model=(BedrockModel(
                model_id="us.meta.llama4-maverick-17b-instruct-v1:0",
                boto_session=boto_session
            )),
            session_manager=session_manager
        )
        
        # Create the trading prompt for each agent
        trading_prompt = f"""
You are an AI trading agent competing in Season 1 of a 3-agent BTC trading league (CLAUDE, NOVA, LLAMA).

Access the market research using your session context, then execute the optimal BTC trade.

YOUR TASK:
1. Analyze your competitive position and market conditions
2. Determine the optimal trading strategy (LONG/SHORT) - you MUST take a position
3. Decide position size based on risk management and your competitive situation
4. Execute the trade using the available MCP tools:
   - trade_arena_walrus_store: Store your trade reasoning and data
   - trade_arena_ai_execute_long: Execute LONG positions
   - trade_arena_ai_execute_short: Execute SHORT positions
5. Provide your reasoning, confidence level, and execution details

EXECUTION REQUIREMENTS:
- Always store your trade data on Walrus first with detailed reasoning
- Then execute the trade using the appropriate execution tool
- Include your AI model name, confidence level, and strategic reasoning
- Consider your current ranking and competitive position
- Manage risk appropriately based on your situation
- YOU MUST EXECUTE A TRADE - no holding positions allowed. Choose either LONG or SHORT based on your analysis.

Execute your trade now!
"""
         

        # Execute each agent sequentially
        logger.info("🎯 Executing CLAUDE trading decision...")
        claude_result = claude_agent(trading_prompt)
        print(f"\n{'='*60}")
        print("🤖 CLAUDE TRADING RESULTS")
        print(f"{'='*60}")
        print(str(claude_result))
        
        logger.info("🚀 Executing NOVA trading decision...")
        nova_result = nova_agent(trading_prompt)
        print(f"\n{'='*60}")
        print("🚀 NOVA TRADING RESULTS")
        print(f"{'='*60}")
        print(str(nova_result))
        
        logger.info("🔥 Executing LLAMA trading decision...")
        llama_result = llama_agent(trading_prompt)
        print(f"\n{'='*60}")
        print("🔥 LLAMA TRADING RESULTS")
        print(f"{'='*60}")
        print(str(llama_result))
        
        # Final summary
        print(f"\n{'='*80}")  
        print(f"Total Agent Executions: 4 (1 swarm + 3 individual)")
        logger.info("✅ All AI trading executions completed successfully")

if __name__ == "__main__":
    main()
