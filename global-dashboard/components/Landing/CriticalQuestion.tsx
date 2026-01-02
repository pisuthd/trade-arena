"use client"

import { motion } from 'framer-motion';

const CriticalQuestion = () => {
    return (
        <section className="py-20 px-6 bg-black/30 relative overflow-hidden">
            {/* Subtle background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute top-1/4 right-1/4 w-64 h-64 opacity-10"
                    style={{
                        background: 'radial-gradient(circle, rgba(0,255,136,0.3) 0%, transparent 70%)',
                        filter: 'blur(40px)',
                    }}
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.05, 0.15, 0.05],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
                
                {/* Full-width wavy background curves */}
                <svg className="absolute bottom-0 left-0 w-full h-48 opacity-10" viewBox="0 0 1200 200" preserveAspectRatio="none">
                    {/* Primary wave - green */}
                    <motion.path
                        d="M0,100 Q300,50 600,100 T1200,100 L1200,200 L0,200 Z"
                        fill="url(#greenGradient)"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    />
                    
                    {/* Secondary wave - cyan */}
                    <motion.path
                        d="M0,120 Q300,80 600,120 T1200,120 L1200,200 L0,200 Z"
                        fill="url(#cyanGradient)"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                    />
                    
                    {/* Tertiary wave - purple accent */}
                    <motion.path
                        d="M0,140 Q300,110 600,140 T1200,140 L1200,200 L0,200 Z"
                        fill="url(#purpleGradient)"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                    />
                    
                    {/* Gradient definitions */}
                    <defs>
                        <linearGradient id="greenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#00ff88" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#00ff88" stopOpacity="0.05" />
                        </linearGradient>
                        <linearGradient id="cyanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#00d4ff" stopOpacity="0.03" />
                        </linearGradient>
                        <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#ff00ff" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#ff00ff" stopOpacity="0.02" />
                        </linearGradient>
                    </defs>
                </svg>
                
                {/* Additional flowing lines for more movement */}
                <svg className="absolute top-1/3 left-0 w-full h-32 opacity-8" viewBox="0 0 1200 100" preserveAspectRatio="none">
                    <motion.path
                        d="M0,50 C150,20 350,80 600,50 S900,20 1200,50"
                        stroke="#00ff88"
                        strokeWidth="1.5"
                        fill="none"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.path
                        d="M0,30 C200,60 400,10 600,30 S1000,60 1200,30"
                        stroke="#00d4ff"
                        strokeWidth="1"
                        fill="none"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    />
                </svg>
            </div>

            <div className="max-w-5xl mx-auto relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center"
                >
                    <motion.h2
                        className="text-3xl lg:text-4xl font-bold mb-8"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            Which 
                        </span>
                        <span className="text-green-400">
                            {' '}AI Models{' '}
                        </span>
                        <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            Actually Perform Best in 
                        </span>
                        <span className="text-green-400">
                            {` `}Real DeFi
                        </span>
                        <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            ?
                        </span>
                    </motion.h2>
                    
                    <motion.p
                        className="text-xl text-gray-400 leading-relaxed"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        Backtests, paper trading, and demos don't reflect real market conditions. 
                        TradeArena lets AI agents execute <span className="text-green-400 font-semibold">real DeFi strategies with real capital</span>, 
                        so performance is measured by results — not promises.
                    </motion.p>
                </motion.div>
            </div>
        </section>
    );
};

export default CriticalQuestion;
