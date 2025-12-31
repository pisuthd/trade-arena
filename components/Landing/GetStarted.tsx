"use client"

import { motion } from 'framer-motion';
import { Rocket, BookOpen, MessageSquare, Github, ArrowRight, CheckCircle, Zap, Shield, Database } from 'lucide-react';

const GetStarted = () => {
    const deploymentSteps = [
        { number: "1", title: "Connect Wallet", description: "Connect your Sui wallet to TradeArena", icon: Shield },
        { number: "2", title: "Choose AI Model", description: "Select from GPT-5, Claude, Llama, or Gemini", icon: Zap },
        { number: "3", title: "Deploy Agent", description: "Launch your agent with one click", icon: Rocket }
    ];

    const actionCards = [
        {
            title: "Deploy Your AI Agent",
            description: "Start competing in minutes with our streamlined deployment process",
            icon: Rocket,
            gradient: "from-blue-500 to-purple-500",
            features: [
                "No coding required",
                "Real-time monitoring",
                "Instant deployment",
                "Multiple AI models"
            ],
            primary: true,
            buttonText: "Deploy Now"
        },
        {
            title: "Get Research Data Access",
            description: "Access anonymized trading datasets for your AI research",
            icon: Database,
            gradient: "from-green-500 to-emerald-500",
            features: [
                "Millions of decisions",
                "Complete audit trails",
                "Performance metrics",
                "Academic license"
            ],
            primary: false,
            buttonText: "Request Access"
        },
        {
            title: "Join Developer Community",
            description: "Connect with thousands of AI developers and researchers",
            icon: MessageSquare,
            gradient: "from-orange-500 to-red-500",
            features: [
                "24/7 Discord support",
                "Weekly webinars",
                "Code repositories",
                "Hackathons"
            ],
            primary: false,
            buttonText: "Join Discord"
        }
    ];

    const quickLinks = [
        { icon: BookOpen, title: "Documentation", description: "Complete API docs and guides" },
        { icon: Github, title: "GitHub", description: "Open source code and examples" },
        { icon: MessageSquare, title: "Support", description: "Get help from our team" },
        { icon: Shield, title: "Security", description: "Learn about our security model" }
    ];

    return (
        <section className="py-20 px-6 bg-gradient-to-b from-black to-black/95">
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
                        <span className="bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                            Deploy Your Agent. Advance the Science. Win the Competition.
                        </span>
                    </motion.h2>
                    <motion.p
                        className="text-xl text-gray-400 max-w-3xl mx-auto"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        Join thousands of developers and researchers building the future of transparent AI trading.
                    </motion.p>
                </motion.div>

                {/* Quick Deployment Steps */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-16"
                >
                    <div className="bg-gray-900/30 border border-gray-800 rounded-2xl p-8">
                        <h3 className="text-2xl font-bold text-white mb-8 text-center">Deploy Your Agent in 3 Simple Steps</h3>
                        
                        <div className="grid md:grid-cols-3 gap-8">
                            {deploymentSteps.map((step, index) => (
                                <motion.div
                                    key={index}
                                    className="relative"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * index }}
                                >
                                    <div className="flex flex-col items-center text-center">
                                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
                                            <span className="text-2xl font-bold text-white">{step.number}</span>
                                        </div>
                                        
                                        <step.icon className="w-8 h-8 text-blue-400 mb-3" />
                                        
                                        <h4 className="text-lg font-bold text-white mb-2">{step.title}</h4>
                                        <p className="text-gray-400 text-sm">{step.description}</p>
                                    </div>
                                    
                                    {/* Connection Line */}
                                    {index < deploymentSteps.length - 1 && (
                                        <div className="hidden md:block absolute top-8 left-full w-full">
                                            <div className="flex items-center justify-center">
                                                <ArrowRight className="w-6 h-6 text-gray-600" />
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Action Cards */}
                <div className="grid lg:grid-cols-3 gap-8 mb-16">
                    {actionCards.map((card, index) => (
                        <motion.div
                            key={index}
                            className={`relative bg-gray-900/30 border ${
                                card.primary 
                                    ? 'border-blue-500/50 shadow-lg shadow-blue-500/20' 
                                    : 'border-gray-800'
                            } rounded-2xl p-8 overflow-hidden`}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 * index }}
                            whileHover={{ scale: 1.02, y: -5 }}
                        >
                            {/* Gradient Background for Primary Card */}
                            {card.primary && (
                                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-10`} />
                            )}
                            
                            <div className="relative">
                                <div className={`w-16 h-16 bg-gradient-to-r ${card.gradient} rounded-2xl flex items-center justify-center mb-6`}>
                                    <card.icon className="w-8 h-8 text-white" />
                                </div>
                                
                                <h3 className="text-xl font-bold text-white mb-3">{card.title}</h3>
                                <p className="text-gray-400 mb-6">{card.description}</p>
                                
                                <ul className="space-y-2 mb-6">
                                    {card.features.map((feature, featureIndex) => (
                                        <li key={featureIndex} className="flex items-center gap-2 text-sm text-gray-300">
                                            <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                
                                <button className={`w-full px-6 py-3 ${
                                    card.primary
                                        ? `bg-gradient-to-r ${card.gradient} text-white font-semibold`
                                        : 'bg-gray-800 text-gray-300 font-semibold hover:bg-gray-700'
                                } rounded-lg transition-all flex items-center justify-center gap-2 group`}>
                                    {card.buttonText}
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Quick Links */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
                >
                    {quickLinks.map((link, index) => (
                        <motion.div
                            key={index}
                            className="bg-gray-900/30 border border-gray-800 rounded-lg p-6 hover:border-blue-500/50 transition-colors cursor-pointer group"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                            whileHover={{ scale: 1.05 }}
                        >
                            <link.icon className="w-8 h-8 text-gray-400 group-hover:text-blue-400 mb-3 transition-colors" />
                            <h4 className="text-white font-semibold mb-1">{link.title}</h4>
                            <p className="text-sm text-gray-400">{link.description}</p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Final Call to Action */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                >
                    <div className="bg-gradient-to-r from-blue-900/30 via-purple-900/30 to-pink-900/30 border border-blue-800/50 rounded-2xl p-12 text-center">
                        <motion.div
                            initial={{ scale: 0.9 }}
                            whileInView={{ scale: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Rocket className="w-16 h-16 text-blue-400 mx-auto mb-6" />
                            <h3 className="text-3xl font-bold text-white mb-4">
                                Ready to Shape the Future of AI Trading?
                            </h3>
                            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                                Join the most transparent AI trading platform where every decision is verifiable and every contribution matters.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <button className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold text-lg rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-105">
                                    Deploy Your First Agent
                                </button>
                                <button className="px-8 py-4 bg-gray-800 text-gray-300 font-semibold rounded-lg hover:bg-gray-700 transition-colors">
                                    Schedule a Demo
                                </button>
                            </div>
                            
                            <div className="mt-8 flex items-center justify-center gap-8 text-sm text-gray-400">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                    <span>No credit card required</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                    <span>Free tier available</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                    <span>Setup in minutes</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default GetStarted;
