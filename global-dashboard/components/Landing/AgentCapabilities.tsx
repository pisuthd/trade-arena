"use client"

import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

const AgentCapabilities = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const sliderRef = useRef<HTMLDivElement>(null);

    const toolCategories = [
        {
            id: 'core-wallet',
            title: 'Core Wallet Tools',
            description: 'Essential wallet operations for managing SUI coins and transactions',
            tools: [
                'Get all coin balances',
                'Transfer coins to another address',
                'Get crypto price from Pyth',
                'Get SNS domain info'
            ]
        },
        {
            id: 'validator-staking',
            title: 'Validator Staking',
            description: 'Complete staking operations for SUI token validation and rewards',
            tools: [
                'Get all active validators with performance data',
                'Stake SUI tokens to a validator',
                'Get all staked SUI tokens balance',
                'Unstake SUI tokens from validator'
            ]
        }
    ];

    const scrollToCard = (index: number) => {
        if (sliderRef.current) {
            const cardWidth = (sliderRef.current.children[0] as HTMLElement)?.offsetWidth || 0;
            const gap = 24; // gap-6 = 24px
            const scrollPosition = index * (cardWidth + gap);
            sliderRef.current.scrollTo({
                left: scrollPosition,
                behavior: 'smooth'
            });
            setCurrentIndex(index);
        }
    };

    const nextCard = () => {
        const nextIndex = (currentIndex + 1) % toolCategories.length;
        scrollToCard(nextIndex);
    };

    const prevCard = () => {
        const prevIndex = currentIndex === 0 ? toolCategories.length - 1 : currentIndex - 1;
        scrollToCard(prevIndex);
    };

    // Handle scroll to update current index
    useEffect(() => {
        const handleScroll = () => {
            if (sliderRef.current) {
                const cardWidth = (sliderRef.current.children[0] as HTMLElement)?.offsetWidth || 0;
                const gap = 24;
                const scrollPosition = sliderRef.current.scrollLeft;
                const index = Math.round(scrollPosition / (cardWidth + gap));
                setCurrentIndex(index);
            }
        };

        const slider = sliderRef.current;
        if (slider) {
            slider.addEventListener('scroll', handleScroll);
            return () => slider.removeEventListener('scroll', handleScroll);
        }
    }, []);

    return (
        <section className="py-20 px-6 bg-black/40">
            <div className="max-w-6xl mx-auto">
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
                        <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            Built-in
                        </span>
                        <span className="text-green-400">
                            {' '}Tools
                        </span>
                    </motion.h2>
                    <motion.p
                        className="text-lg text-gray-400 max-w-3xl mx-auto"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        TradeArena provides comprehensive toolsets for AI agents to interact with the Sui ecosystem from validator staking to DeFi strategies, enabling fully autonomous vibe trading on-chain.
                    </motion.p>
                </motion.div>

                {/* Slider Container */}
                <div className="relative">
                    {/* Navigation Buttons */}
                    {toolCategories.length > 1 && (
                        <>
                            <button
                                onClick={prevCard}
                                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-black/80 backdrop-blur-sm border border-gray-700 rounded-full p-3 hover:bg-gray-900 transition-colors"
                                aria-label="Previous category"
                            >
                                <ChevronLeft className="w-5 h-5 text-gray-300" />
                            </button>
                            <button
                                onClick={nextCard}
                                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-black/80 backdrop-blur-sm border border-gray-700 rounded-full p-3 hover:bg-gray-900 transition-colors"
                                aria-label="Next category"
                            >
                                <ChevronRight className="w-5 h-5 text-gray-300" />
                            </button>
                        </>
                    )}

                    {/* Cards Slider */}
                    <div
                        ref={sliderRef}
                        className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {toolCategories.map((category, index) => (
                            <motion.div
                                key={category.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                className="flex-none w-full max-w-md"
                            >
                                <div className="relative overflow-hidden bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-800 rounded-xl p-8 hover:border-gray-600 transition-all duration-300 h-full">
                                    {/* Background SUI Icon */}
                                    <div className="absolute top-[-60px] right-[-60px] opacity-10">
                                        <Image
                                            src="/sui-icon.png"
                                            alt="SUI"
                                            width={200}
                                            height={200}
                                            className="w-[200px] h-[200px]"
                                        />
                                    </div>

                                    {/* Category Header */}
                                    <div className="flex items-start gap-4 mb-6 relative z-10">
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-1">{category.title}</h3>
                                            <p className="text-sm text-gray-400">{category.description}</p>
                                        </div>
                                    </div>

                                    {/* Tools List */}
                                    <div className="space-y-3 relative z-10">
                                        {category.tools.map((tool, toolIndex) => (
                                            <motion.div
                                                key={toolIndex}
                                                initial={{ opacity: 0, x: -20 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.1 * toolIndex }}
                                                className="flex items-start gap-3"
                                            >
                                                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                                <span className="text-gray-300 leading-relaxed">{tool}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Pagination Dots */}
                    {toolCategories.length > 1 && (
                        <div className="flex justify-center gap-2 mt-6">
                            {toolCategories.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => scrollToCard(index)}
                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex
                                            ? 'bg-green-400 w-8'
                                            : 'bg-gray-600 hover:bg-gray-500'
                                        }`}
                                    aria-label={`Go to category ${index + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Hide scrollbar styles */}
            <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </section>
    );
};

export default AgentCapabilities;