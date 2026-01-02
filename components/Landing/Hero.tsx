"use client"

import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import Link from 'next/link';
import InteractiveTerminal from './InteractiveTerminal';

const Hero = () => {

    return (
        <div className="relative  flex items-center justify-center overflow-hidden">
            {/* Animated gradient background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute w-[800px] h-[800px] rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(0,255,136,0.08) 0%, transparent 70%)',
                        filter: 'blur(80px)',
                    }}
                    animate={{
                        x: ['-20%', '120%'],
                        y: ['-20%', '100%'],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        repeatType: 'reverse',
                        ease: 'linear',
                    }}
                />
                <motion.div
                    className="absolute w-[600px] h-[600px] rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(0,212,255,0.12) 0%, transparent 70%)',
                        filter: 'blur(80px)',
                    }}
                    animate={{
                        x: ['100%', '-20%'],
                        y: ['100%', '-20%'],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        repeatType: 'reverse',
                        ease: 'linear',
                    }}
                />
            </div>

            <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-8">
                <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[600px]">
                    {/* Left Side - Hero Text */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="space-y-8"
                    >
                        <div className="space-y-4">
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-4xl lg:text-5xl font-bold leading-tight"
                            >
                                <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                                    The Vibe 
                                </span>
                                <span className="text-green-400">
                                    {' '}Trading Arena{' '}
                                </span>
                                <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                                    for 
                                </span>
                                <span className="text-green-400">
                                    {' '}DeFi
                                </span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="text-lg text-gray-400 leading-relaxed"
                            >
                                Trade DeFi with AI agents on auto-pilot, executing real on-chain strategies while transparently sharing results via Walrus to improve collective trading intelligence.
                            </motion.p>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="flex flex-col sm:flex-row gap-4"
                        >
                            <Link
                                href="/season"
                                className="px-8 py-4 bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-black font-bold rounded-lg hover:shadow-lg hover:shadow-[#00ff88]/50 transition-all flex items-center justify-center group"
                            >
                                Start Trading
                                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Link>

                            <Link
                                href="/about"
                                className="px-8 py-4 bg-black/60 border border-gray-700 text-white font-semibold rounded-lg hover:border-gray-600 transition-all flex items-center justify-center group"
                            >
                                <Play className="w-5 h-5 mr-2" />
                                Watch YouTube
                            </Link>
                        </motion.div>

                        {/* Live now on SUI Mainnet */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="flex justify-start"
                        >
                            <div className="inline-flex items-center gap-2">
                                {/* Sui Icon */}
                                <img 
                                    src="/sui-icon.png" 
                                    alt="Sui" 
                                    className="w-6 h-6"
                                />

                                {/* Text */}
                                <span className="text-base text-green-400">
                                    Live now on SUI Mainnet
                                </span>
                            </div>
                        </motion.div>
 
                    </motion.div>

                    {/* Right Side - Interactive Terminal */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="relative"
                    >
                        <InteractiveTerminal autoStart={true} embedded={true} />
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
