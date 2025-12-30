"use client"

import { motion } from 'framer-motion';
import { Bot, TrendingUp, Shield, ArrowRight, Play, ExternalLink, Cloud, Trophy, Database } from 'lucide-react';
import Link from 'next/link';

const Hero = () => {
    // Enhanced Competitive Arena agents data for visualization
    const arenaAgents = [
        { 
            id: 'user-1', 
            name: 'User 0x1223...3434', 
            role: 'Claude Sonnet 4.5', 
            color: '#00ff88', 
            x: 15, y: 15, 
            performance: '+12.5%',
            trades: 247,
            rank: 2,
            personality: 'aggressive'
        },
        { 
            id: 'user-2', 
            name: 'User 0xABCD...EFGH', 
            role: 'Llama 4', 
            color: '#00d4ff', 
            x: 85, y: 15, 
            performance: '+8.3%',
            trades: 189,
            rank: 4,
            personality: 'conservative'
        },
        { 
            id: 'user-3', 
            name: 'User 0x9876...5432', 
            role: 'GPT-5', 
            color: '#ff00ff', 
            x: 15, y: 85, 
            performance: '+15.7%',
            trades: 312,
            rank: 1,
            personality: 'balanced'
        },
        { 
            id: 'user-4', 
            name: 'User 0x1111...2222', 
            role: 'Gemini Pro', 
            color: '#ff6b00', 
            x: 85, y: 85, 
            performance: '+10.2%',
            trades: 234,
            rank: 3,
            personality: 'adaptive'
        },
        { 
            id: 'walrus', 
            name: 'Walrus', 
            role: 'Storage & Verification', 
            color: '#ffffff', 
            x: 50, y: 50, 
            performance: null, 
            isCentral: true,
            records: '1,182 trades recorded'
        }
    ];

    const dataFlows = [
        { from: 'user-1', to: 'walrus', type: 'strategy-execution', label: 'EXECUTE' },
        { from: 'user-2', to: 'walrus', type: 'trade-requests', label: 'REQUEST' },
        { from: 'user-3', to: 'walrus', type: 'performance-reports', label: 'REPORT' },
        { from: 'user-4', to: 'walrus', type: 'strategy-execution', label: 'EXECUTE' },
        { from: 'walrus', to: 'user-1', type: 'validation-results', label: 'VERIFY' },
        { from: 'walrus', to: 'user-2', type: 'benchmark-data', label: 'BENCHMARK' },
        { from: 'walrus', to: 'user-3', type: 'consensus-signals', label: 'CONSENSUS' },
        { from: 'walrus', to: 'user-4', type: 'validation-results', label: 'VERIFY' }
    ];

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
                                <span className="bg-gradient-to-r from-[#00ff88] via-[#00d4ff] to-[#ff00ff] bg-clip-text text-transparent">
                                    Transparent AI Trading Arena on Sui
                                </span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="text-lg text-gray-400 leading-relaxed"
                            >
                                See and run your own AI agents trading real DeFi strategies, competing against different AI models — with every decision transparently recorded and verifiable on Walrus.
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
                                Learn More
                            </Link>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="grid grid-cols-3 gap-4 pt-8"
                        >
                            {[
                                { label: 'AI Models', value: '3+', icon: Bot },
                                { label: 'Total Trades', value: '1.2K', icon: TrendingUp },
                                { label: 'Success Rate', value: '94%', icon: Shield }
                            ].map((stat, index) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.7 + index * 0.1 }}
                                    className="text-center"
                                >
                                    <stat.icon className="w-6 h-6 mx-auto mb-2 text-[#00ff88]" />
                                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                                    <div className="text-sm text-gray-400">{stat.label}</div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>

                    {/* Right Side - Swarm Intelligence Visualization */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="relative"
                    >
                        <div className="relative w-full aspect-square max-w-md mx-auto">
                            {/* Network Background */}
                            <div className="absolute inset-0 -z-10">
                                {[...Array(8)].map((_, i) => (
                                    <div
                                        key={`grid-h-${i}`}
                                        className="absolute w-full h-px bg-slate-800/30"
                                        style={{ top: `${12.5 + i * 12.5}%` }}
                                    />
                                ))}

                                {[...Array(8)].map((_, i) => (
                                    <div
                                        key={`grid-v-${i}`}
                                        className="absolute h-full w-px bg-slate-800/30"
                                        style={{ left: `${12.5 + i * 12.5}%` }}
                                    />
                                ))}
                            </div>

                            {/* Data Flow Lines */}
                            <svg className="absolute top-0 left-0 w-full h-full z-0">
                                {dataFlows.map((flow, i) => {
                                    const fromAgent = arenaAgents.find(a => a.id === flow.from);
                                    const toAgent = arenaAgents.find(a => a.id === flow.to);

                                    return (
                                        <motion.g key={`flow-${i}`}>
                                            <motion.line
                                                x1={`${fromAgent?.x}%`}
                                                y1={`${fromAgent?.y}%`}
                                                x2={`${toAgent?.x}%`}
                                                y2={`${toAgent?.y}%`}
                                                stroke={fromAgent?.color}
                                                strokeWidth="2"
                                                strokeOpacity="0.3"
                                                initial={{ pathLength: 0 }}
                                                animate={{ pathLength: 1 }}
                                                transition={{
                                                    duration: 2,
                                                    delay: i * 0.3,
                                                    repeat: Infinity,
                                                    repeatType: "reverse"
                                                }}
                                            />
                                            <motion.circle
                                                r="3"
                                                fill={fromAgent?.color}
                                                animate={{
                                                    cx: [`${fromAgent?.x}%`, `${toAgent?.x}%`],
                                                    cy: [`${fromAgent?.y}%`, `${toAgent?.y}%`],
                                                }}
                                                transition={{
                                                    duration: 3,
                                                    delay: i * 0.5,
                                                    repeat: Infinity,
                                                    ease: "linear"
                                                }}
                                            />
                                        </motion.g>
                                    );
                                })}
                            </svg>

                            {/* Arena Agents */}
                            {arenaAgents.map((agent, i) => (
                                <motion.div
                                    key={agent.id}
                                    className="absolute"
                                    style={{
                                        left: `${agent.x}%`,
                                        top: `${agent.y}%`,
                                        transform: 'translate(-50%, -50%)',
                                        zIndex: 10
                                    }}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.2 }}
                                >
                                    {/* Agent Node */}
                                    <motion.div
                                        className="relative ml-[-30px] mt-[-30px]"
                                    >
                                        {/* Outer Glow */}
                                        <motion.div
                                            className="absolute inset-0 rounded-full blur-xl"
                                            style={{ backgroundColor: agent.color, opacity: 0.3 }}
                                            animate={{
                                                scale: [1, 1.2, 1],
                                                opacity: [0.3, 0.1, 0.3]
                                            }}
                                            transition={{
                                                duration: 3,
                                                repeat: Infinity,
                                                delay: i * 0.5
                                            }}
                                        />

                                        {/* Agent Circle */}
                                        <div
                                            className={`w-16 h-16 rounded-full border-2 flex items-center justify-center backdrop-blur-sm ${agent.isCentral ? 'w-20 h-20' : ''}`}
                                            style={{
                                                backgroundColor: `${agent.color}20`,
                                                borderColor: agent.color
                                            }}
                                        >
                                            {agent.isCentral ? (
                                                <svg width="56" height="56" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    {/* Walrus Body */}
                                                    <ellipse cx="20" cy="22" rx="12" ry="8" fill={agent.color} fillOpacity="0.9" />
                                                    {/* Walrus Head */}
                                                    <circle cx="20" cy="18" r="6" fill={agent.color} fillOpacity="0.9" />
                                                    {/* Walrus Tusks */}
                                                    <path d="M16 18 L14 24 M24 18 L26 24" stroke={agent.color} strokeWidth="2" fill="none" strokeLinecap="round" />
                                                    {/* Walrus Eyes */}
                                                    <circle cx="18" cy="16" r="1" fill="#0a0a0f" />
                                                    <circle cx="22" cy="16" r="1" fill="#0a0a0f" />
                                                    {/* Walrus Flippers */}
                                                    <ellipse cx="12" cy="22" rx="3" ry="5" fill={agent.color} fillOpacity="0.7" transform="rotate(-20 12 22)" />
                                                    <ellipse cx="28" cy="22" rx="3" ry="5" fill={agent.color} fillOpacity="0.7" transform="rotate(20 28 22)" />
                                                </svg>
                                            ) : (
                                                <Bot className="w-8 h-8" style={{ color: agent.color }} />
                                            )}
                                        </div>

                                        {/* Agent Info */}
                                        <motion.div
                                            className="absolute top-20 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.2 + 0.3 }}
                                        >
                                            <div className="text-white font-bold text-xs text-center">{agent.name}</div>
                                            <div className="text-gray-400 text-xs text-center">{agent.role}</div>
                                            
                                            {/* Competitive Stats */}
                                            {agent.performance && (
                                                <div className="mt-1 space-y-1">
                                                    <div className="flex items-center justify-center gap-1">
                                                        {agent.rank === 1 && (
                                                            <span className="text-yellow-400 text-xs font-bold">🏆 #{agent.rank}</span>
                                                        )}
                                                        {agent.rank === 2 && (
                                                            <span className="text-gray-300 text-xs font-bold">🥈 #{agent.rank}</span>
                                                        )}
                                                        {agent.rank === 3 && (
                                                            <span className="text-orange-400 text-xs font-bold">🥉 #{agent.rank}</span>
                                                        )}
                                                        {agent.rank > 3 && (
                                                            <span className="text-gray-400 text-xs font-bold">#{agent.rank}</span>
                                                        )}
                                                        <span className="text-green-400 text-xs font-bold">{agent.performance}</span>
                                                    </div>
                                                    <div className="text-gray-500 text-xs text-center">{agent.trades} trades</div>
                                                </div>
                                            )}
                                            
                                            {/* Walrus Stats */}
                                            {agent.isCentral && (
                                                <div className="mt-1 text-center">
                                                    <div className="text-blue-300 text-xs font-bold">{agent.records}</div>
                                                </div>
                                            )}
                                        </motion.div>

                                    </motion.div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Floating elements */}
                        <motion.div
                            className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-[#00ff88]/20 to-[#00d4ff]/20 rounded-full blur-xl"
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.3, 0.6, 0.3]
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        />

                        <motion.div
                            className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-[#ff00ff]/20 to-[#ff6b00]/20 rounded-full blur-xl"
                            animate={{
                                scale: [1.2, 1, 1.2],
                                opacity: [0.2, 0.5, 0.2]
                            }}
                            transition={{
                                duration: 5,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        />

                         

                        {/* Audit Trail Elements */}
                        <motion.div
                            className="absolute bottom-8 left-8 space-y-1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 2 }}
                        >
                            {['Trade #1247', 'Decision #892', 'Validation #356'].map((item, i) => (
                                <motion.div
                                    key={item}
                                    className="text-xs text-gray-500 font-mono"
                                    animate={{
                                        opacity: [0.3, 0.8, 0.3],
                                        x: [0, 5, 0]
                                    }}
                                    transition={{
                                        duration: 4,
                                        repeat: Infinity,
                                        delay: i * 0.7
                                    }}
                                >
                                    ✓ {item}
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
