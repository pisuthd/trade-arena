# TradeArena — Swarm-based AI trading battles on Sui

[![Sui](https://img.shields.io/badge/Sui-Blockchain-4DA2FF?style=for-the-badge&logo=sui)](https://sui.io)
[![Walrus](https://img.shields.io/badge/Walrus-Storage-00FF88?style=for-the-badge)](https://walrus.site) 
[![Move](https://img.shields.io/badge/Move-Smart_Contracts-6366f1?style=for-the-badge)](https://docs.sui.io/concepts/sui-move-concepts)

[Live Demo](https://www.tradearena.cc/) • [YouTube Video](./docs) 

**TradeArena** is a swarm-based AI trading competition on **Sui** where multiple AI models (Claude, DeepSeek, GPT-5, Llama) compete in DeFi-native trading. Anyone can deposit USDC into the vault during pre-season, and AI agents search for opportunities across **Sui**. Every action is recorded on **Walrus**, creating a fully transparent and verifiable trail of AI decisions.

Inspired by **Alpha Arena**’s competitive AI trading, we bring this concept to DeFi by enabling AI models to interact with Sui through an MCP server that handles protocol access and secure transaction signing. Using **Strands Agents** for multi-agent orchestration, a swarm of collaborating agents generates insights and routes them to individual AI-model agents for on-chain execution.

![Screencast 2025-11-23 09_01_06 (1) (1)](https://github.com/user-attachments/assets/d3f486fa-455d-4677-9761-e7c4a5c997f4)

## Highlighted Features

- **First AI Trading Competition on Sui** - Pioneer platform combining AI competition with DeFi-native trading.
- **Complete Transparency vs Alpha Arena** – Every AI decision and trade reasoning is verifiable and recorded on Walrus.
- **Real Money Trading** – No simulation; AI finds real yield opportunities across DeFi protocols.
- **Swarm-Based Collaboration** – Uses Strands Agents SDK to coordinate multiple agents to summarizing market data.
- **MCP-Driven Operations** – Access 20+ tools for executing transactions on Sui, including sending tokens, storing and retrieving data from Walrus, trading on DEXs, and interacting with the TradeArena SeasonManager contract.

## Project Structure

TradeArena was developed during the **Walrus Haulout Hackathon** for the AI x DATA track and comprises 4 main modules: 
- **Frontend (/)** - Serves as the main interface to view all AI trading decisions for every season, both on-chain and on Walrus (also AI conversation states stored on S3). Users can deposit USDC during pre-season for a chosen AI model and receive share tokens when the season ends, which can then be used to withdraw their proportional share of the vault.
- **Sui Contracts (/sui-contracts)** – Smart contracts written in Sui Move. The `season_manager` contract handles the vault for each season and allows AI agents to perform programmed DeFi operations such as long and short positions on selected tokens. Since this is on testnet, it includes mock DEXs and tokens.
- **Sui MCP (/sui-mcp)** – MCP server implementation that allows AI agents to interact with blockchain transactions. AI agent scripts and the MCP server must run on the same server and hold a private key authorized to call smart contracts in the environment. The package includes tools covering most operations, including DEX trading and access to the CoinMarketCap API.
- **Strands Agents (/strands-agents)** – Built with the Strands Agent SDK, a multi-agent orchestration framework in Python. Runs as a server script coordinating five agents for the trading competition. Some agents operate as swarms to aggregate data, while others function independently as AI model agents, all working seamlessly together.

## Architecture 

TradeArena is built on a **swarm-based architecture** that orchestrates multiple specialized agents, each focusing on different aspects of trading such as technical analysis, market sentiment, and competitive awareness. These agents collaborate as a swarm to generate comprehensive market intelligence, which individual AI models then use to make independent trading decisions.

<img width="1037" height="420" alt="trade-arena drawio" src="https://github.com/user-attachments/assets/05a5f65d-eab6-4837-b44d-72cc12615d3e" />


The system leverages the **Strands Agents SDK** to coordinate the swarm and manage state across agents, collecting and synthesizing market data from multiple sources simultaneously. The **MCP server** acts as the bridge between AI and on-chain execution, handling secure transaction signing and other blockchain operations. All AI reasoning and market analysis are recorded on **Walrus**, creating an immutable, verifiable audit trail for every decision.

The smart contract built in **Sui Move**, implements the core competition logic and trading operations. The **Season Manager** contract manages AI vaults, user deposits, and trading authorization for each season.

## Sui Contracts

Sui smart contracts handling the entire competition and trading operations. For testnet deployment, we include a Uniswap-style DEX and mock tokens to simulate real DeFi assets. The contracts are written in Sui Move and integrate tightly with AI agents and Walrus for transparent tracking.

### Season Manager 

`season_manager.move` helps managing the full lifecycle of each competition season. It handles pre-season deposits, active trading by AI agents, and post-season settlement. Each season supports multiple AI models with dedicated vaults holding USDC and BTC tokens. Users receive LP tokens representing proportional ownership of the vault, and only authorized AI wallets can execute trades. All AI decisions and trades are logged in Walrus.


**Core Functions:**
```move

// AI executes LONG position (USDC → BTC)
public entry fun ai_execute_long(
    global: &mut SeasonGlobal,
    season_number: u64,
    ai_name: String,
    dex_global: &mut DEXGlobal,
    usdc_amount: u64,
    reasoning: String,
    confidence: u64,
    walrus_blob_id: vector<u8>
)

// User deposits to AI vault (pre-season)
public entry fun deposit_to_vault(
    global: &mut SeasonGlobal,
    season_number: u64,
    ai_name: String,
    usdc: Coin<MOCK_USDC>
)
```

## Sui MCP

The MCP (Model Context Protocol) server provides **AI agents with secure, autonomous access** to Sui on-chain operations. It acts as the bridge between AI decision-making and on-chain execution, allowing agents to perform DeFi operations, manage wallets, interact with DEXs, and record reasoning on Walrus.

The MCP server (sui-mcp/) implements 20+ tools organized into functional categories. These tools cover the full range of operations needed for AI-driven trading, from wallet management to market data retrieval and transaction execution.

Key functional categories include:

- **Basic Operations** – Manage wallets, transfer tokens, and query balances.
- **Trading Tools** – Interact with DEXs, manage positions, and query prices.
- **Walrus Storage** – Store and retrieve AI trade data and reasoning.
- **Price APIs** – Access market data via CoinMarketCap.
- **Transaction Management** – Sign, submit, and monitor blockchain transactions.


### Key Tools

**Trading Operations:**
```typescript
// Execute LONG position
tradeArenaAiExecuteLongTool: {
    name: "trade_arena_ai_execute_long",
    description: "Execute LONG position (USDC → BTC) for AI trading",
    parameters: {
        season_number: "number",
        ai_name: "string", 
        usdc_amount: "number",
        reasoning: "string",
        confidence: "number",
        walrus_blob_id: "string"
    }
}

// Execute SHORT position  
tradeArenaAiExecuteShortTool: {
    name: "trade_arena_ai_execute_short", 
    description: "Execute SHORT position (BTC → USDC) for AI trading"
}
```

**Walrus Integration:**
```typescript
// Store trade data on Walrus
tradeArenaWalrusStoreTool: {
    name: "trade_arena_walrus_store",
    description: "Store AI trade data and reasoning on Walrus",
    parameters: {
        data: "object", // Contains AI decision, market data, reasoning
        epochs: "number" // Storage duration
    }
}
```

The MCP server ensures **secure and isolated AI operations**. Each AI model has a dedicated wallet authorization, and all transactions are validated against vault balances. Private keys are securely managed by the server, and every action is logged with references to Walrus blobs, creating a fully auditable trail.


## Strands Agents

The system uses the Strands Agents SDK to coordinate AI trading through a sophisticated two-phase approach:

### Phase 1: Swarm-Based Market Research

A collaborative swarm of specialized agents gathers and analyzes market data:

**Price Research Agent:**
```python
price_agent = Agent(
    name="price_researcher",
    system_prompt=(
        "You are a Bitcoin price research specialist. Your job is to analyze BTC market data "
        "and deliver concise, actionable insights.\n\n"
        "Do the following:\n"
        "1. Use get_major_crypto_prices to retrieve BTC price, market cap, volume, and 24h changes.\n"
        "2. Analyze key metrics: momentum, volatility, volume trends, and support/resistance levels.\n"
        "3. Provide a short summary of current market conditions and key price levels to watch."
    ),
    tools=[sui_tools]
)
```

**News Research Agent:**
```python
news_agent = Agent(
    name="news_researcher", 
    system_prompt=(
        "You are a Bitcoin news researcher. Find and summarize news from the last 24–48 hours "
        "that may impact BTC price.\n\n"
        "1. Search for recent BTC-related news using http_request\n"
        "2. Classify each item as bullish, bearish, or neutral\n"
        "3. Provide a concise summary of overall news impact"
    ),
    tools=[http_request]
)
```

**Swarm Coordination:**
```python
swarm = Swarm(
    [price_agent, news_agent],
    entry_point=price_agent,
    max_handoffs=10,
    max_iterations=15,
    execution_timeout=600.0,
    session_manager=session_manager
)

research_task = (
    "Conduct a Bitcoin market research cycle. Your output must include:\n"
    "1. BTC price analysis (momentum, volatility, volume, key levels)\n"
    "2. News impact summary from the last 24–48 hours\n"
    "3. Combined interpretation of market structure + news\n"
    "4. Important levels to watch (supports, resistances, volatility zones)"
)
```

### Phase 2: Independent AI Model Execution

After swarm research completes, individual AI models analyze the results and make independent trading decisions:

**Claude Trading Agent:**
```python
claude_agent = Agent(
    name="claude_trading_agent",
    agent_id="claude_trading_agent", 
    tools=[sui_tools],
    model=BedrockModel(
        model_id="us.anthropic.claude-sonnet-4-5-20250929-v1:0",
        boto_session=boto_session
    ),
    session_manager=session_manager
)
```

**Trading Prompt for Each AI:**
```python
trading_prompt = f"""
You are an AI trading agent competing in Season 1 of a 3-agent BTC trading league.

YOUR TASK:
1. Analyze your competitive position and market conditions
2. Determine the optimal trading strategy (LONG/SHORT) - you MUST take a position
3. Decide position size based on risk management and your competitive situation
4. Execute the trade using the available MCP tools:
   - trade_arena_walrus_store: Store your trade reasoning and data
   - trade_arena_ai_execute_long: Execute LONG positions
   - trade_arena_ai_execute_short: Execute SHORT positions

EXECUTION REQUIREMENTS:
- Always store your trade data on Walrus first with detailed reasoning
- Then execute the trade using the appropriate execution tool
- Include your AI model name, confidence level, and strategic reasoning
- YOU MUST EXECUTE A TRADE - no holding positions allowed
"""
```

## How to Test

### Prerequisites

```bash
# Node.js & npm
node >= 20.0.0
npm >= 9.0.0
```

### Smart Contract Testing

```bash
cd sui-contracts

# Run all tests
sui move test

```

### MCP Server Testing

```bash
cd sui-mcp

# Install dependencies
npm install

# Build the project
npm run build

# Run MCP server to test with local MCP client
node /dist/index.js
```

### Strands Agents Testing

```bash
cd strands-agents

# Install Python dependencies
pip install -r requirements.txt

# Run trading cycle 
python main.py
```

## Deployment

### Sui Testnet

Component Name | Address / ID
--- | --- 
TradeArena Package | 0xa51f1f51ae2e6aa8cc88a1221c4e9da644faccdcd87dde9d2858e042634d285f
DEXGlobal | 0xe01a60f171b371a10141476fe421c566bb21d52f1924797fcd44a07d9e9d355b
DEXGlobal ManagerCap | 0xb13f92d70cf5ede40b565fdf7752db80caae340889f604b0ab9e4f0b6eda4185
SeasonGlobal | 0x323afc98c387c70f9bc8528d7355aa7e520c352778c2406f15962f6e064bb9da
SeasonGlobal ManagerCap | 0x7f79dda7c5dda63c2a61396b64b7b1c19a40057f6730ae7bc942c893ddc701a3
Mock USDC Type | 0xa51f1f51ae2e6aa8cc88a1221c4e9da644faccdcd87dde9d2858e042634d285f::mock_usdc::MOCK_USDC
USDCGlobal | 0x1837c2490e780e27f3892ac5a30f241bd4081f80261815f2f381179176327fa1
Mock BTC Type | 0xa51f1f51ae2e6aa8cc88a1221c4e9da644faccdcd87dde9d2858e042634d285f::mock_btc::MOCK_BTC
BTCGlobal |  0x632832dd0857cd6edbdcff08a93b6e74d73ef7dabddf7d973c705d3fa31c26db


---
