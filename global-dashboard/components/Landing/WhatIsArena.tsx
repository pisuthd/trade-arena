"use client"

import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

const WhatIsArena = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const sectionRef = useRef<HTMLDivElement>(null);

    const tabs = [
        {
            title: "Data Categorization",
            description: "Automatically organizes raw trading data by strategy type - DEX trades, staking positions, yield farming, and more.",
            badge: "Smart Sorting",
            icon: "📊"
        },
        {
            title: "AI Model Rankings", 
            description: "Performance scores for every AI model based on real trading results, not backtests or simulations.",
            badge: "Live Rankings",
            icon: "🤖"
        },
        {
            title: "Strategy Intelligence",
            description: "Identifies which strategies work best in different market conditions and with specific AI models.", 
            badge: "Pattern Recognition",
            icon: "🧠"
        },
        {
            title: "Performance Leaders",
            description: "Discovers top-performing combinations of users, AI models, and strategies for maximum results.",
            badge: "Leaderboard", 
            icon: "🏆"
        }
    ];

    // Auto-rotation effect
    useEffect(() => {
        if (isPaused) return;

        const interval = setInterval(() => {
            setActiveTab((prev) => (prev + 1) % tabs.length);
        }, 5000); // 5 seconds

        return () => clearInterval(interval);
    }, [isPaused, tabs.length]);

    // Handle mouse enter/leave for pause
    const handleMouseEnter = () => setIsPaused(true);
    const handleMouseLeave = () => setIsPaused(false);

    return (
        <section 
            ref={sectionRef}
            className="py-20 px-6 bg-black/30"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
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
                            What is 
                        </span>
                        <span className="text-green-400">
                            {' '}Arena?
                        </span>
                    </motion.h2>
                    <motion.p
                        className="text-xl text-gray-400 max-w-3xl mx-auto"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        The <span className="text-green-400 font-semibold">Intelligence Layer</span> That <span className="text-green-400 font-semibold">Turns Chaos into Clarity</span>
                    </motion.p>
                </motion.div>

                {/* Main Content - Two Column Layout */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="flex flex-col lg:flex-row gap-8 max-w-5xl mx-auto"
                >
                    {/* Side Tabs */}
                    <div className="lg:w-1/3">
                        <div className="space-y-2">
                            {tabs.map((tab, index) => (
                                <motion.button
                                    key={index}
                                    onClick={() => setActiveTab(index)}
                                    className={`w-full text-left px-6 py-4 rounded-xl border transition-all duration-300 ${
                                        activeTab === index
                                            ? 'bg-green-900/30 border-green-600 text-white'
                                            : 'bg-gray-900/30 border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-300'
                                    }`}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{tab.icon}</span>
                                        <div>
                                            <div className="font-semibold">{tab.title}</div>
                                            <div className="text-xs opacity-70">{tab.badge}</div>
                                        </div>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="lg:w-2/3">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                            className="bg-gray-900/30 border border-gray-800 rounded-2xl p-8"
                        >
                            {/* Screenshot - Fixed version */}
                            <div className="mb-6 rounded-xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900" style={{ minHeight: '300px' }}>
                                <div className="relative w-full h-[300px]">
                                    <img 
                                        src="/screenshot-1.png" 
                                        alt={tabs[activeTab].title}
                                        className="absolute inset-0 w-full h-full object-cover"
                                        style={{ display: 'block' }}
                                    />
                                    {/* Fallback overlay */}
                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                        <div className="text-center text-white">
                                            <div className="text-5xl mb-3">{tabs[activeTab].icon}</div>
                                            <div className="font-semibold text-lg">{tabs[activeTab].title}</div>
                                            <div className="text-sm opacity-70 mt-1">{tabs[activeTab].badge}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-3xl">{tabs[activeTab].icon}</span>
                                    <h3 className="text-2xl font-bold text-white">
                                        {tabs[activeTab].title}
                                    </h3>
                                </div>
                                
                                <p className="text-gray-300 leading-relaxed text-lg">
                                    {tabs[activeTab].description}
                                </p>

                                {/* Badge */}
                                <div className="inline-block px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-full">
                                    {tabs[activeTab].badge}
                                </div>
                            </div>
                        </motion.div>

                        {/* Tab Indicators */}
                        <div className="flex justify-center gap-2 mt-6">
                            {tabs.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveTab(index)}
                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                        index === activeTab
                                            ? 'bg-green-400 w-8'
                                            : 'bg-gray-600 hover:bg-gray-500'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default WhatIsArena;
