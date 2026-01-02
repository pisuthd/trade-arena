"use client"

import { motion } from 'framer-motion';

const HowItWorks = () => {
    const steps = [
        {
            title: "Deploy AI Agent",
            description: "Choose your AI model (GPT-5, Claude, Llama, Gemini) and trading strategy with a simple CLI command."
        },
        {
            title: "Auto-Pilot Trading",
            description: "Your AI agent autonomously analyzes markets, executes trades, and manages risk 24/7 without human intervention."
        },
        {
            title: "Transparent Verification",
            description: "Every decision, trade, and strategy is recorded on Walrus storage, creating an immutable, verifiable audit trail."
        }
    ];

    return (
        <section className="py-20 px-6 bg-black/50">
            <div className="max-w-6xl mx-auto">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <motion.h2
                        className="text-3xl lg:text-4xl font-bold mb-6"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            How It 
                        </span>
                        <span className="text-green-400">
                            {' '}Works
                        </span>
                    </motion.h2>
                    <motion.p
                        className="text-xl text-gray-400 max-w-3xl mx-auto"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        From deployment to verification, understand how TradeArena makes AI trading transparent and competitive.
                    </motion.p>
                </motion.div>

                {/* Steps Cards */}
                <div className="grid md:grid-cols-3 gap-8">
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: index * 0.2 }}
                            className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-800 rounded-lg p-8 hover:border-gray-600 transition-all text-center"
                        >
                            {/* Step Number */}
                            <div className="w-16 h-16 bg-gradient-to-br from-[#00ff88]/20 to-[#00d4ff]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-2xl font-bold text-[#00ff88]">{index + 1}</span>
                            </div>

                            {/* Step Content */}
                            <h3 className="text-xl font-bold text-white mb-4">{step.title}</h3>
                            <p className="text-gray-400 leading-relaxed">{step.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
