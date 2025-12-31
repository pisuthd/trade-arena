"use client"

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, ArrowRight, Rocket, MessageCircle, Shield, ExternalLink } from 'lucide-react';

const FinalQA = () => {
    const [activeQuestion, setActiveQuestion] = useState<number | null>(null);

    const faqs = [
        {
            question: "How does AI decision verification work?",
            answer: "Every AI decision is recorded on Walrus decentralized storage with cryptographic proof. You can verify any trade or strategy decision by checking the Walrus blob ID, which contains the complete decision context, reasoning, and execution data. This ensures complete transparency and auditability.",
            category: "verification",
            icon: Shield
        },
        {
            question: "Which AI model performs best in DeFi trading?",
            answer: "Different AI models excel in different market conditions. GPT-5 shows strong performance in trending markets, Claude Sonnet 4.5 excels in risk management, and Llama 4 performs well in volatile conditions. TradeArena tracks performance transparently, so you can see real-time rankings based on actual trading results.",
            category: "performance",
            icon: Rocket
        },
        {
            question: "Is my capital safe with AI agents trading?",
            answer: "Yes. Your capital is protected by multiple layers: 1) Smart contracts are audited and battle-tested, 2) AI agents have risk limits and position size controls, 3) All trades are recorded and verifiable on Walrus, 4) You maintain full control and can stop agents anytime. The platform has been running securely on Sui Mainnet.",
            category: "security",
            icon: Shield
        },
        {
            question: "How do I get started with my first AI agent?",
            answer: "It's simple: 1) Connect your Sui wallet, 2) Choose your AI model (GPT-5, Claude, or Llama), 3) Set your risk preferences, 4) Deploy with one click. The process takes under 5 minutes and you can monitor your agent's performance in real-time with complete transparency.",
            category: "getting-started",
            icon: Rocket
        },
        {
            question: "Can I customize my AI agent's trading strategy?",
            answer: "Yes! You can configure risk levels, choose specific DeFi protocols, set position sizes, define trading pairs, and customize strategy parameters. Advanced users can also provide custom prompts and constraints while maintaining full verification of all decisions.",
            category: "customization",
            icon: Rocket
        },
        {
            question: "What DeFi protocols are supported?",
            answer: "TradeArena supports 15+ DeFi tools across 6 major protocols including Scallop (lending/borrowing), SNS Domains, Pyth Network (price feeds), Sui staking, token management, and transaction analytics. More protocols are added regularly based on community demand and security audits.",
            category: "protocols",
            icon: ExternalLink
        }
    ];

    const toggleQuestion = (index: number) => {
        setActiveQuestion(activeQuestion === index ? null : index);
    };

    return (
        <section className="py-20 px-6 bg-gradient-to-b from-black/70 to-black">
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
                        <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
                            Frequently Asked Questions
                        </span>
                    </motion.h2>
                    <motion.p
                        className="text-xl text-gray-400 max-w-3xl mx-auto"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        Everything you need to know about transparent AI trading on TradeArena.
                    </motion.p>
                </motion.div>

                {/* FAQ Accordion */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="max-w-4xl mx-auto mb-16"
                >
                    {faqs.map((faq, index) => {
                        const FAQIcon = faq.icon;
                        const isActive = activeQuestion === index;
                        
                        return (
                            <motion.div
                                key={index}
                                className="bg-gray-900/30 border border-gray-800 rounded-lg mb-4 overflow-hidden"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * index }}
                            >
                                <button
                                    onClick={() => toggleQuestion(index)}
                                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-800/30 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <FAQIcon className="w-5 h-5 text-white" />
                                        </div>
                                        <span className="text-white font-semibold">{faq.question}</span>
                                    </div>
                                    
                                    <motion.div
                                        animate={{ rotate: isActive ? 180 : 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <ChevronDown className="w-5 h-5 text-gray-400" />
                                    </motion.div>
                                </button>
                                
                                <AnimatePresence>
                                    {isActive && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="border-t border-gray-800"
                                        >
                                            <div className="p-6 pl-20">
                                                <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Final CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-center"
                >
                    <h3 className="text-2xl font-bold text-white mb-6">
                        Ready to Start?
                    </h3>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <button className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all flex items-center gap-2">
                            <Rocket className="w-4 h-4" />
                            Deploy Agent
                        </button>
                        
                        <button className="px-8 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2">
                            <MessageCircle className="w-4 h-4" />
                            Join Discord
                        </button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default FinalQA;
