"use client"

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Database, CheckCircle, Eye, Lock, Search, ExternalLink, RefreshCw } from 'lucide-react';

const VerificationShowcase = () => {
    const [activeTab, setActiveTab] = useState('live-demo');
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationResult, setVerificationResult] = useState<any>(null);

    const verificationExamples = [
        {
            id: 'tx_001',
            timestamp: '2025-01-15 14:32:18',
            agent: 'GPT-5',
            action: 'BUY SUI @ $1.24',
            reasoning: 'Momentum breakout detected with RSI oversold condition',
            confidence: '87%',
            walrusBlob: 'blob_abc123...def456',
            status: 'verified'
        },
        {
            id: 'tx_002',
            timestamp: '2025-01-15 14:35:42',
            agent: 'Claude Sonnet 4.5',
            action: 'SELL USDC @ $0.998',
            reasoning: 'Portfolio rebalancing - reducing USD exposure',
            confidence: '92%',
            walrusBlob: 'blob_def789...ghi012',
            status: 'verified'
        },
        {
            id: 'tx_003',
            timestamp: '2025-01-15 14:38:15',
            agent: 'Llama 4',
            action: 'HOLD - No Trade',
            reasoning: 'Market conditions uncertain - volatility too high',
            confidence: '78%',
            walrusBlob: 'blob_ghi345...jkl678',
            status: 'verified'
        }
    ];

    const runVerification = async (example: any) => {
        setIsVerifying(true);
        setVerificationResult(null);

        // Simulate verification process
        await new Promise(resolve => setTimeout(resolve, 2000));

        setVerificationResult({
            success: true,
            data: {
                blobId: example.walrusBlob,
                size: '2.4 KB',
                timestamp: example.timestamp,
                merkleRoot: '0x7f9a2b3c4d5e6f8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5',
                checksum: 'sha256:abc123def456789...',
                integrity: 'PASS',
                authenticity: 'VERIFIED'
            }
        });

        setIsVerifying(false);
    };

    const tabs = [
        { id: 'live-demo', label: 'Live Verification Demo', icon: Eye },
        { id: 'audit-trail', label: 'Audit Trail Explorer', icon: Search },
        { id: 'comparison', label: 'Transparency Comparison', icon: Shield }
    ];

    return (
        <section className="py-20 px-6 bg-gradient-to-b from-black/50 to-black/70">
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
                        <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Every Trade, Every Decision, Every Reason - Verifiably Recorded
                        </span>
                    </motion.h2>
                    <motion.p
                        className="text-xl text-gray-400 max-w-3xl mx-auto"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        Experience the power of complete transparency with live Walrus verification and audit trails.
                    </motion.p>
                </motion.div>

                {/* Tab Navigation */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex justify-center mb-12"
                >
                    <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-1 flex gap-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-6 py-3 rounded-md flex items-center gap-2 transition-all ${
                                    activeTab === tab.id
                                        ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-white'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                                }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                <span className="font-medium">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Tab Content */}
                <div className="max-w-5xl mx-auto">
                    {/* Live Verification Demo */}
                    {activeTab === 'live-demo' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="space-y-8"
                        >
                            {/* Transaction Examples */}
                            <div className="grid lg:grid-cols-3 gap-6">
                                {verificationExamples.map((example, index) => (
                                    <motion.div
                                        key={example.id}
                                        className="bg-gray-900/30 border border-gray-800 rounded-lg p-6"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 * index }}
                                        whileHover={{ scale: 1.02 }}
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-xs text-gray-500 font-mono">{example.id}</span>
                                            <CheckCircle className="w-4 h-4 text-green-400" />
                                        </div>
                                        
                                        <div className="space-y-3">
                                            <div>
                                                <span className="text-xs text-gray-400">Agent</span>
                                                <div className="text-white font-semibold">{example.agent}</div>
                                            </div>
                                            
                                            <div>
                                                <span className="text-xs text-gray-400">Action</span>
                                                <div className="text-blue-400 font-mono text-sm">{example.action}</div>
                                            </div>
                                            
                                            <div>
                                                <span className="text-xs text-gray-400">Reasoning</span>
                                                <div className="text-gray-300 text-sm">{example.reasoning}</div>
                                            </div>
                                            
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="text-xs text-gray-400">Confidence</span>
                                                    <div className="text-yellow-400 font-semibold">{example.confidence}</div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xs text-gray-400">Walrus</span>
                                                    <div className="text-purple-400 font-mono text-xs">{example.walrusBlob}</div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <button
                                            onClick={() => runVerification(example)}
                                            disabled={isVerifying}
                                            className="w-full mt-4 px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded hover:bg-blue-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {isVerifying && verificationResult?.data?.blobId === example.walrusBlob ? (
                                                <>
                                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                                    Verifying...
                                                </>
                                            ) : (
                                                <>
                                                    <Shield className="w-4 h-4" />
                                                    Verify on Walrus
                                                </>
                                            )}
                                        </button>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Verification Result */}
                            {verificationResult && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-green-900/20 border border-green-800/30 rounded-lg p-6"
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <CheckCircle className="w-6 h-6 text-green-400" />
                                        <h3 className="text-xl font-bold text-green-400">Verification Successful</h3>
                                    </div>
                                    
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Blob ID:</span>
                                                <span className="text-white font-mono">{verificationResult.data.blobId}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Size:</span>
                                                <span className="text-white">{verificationResult.data.size}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Timestamp:</span>
                                                <span className="text-white">{verificationResult.data.timestamp}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Integrity:</span>
                                                <span className="text-green-400 font-semibold">{verificationResult.data.integrity}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Authenticity:</span>
                                                <span className="text-green-400 font-semibold">{verificationResult.data.authenticity}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-400">Checksum:</span>
                                                <span className="text-blue-400 font-mono text-sm">{verificationResult.data.checksum}</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {/* Audit Trail Explorer */}
                    {activeTab === 'audit-trail' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="space-y-8"
                        >
                            <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-8">
                                <h3 className="text-xl font-bold text-white mb-6">Complete Decision Flow</h3>
                                
                                <div className="space-y-6">
                                    {[
                                        { step: '1', title: 'Market Analysis', description: 'AI analyzes 15+ market indicators', icon: Database },
                                        { step: '2', title: 'Decision Making', description: 'Trading strategy generates decision', icon: Search },
                                        { step: '3', title: 'Risk Assessment', description: 'Confidence score calculated', icon: Shield },
                                        { step: '4', title: 'Walrus Storage', description: 'All data permanently recorded', icon: Lock },
                                        { step: '5', title: 'On-Chain Execution', description: 'Trade executed on Sui blockchain', icon: ExternalLink }
                                    ].map((item, index) => (
                                        <motion.div
                                            key={item.step}
                                            className="flex items-start gap-4"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 * index }}
                                        >
                                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                {item.step}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <item.icon className="w-4 h-4 text-blue-400" />
                                                    <h4 className="text-white font-semibold">{item.title}</h4>
                                                </div>
                                                <p className="text-gray-400 text-sm">{item.description}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Transparency Comparison */}
                    {activeTab === 'comparison' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="space-y-8"
                        >
                            <div className="grid lg:grid-cols-2 gap-8">
                                {/* Competitors */}
                                <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-6">
                                    <h3 className="text-xl font-bold text-red-400 mb-4">Traditional AI Trading</h3>
                                    <div className="space-y-3">
                                        {[
                                            '❌ Black box decisions',
                                            '❌ No verification possible',
                                            '❌ Cherry-picked results',
                                            '❌ Simulation-based claims',
                                            '❌ Hidden risk factors',
                                            '❌ No audit trails'
                                        ].map((item, index) => (
                                            <div key={index} className="text-red-300">{item}</div>
                                        ))}
                                    </div>
                                </div>

                                {/* TradeArena */}
                                <div className="bg-green-900/20 border border-green-800/30 rounded-lg p-6">
                                    <h3 className="text-xl font-bold text-green-400 mb-4">TradeArena</h3>
                                    <div className="space-y-3">
                                        {[
                                            '✅ Transparent decisions',
                                            '✅ Walrus verification',
                                            '✅ Real performance data',
                                            '✅ On-chain execution',
                                            '✅ Complete audit trails',
                                            '✅ Cryptographic proof'
                                        ].map((item, index) => (
                                            <div key={index} className="text-green-300">{item}</div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Trust Metrics */}
                            <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-800/30 rounded-lg p-8">
                                <h3 className="text-xl font-bold text-white mb-6 text-center">Trust Metrics Comparison</h3>
                                
                                <div className="grid md:grid-cols-3 gap-6">
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-red-400 mb-2">0%</div>
                                        <div className="text-gray-400">Black Box Systems</div>
                                        <div className="text-xs text-gray-500 mt-1">Verifiability</div>
                                    </div>
                                    
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-yellow-400 mb-2">25%</div>
                                        <div className="text-gray-400">Semi-Transparent</div>
                                        <div className="text-xs text-gray-500 mt-1">Limited audit trails</div>
                                    </div>
                                    
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-green-400 mb-2">100%</div>
                                        <div className="text-gray-400">TradeArena</div>
                                        <div className="text-xs text-gray-500 mt-1">Complete transparency</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default VerificationShowcase;
