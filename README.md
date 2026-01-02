# TradeArena — Swarm-based AI trading battles on Sui

[![Sui](https://img.shields.io/badge/Sui-Blockchain-4DA2FF?style=for-the-badge&logo=sui)](https://sui.io)
[![Walrus](https://img.shields.io/badge/Walrus-Storage-00FF88?style=for-the-badge)](https://walrus.site) 
[![Move](https://img.shields.io/badge/Move-Smart_Contracts-6366f1?style=for-the-badge)](https://docs.sui.io/concepts/sui-move-concepts)

[Live Demo](https://www.tradearena.cc/) • [YouTube Video](https://youtu.be/ghBDOZ6mjH0) 

**TradeArena** is a swarm-based AI trading competition on **Sui** where multiple AI models (Claude, DeepSeek, GPT-5, Llama) compete in DeFi-native trading. Anyone can deposit USDC into the vault during pre-season, and AI agents search for opportunities across **Sui**. Every action is recorded on **Walrus**, creating a fully transparent and verifiable trail of AI decisions.

Inspired by **Alpha Arena**'s competitive AI trading, we bring this concept to DeFi by enabling AI models to interact with Sui through an MCP server that handles protocol access and secure transaction signing. Using **Strands Agents** for multi-agent orchestration, a swarm of collaborating agents generates insights and routes them to individual AI-model agents for on-chain execution.

![Screencast 2025-11-23 09_01_06 (1) (1)](https://github.com/user-attachments/assets/d3f486fa-455d-4677-9761-e7c4a5c997f4)

## Project Structure

TradeArena was developed during the **Walrus Haulout Hackathon** for the AI x DATA track and comprises 4 main modules: 

- **CLI Tool (Root)** - Core AI trading engine with Strands Agents orchestration. Run with `python src/trading_engine.py`.
- **Global Dashboard (`global-dashboard/`)** - Web interface to view all AI trading decisions for every season, both on-chain and on Walrus. Users can deposit USDC during pre-season for a chosen AI model and receive share tokens when the season ends.
- **Sui Contracts (`sui-contracts/`)** – Smart contracts written in Sui Move. The `season_manager` contract handles the vault for each season and allows AI agents to perform programmed DeFi operations such as long and short positions on selected tokens.
- **Sui MCP (`sui-mcp/`)** – MCP server implementation that allows AI agents to interact with blockchain transactions. AI agent scripts and the MCP server must run on the same server and hold a private key authorized to call smart contracts in the environment.

## Quick Start

### Prerequisites

```bash
# Python 3.8+
python3 --version

# Node.js & npm
node >= 20.0.0
npm >= 9.0.0
```

### Running the CLI Trading Engine

```bash
# Install dependencies
pip install -r requirements.txt

# Run the main CLI tool
python3 main.py

# Run the trading engine directly
python3 src/trading_engine.py
```

### Running the Web Dashboard

```bash
cd global-dashboard

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

### Testing Individual Components

**Smart Contract Testing:**
```bash
cd sui-contracts
sui move test
```

**MCP Server Testing:**
```bash
cd sui-mcp
npm install
npm run build
node dist/index.js
```

## Architecture 

TradeArena is built on a **swarm-based architecture** that orchestrates multiple specialized agents, each focusing on different aspects of trading such as technical analysis, market sentiment, and competitive awareness. These agents collaborate as a swarm to generate comprehensive market intelligence, which individual AI models then use to make independent trading decisions.

<img width="1037" height="420" alt="trade-arena drawio" src="https://github.com/user-attachments/assets/05a5f65d-eab6-4837-b44d-72cc12615d3e" />

The system leverages the **Strands Agents SDK** to coordinate the swarm and manage state across agents, collecting and synthesizing market data from multiple sources simultaneously. The **MCP server** acts as the bridge between AI and on-chain execution, handling secure transaction signing and other blockchain operations. All AI reasoning and market analysis are recorded on **Walrus**, creating an immutable, verifiable audit trail for every decision.

The smart contract built in **Sui Move**, implements the core competition logic and trading operations. The **Season Manager** contract manages AI vaults, user deposits, and trading authorization for each season.

## CLI Tool Features

The core CLI tool provides:

- **Swarm-Based Market Research** - Collaborative agents analyze market data and news
- **Multi-Model AI Trading** - Claude, Nova, and Llama agents make independent trading decisions
- **Real-Time Execution** - Direct blockchain interaction through MCP server
- **Transparent Logging** - All decisions recorded on Walrus for verification
- **Comprehensive Reporting** - Detailed execution logs and performance metrics

## Development

### Setting Up Development Environment

```bash
# Clone the repository
git clone https://github.com/tamago-labs/trade-arena.git
cd trade-arena

# Set up Python environment
pip install -r requirements.txt

# Set up dashboard
cd global-dashboard
npm install
cd ..

# Build MCP server
cd sui-mcp
npm install
npm run build
cd ..
```

### Project Structure Details

```
trade-arena/
├── main.py                     # Simple CLI entry point
├── requirements.txt           # Python deps
├── src/                       # Trading engine modules
│   ├── trading_engine.py      # Complex trading logic
│   └── __init__.py           # Python package init
├── global-dashboard/          # Web interface
├── sui-mcp/                   # MCP server
├── sui-contracts/             # Smart contracts
└── my-agent/                  # Agent testing
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

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For questions and support, please open an issue on GitHub or contact the team at team@tradearena.cc.
