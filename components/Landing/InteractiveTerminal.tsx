"use client"

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Terminal, Play, Pause, RotateCcw } from 'lucide-react';

const InteractiveTerminal = ({ autoStart = false, embedded = false }: { autoStart?: boolean; embedded?: boolean }) => {
    const [currentCommand, setCurrentCommand] = useState('');
    const [commandHistory, setCommandHistory] = useState<string[]>([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const terminalRef = useRef<HTMLDivElement>(null);
    const demoControllerRef = useRef<{
        shouldStop: boolean;
        shouldPause: boolean;
        resume: () => void;
    }>({
        shouldStop: false,
        shouldPause: false,
        resume: () => {}
    });

    const commands = [
        {
            command: 'npm install tradearena-cli',
            output: [
                'npm WARN deprecated package@1.0.0',
                'added 152 packages in 3.2s',
                '',
                '✓ TradeArena CLI installed successfully'
            ],
            delay: 2000
        },
        {
            command: 'tradearena init',
            output: [
                'Initializing TradeArena configuration...',
                '┌─────────────────────────────────────┐',
                '│  TradeArena Configuration Setup     │',
                '└─────────────────────────────────────┘',
                '',
                '✓ Created .tradearena directory',
                '✓ Generated wallet configuration',
                '✓ Connected to Sui testnet',
                '✓ Initialized Walrus storage client',
                '',
                'Your TradeArena is ready to use!'
            ],
            delay: 3000
        },
        {
            command: 'tradearena deploy --model gpt-5 --strategy aggressive',
            output: [
                'Deploying AI agent with GPT-5 model...',
                '',
                '┌─ Agent Configuration ─────────────────┐',
                '│ Model:         GPT-5                   │',
                '│ Strategy:      Aggressive              │',
                '│ Capital:       1000 USDC              │',
                '│ Risk Level:    High                   │',
                '└─────────────────────────────────────┘',
                '',
                'Executing deployment transaction...',
                'Transaction: 0x7f9a2b3c4d5e6f8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5',
                'Status: ✓ Confirmed',
                '',
                '🤖 Agent deployed successfully!',
                '📍 Agent ID: agent_0x1234...5678',
                '🏷️  Model: GPT-5',
                '💰 Initial Capital: 1000 USDC',
                '',
                'Your agent is now competing in the arena!'
            ],
            delay: 4000
        },
        {
            command: 'tradearena watch',
            output: [
                '📡 Connecting to TradeArena live feed...',
                '',
                '┌─ Live Arena Monitor ─────────────────┐',
                '│                                    │',
                '│ Your Agent: agent_0x1234...5678     │',
                '│ Model: GPT-5                        │',
                '│ Current PnL: +5.7%                  │',
                '│ Active Trades: 3                    │',
                '│                                    │',
                '│ 🟢 EXECUTE: Buy SUI @ 1.24         │',
                '│ Reason: Momentum breakout detected   │',
                '│ Recorded: TX#1247                  │',
                '│                                    │',
                '│ 🟢 EXECUTE: Sell USDC @ 0.998      │',
                '│ Reason: Rebalancing portfolio       │',
                '│ Recorded: TX#1248                  │',
                '│                                    │',
                '│ ⏳ PENDING: Market analysis         │',
                '│ ETA: 12 seconds                   │',
                '│                                    │',
                '└─────────────────────────────────────┘',
                '',
                'Press Ctrl+C to stop monitoring...'
            ],
            delay: 5000
        },
        {
            command: 'tradearena verify --tx 0x7f9a2b3c4d5e6f8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5',
            output: [
                '🔍 Verifying transaction on Walrus...',
                '',
                '┌─ Transaction Verification ────────────┐',
                '│                                    │',
                '│ Transaction ID:                       │',
                '│ 0x7f9a...f4a5                       │',
                '│                                    │',
                '│ 📊 Agent Decision Data:               │',
                '│ • Market Analysis: 15 indicators      │',
                '│ • Risk Assessment: Moderate           │',
                '│ • Confidence Score: 87%              │',
                '│ • Execution Time: 1.2s              │',
                '│                                    │',
                '│ 🔗 Walrus Storage:                   │',
                '│ • Blob ID: blob_abc123...def456     │',
                '│ • Size: 2.4 KB                      │',
                '│ • Timestamp: 2025-01-15 14:32:18    │',
                '│ • Merkle Root: verified              │',
                '│                                    │',
                '│ ✅ VERIFICATION: SUCCESS              │',
                '│ All data is permanently recorded     │',
                '│ and cryptographically verifiable     │',
                '│                                    │',
                '└─────────────────────────────────────┘'
            ],
            delay: 4000
        }
    ];

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [commandHistory]);

    useEffect(() => {
        if (autoStart && !isPlaying) {
            runDemo();
        }
        
        return () => {
            // Cleanup on unmount
            demoControllerRef.current.shouldStop = true;
        };
    }, [autoStart]);

    const sleep = (ms: number) => {
        return new Promise(resolve => setTimeout(resolve, ms / playbackSpeed));
    };

    const waitForResume = () => {
        return new Promise<void>((resolve) => {
            const checkResume = () => {
                if (!demoControllerRef.current.shouldPause) {
                    resolve();
                } else {
                    setTimeout(checkResume, 100);
                }
            };
            checkResume();
        });
    };

    const runDemo = async () => {
        setIsPlaying(true);
        setIsPaused(false);
        setCommandHistory([]);
        setCurrentStep(0);
        demoControllerRef.current.shouldStop = false;
        demoControllerRef.current.shouldPause = false;

        try {
            for (let i = 0; i < commands.length; i++) {
                if (demoControllerRef.current.shouldStop) break;
                
                if (demoControllerRef.current.shouldPause) {
                    await waitForResume();
                }
                
                if (demoControllerRef.current.shouldStop) break;

                setCurrentStep(i);
                const cmd = commands[i];
                
                // Add command to history
                setCommandHistory(prev => [...prev, `$ ${cmd.command}`]);
                
                // Wait a bit before showing output
                await sleep(500);
                
                if (demoControllerRef.current.shouldStop) break;

                // Add output line by line
                for (const line of cmd.output) {
                    if (demoControllerRef.current.shouldStop) break;
                    
                    if (demoControllerRef.current.shouldPause) {
                        await waitForResume();
                    }
                    
                    if (demoControllerRef.current.shouldStop) break;

                    setCommandHistory(prev => [...prev, line]);
                    await sleep(100);
                }
                
                if (demoControllerRef.current.shouldStop) break;
                
                // Add empty line
                setCommandHistory(prev => [...prev, '']);
                
                // Wait before next command
                await sleep(cmd.delay);
            }
        } catch (error) {
            console.error('Demo execution error:', error);
        } finally {
            setIsPlaying(false);
            setIsPaused(false);
        }
    };

    const pauseDemo = () => {
        setIsPaused(true);
        demoControllerRef.current.shouldPause = true;
    };

    const resumeDemo = () => {
        setIsPaused(false);
        demoControllerRef.current.shouldPause = false;
    };

    const stopDemo = () => {
        demoControllerRef.current.shouldStop = true;
        setIsPlaying(false);
        setIsPaused(false);
    };

    const resetDemo = () => {
        stopDemo();
        setCommandHistory([]);
        setCurrentStep(0);
    };

    const togglePlayPause = () => {
        if (isPlaying) {
            if (isPaused) {
                resumeDemo();
            } else {
                pauseDemo();
            }
        } else {
            runDemo();
        }
    };

    return (
        <section className={`${embedded ? '' : 'py-20 px-6 bg-black/50'}`}>
            <div className={`${embedded ? '' : 'max-w-6xl mx-auto'}`}>
                {/* Section Header - Only show when not embedded */}
                {!embedded && (
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
                            <span className="bg-gradient-to-r from-[#00ff88] via-[#00d4ff] to-[#ff00ff] bg-clip-text text-transparent">
                                Deploy Your AI Agent in Minutes
                            </span>
                        </motion.h2>
                        <motion.p
                            className="text-xl text-gray-400 max-w-3xl mx-auto"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            Watch how different AI models perform when deployed with real capital in actual DeFi markets.
                        </motion.p>
                    </motion.div>
                )}

                {/* Terminal Interface */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="bg-black border border-gray-800 rounded-lg overflow-hidden shadow-2xl">
                        {/* Terminal Header */}
                        <div className="bg-gray-900 px-4 py-3 flex items-center justify-between border-b border-gray-800">
                            <div className="flex items-center gap-3">
                                <Terminal className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-300 font-mono text-sm">TradeArena CLI</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <select
                                    value={playbackSpeed}
                                    onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                                    className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs border border-gray-700"
                                    disabled={isPlaying}
                                >
                                    <option value={0.5}>0.5x</option>
                                    <option value={1}>1x</option>
                                    <option value={1.5}>1.5x</option>
                                    <option value={2}>2x</option>
                                </select>
                                <button
                                    onClick={togglePlayPause}
                                    className="px-3 py-1 bg-[#00ff88]/20 text-[#00ff88] rounded hover:bg-[#00ff88]/30 transition-colors flex items-center gap-2 text-sm"
                                    aria-label={isPlaying ? (isPaused ? "Resume" : "Pause") : "Run Demo"}
                                >
                                    {isPlaying ? (
                                        isPaused ? (
                                            <>
                                                <Play className="w-3 h-3" />
                                                Resume
                                            </>
                                        ) : (
                                            <>
                                                <Pause className="w-3 h-3" />
                                                Pause
                                            </>
                                        )
                                    ) : (
                                        <>
                                            <Play className="w-3 h-3" />
                                            Run Demo
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={resetDemo}
                                    className="px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors flex items-center gap-2 text-sm"
                                    aria-label="Reset"
                                >
                                    <RotateCcw className="w-3 h-3" />
                                    Reset
                                </button>
                            </div>
                        </div>

                        {/* Terminal Content */}
                        <div
                            ref={terminalRef}
                            className="p-4 h-96 overflow-y-auto font-mono text-sm"
                            style={{ backgroundColor: '#0a0a0f' }}
                            role="log"
                            aria-live="polite"
                            aria-label="Terminal output"
                        >
                            {commandHistory.length === 0 && !isPlaying && (
                                <div className="text-gray-500">
                                    <p>Welcome to TradeArena CLI!</p>
                                    <p>Click "Run Demo" to see how easy it is to deploy your AI agent.</p>
                                    <p className="mt-2">Available commands:</p>
                                    <ul className="ml-4 mt-1 space-y-1">
                                        <li>• npm install tradearena-cli</li>
                                        <li>• tradearena init</li>
                                        <li>• tradearena deploy --model {'<model>'}</li>
                                        <li>• tradearena watch</li>
                                        <li>• tradearena verify --tx {'<hash>'}</li>
                                    </ul>
                                </div>
                            )}

                            {commandHistory.map((line, index) => (
                                <motion.div
                                    key={`${index}-${line}`}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.05 }}
                                    className={`${line.startsWith('$') ? 'text-[#00ff88]' : 
                                              line.includes('✓') || line.includes('✅') ? 'text-green-400' :
                                              line.includes('🤖') || line.includes('📡') || line.includes('🔍') ? 'text-blue-400' :
                                              line.includes('🟢') || line.includes('⏳') ? 'text-yellow-400' :
                                              'text-gray-300'}`}
                                >
                                    {line}
                                </motion.div>
                            ))}

                            {/* Progress Indicator */}
                            {isPlaying && (
                                <motion.div
                                    className="flex items-center gap-2 mt-2"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <motion.div
                                        className={`w-2 h-2 rounded-full ${isPaused ? 'bg-yellow-400' : 'bg-[#00ff88]'}`}
                                        animate={!isPaused ? { scale: [1, 1.5, 1] } : {}}
                                        transition={{ duration: 1, repeat: !isPaused ? Infinity : 0 }}
                                    />
                                    <span className="text-gray-400">
                                        {isPaused ? 'Paused' : 'Processing...'}
                                    </span>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default InteractiveTerminal;
