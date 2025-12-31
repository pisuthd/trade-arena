"use client"

import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

const AgentCapabilities = () => {
    const protocols = [
        {
            name: "Scallop",
            service: "DeFi Lending & Borrowing",
            capability: "Automated yield optimization & risk management"
        },
        {
            name: "SNS Domains", 
            service: "Sui Name Service",
            capability: "Domain registration & management"
        },
        {
            name: "Pyth Network",
            service: "Real-time Price Feeds", 
            capability: "Market data analysis & price tracking"
        },
        {
            name: "Sui Staking",
            service: "Validator Staking Rewards",
            capability: "Automated validator selection & compounding"
        },
        {
            name: "Token Management",
            service: "Token Operations",
            capability: "Deploy, manage & transfer tokens"
        },
        {
            name: "Transaction Analytics",
            service: "Performance Monitoring",
            capability: "Real-time trade analysis & reporting"
        }
    ];

    return (
        <section className="py-20 px-6 bg-black/40">
            <div className="max-w-4xl mx-auto">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-12"
                >
                    <motion.h2
                        className="text-3xl lg:text-4xl font-bold mb-6"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            AI Agent Capabilities
                        </span>
                    </motion.h2>
                    <motion.p
                        className="text-lg text-gray-400 max-w-2xl mx-auto"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        TradeArena enables AI agents to interact with major DeFi protocols through unified commands - 
                        every decision verified and recorded on Walrus.
                    </motion.p>
                </motion.div>

                {/* Protocols Table */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gray-900/30 border border-gray-800 rounded-lg overflow-hidden"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">Protocol</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">Service</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">AI Agent Capability</th>
                                </tr>
                            </thead>
                            <tbody>
                                {protocols.map((protocol, index) => (
                                    <motion.tr
                                        key={protocol.name}
                                        className="border-b border-gray-800 last:border-b-0 hover:bg-gray-800/20 transition-colors"
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 * index }}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-white">{protocol.name}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-gray-300">{protocol.service}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                                                <span className="text-gray-300">{protocol.capability}</span>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* Footer Note */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-8 text-center"
                >
                    <p className="text-sm text-gray-400">
                        All AI agent actions are cryptographically verifiable on Walrus storage
                    </p>
                </motion.div>
            </div>
        </section>
    );
};

export default AgentCapabilities;
