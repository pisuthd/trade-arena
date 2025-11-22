
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
    region_name="us-east-1"  
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
            "3. Provide a concise summary of the overall news impact and whether it supports or contradicts technical signals.\n\n"
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

    


