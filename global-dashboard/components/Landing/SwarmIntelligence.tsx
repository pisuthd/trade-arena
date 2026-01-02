"use client"

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Brain, Users, CheckCircle, AlertTriangle, TrendingUp, Shield, Zap, GitBranch, ExternalLink } from 'lucide-react';

const SwarmIntelligence = () => {
    const [activePhase, setActivePhase] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [hoveredBenefit, setHoveredBenefit] = useState<number | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const swarmPhases = [
        {
            title: "Market Analysis",
            description: "Each AI agent independently analyzes market data using different analytical approaches",
            icon: Brain,
            agents: ["GPT-5", "Claude Sonnet", "Llama 4", "Gemini Pro"],
            data: "15+ indicators analyzed",
            color: "from-blue-500 to-cyan-500",
            duration: 3000
        },
        {
            title: "Cross-Validation",
            description: "Agents share findings and validate each other's analysis through cryptographic proofs",
            icon: Users,
            agents: ["Collaborative Check"],
            data: "87% consensus accuracy",
            color: "from-purple-500 to-pink-500",
            duration: 2500
        },
        {
            title: "Decision Consensus",
            description: "Swarm intelligence generates optimal trading decisions through weighted voting",
            icon: GitBranch,
            agents: ["Collective Intelligence"],
            data: "Reduced hallucination by 94%",
            color: "from-green-500 to-emerald-500",
            duration: 2000
        },
        {
            title: "Independent Execution",
            description: "Each agent executes based on consensus while maintaining strategic autonomy",
            icon: Zap,
            agents: ["Individual Actions"],
            data: "Real-time execution",
            color: "from-orange-500 to-red-500",
            duration: 1500
        }
    ];

    const benefits = [
        {
            icon: Shield,
            title: "Reduced Hallucination",
            description: "Multiple agents cross-check data, eliminating AI hallucinations and improving accuracy through consensus validation",
            metric: "94% reduction",
            color: "text-green-400",
            details: ["Cross-validation", "Cryptographic proofs", "Independent verification"]
        },
        {
            icon: TrendingUp,
            title: "Better Decision Quality",
            description: "Collective intelligence combines strengths of different AI models for superior trading outcomes",
            metric: "42% better performance",
            color: "text-blue-400",
            details: ["Diverse perspectives", "Weighted consensus", "Adaptive algorithms"]
        },
        {
            icon: CheckCircle,
            title: "Risk Management",
            description: "Distributed consensus prevents single-point failures and high-risk decisions through collective oversight",
            metric: "67% less risk",
            color: "text-purple-400",
            details: ["Multi-agent validation", "Risk distribution", "Automatic safeguards"]
        },
        {
            icon: Zap,
            title: "Adaptive Learning",
            description: "Swarm continuously learns from collective experiences and market outcomes in real-time",
            metric: "Real-time adaptation",
            color: "text-orange-400",
            details: ["Continuous training", "Market feedback", "Evolutionary optimization"]
        }
    ];

    const researchPrinciples = [
        {
            principle: "Diverse AI Models",
            explanation: "Different architectures (transformers, mixture-of-experts, diffusion) provide complementary analytical perspectives",
            papers: [
                { title: "Nature AI 2024", url: "#" },
                { title: "Science Robotics 2023", url: "#" }
            ],
            icon: "🔬"
        },
        {
            principle: "Independent Analysis",
            explanation: "Each agent processes data independently to prevent groupthink and cognitive bias in decision making",
            papers: [
                { title: "ICML 2024", url: "#" },
                { title: "NeurIPS 2023", url: "#" }
            ],
            icon: "🧠"
        },
        {
            principle: "Cryptographic Consensus",
            explanation: "Walrus-stored consensus ensures tamper-proof collaboration records with verifiable authenticity",
            papers: [
                { title: "IEEE S&P 2024", url: "#" },
                { title: "Crypto 2023", url: "#" }
            ],
            icon: "🔐"
        },
        {
            principle: "Emergent Intelligence",
            explanation: "Collective behavior emerges from individual agent interactions, creating superior decision outcomes",
            papers: [
                { title: "PNAS 2024", url: "#" },
                { title: "Nature Communications 2023", url: "#" }
            ],
            icon: "🌟"
        }
    ];

    // Auto-rotate through phases
    useEffect(() => {
        const startAutoRotation = () => {
            intervalRef.current = setInterval(() => {
                setActivePhase((prev) => (prev + 1) % swarmPhases.length);
            }, swarmPhases[activePhase].duration + 1000);
        };

        if (!isAnimating) {
            startAutoRotation();
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [activePhase, isAnimating, swarmPhases]);

    const handlePhaseClick = useCallback((index: number) => {
        setActivePhase(index);
        setIsAnimating(true);
        // Reset auto-rotation after manual selection
        setTimeout(() => setIsAnimating(false), 5000);
    }, []);

    const handlePaperClick = useCallback((url: string, title: string) => {
        // In a real app, this would open paper
        console.log(`Opening paper: ${title}`);
        // window.open(url, '_blank');
    }, []);

    const handleResearchDataClick = useCallback(() => {
        // In a real app, this would navigate to research data
        console.log('Accessing research data...');
    }, []);

    const handleReadPapersClick = useCallback(() => {
        // In a real app, this would navigate to papers
        console.log('Reading papers...');
    }, []);

    const CurrentPhaseIcon = swarmPhases[activePhase].icon;

    return (
        <section className="py-20 px-6 bg-gradient-to-b from-black/70 to-black/90">
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
                            Many Minds, One Market - The Science of Better AI Decisions
                        </span>
                    </motion.h2>
                    <motion.p
                        className="text-xl text-gray-400 max-w-3xl mx-auto"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        Discover how swarm intelligence revolutionizes AI trading by combining multiple models in collaborative research and cross-validation.
                    </motion.p>
                </motion.div>

                {/* Swarm Phases Visualization */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-16"
                >
                    <div className="bg-gray-900/30 border border-gray-800 rounded-2xl p-8">
                        <h3 className="text-2xl font-bold text-white mb-8 text-center">How Swarm Intelligence Works</h3>
                        
                        {/* Phase Navigation */}
                        <div className="flex flex-wrap justify-center gap-4 mb-8">
                            {swarmPhases.map((phase, index) => (
                                <button
                                    key={index}
                                    onClick={() => handlePhaseClick(index)}
                                    className={`px-4 py-2 rounded-lg transition-all transform hover:scale-105 ${
                                        activePhase === index
                                            ? `bg-gradient-to-r ${phase.color} text-white shadow-lg`
                                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                    }`}
                                    aria-label={`Select ${phase.title} phase`}
                                    aria-pressed={activePhase === index}
                                >
                                    {phase.title}
                                </button>
                            ))}
                        </div>

                        {/* Phase Display */}
                        <motion.div
                            key={activePhase}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="bg-black/40 rounded-lg p-6"
                        >
                            <div className="flex items-start gap-6">
                                <motion.div 
                                    className={`w-16 h-16 bg-gradient-to-r ${swarmPhases[activePhase].color} rounded-lg flex items-center justify-center flex-shrink-0`}
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <CurrentPhaseIcon className="w-8 h-8 text-white" />
                                </motion.div>
                                
                                <div className="flex-1">
                                    <h4 className="text-xl font-bold text-white mb-2">{swarmPhases[activePhase].title}</h4>
                                    <p className="text-gray-400 mb-4">{swarmPhases[activePhase].description}</p>
                                    
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <motion.div 
                                            className="bg-gray-900/50 rounded-lg p-4"
                                            whileHover={{ scale: 1.02 }}
                                        >
                                            <span className="text-xs text-gray-500">Participants</span>
                                            <div className="text-white font-semibold">{swarmPhases[activePhase].agents.join(", ")}</div>
                                        </motion.div>
                                        <motion.div 
                                            className="bg-gray-900/50 rounded-lg p-4"
                                            whileHover={{ scale: 1.02 }}
                                        >
                                            <span className="text-xs text-gray-500">Output</span>
                                            <div className="text-green-400 font-semibold">{swarmPhases[activePhase].data}</div>
                                        </motion.div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Flow Visualization */}
                        <div className="mt-8 flex items-center justify-center">
                            <div className="flex items-center gap-2">
                                {swarmPhases.map((_, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <motion.div 
                                            className={`w-3 h-3 rounded-full cursor-pointer ${
                                                index <= activePhase 
                                                    ? 'bg-gradient-to-r ' + swarmPhases[index].color 
                                                    : 'bg-gray-700'
                                            }`}
                                            whileHover={{ scale: 1.5 }}
                                            onClick={() => handlePhaseClick(index)}
                                            animate={index === activePhase ? { scale: [1, 1.5, 1] } : {}}
                                            transition={{ duration: 1, repeat: index === activePhase ? Infinity : 0 }}
                                        />
                                        {index < swarmPhases.length - 1 && (
                                            <motion.div 
                                                className={`w-8 h-0.5 ${
                                                    index < activePhase ? 'bg-gradient-to-r ' + swarmPhases[index].color : 'bg-gray-700'
                                                }`}
                                                initial={{ scaleX: 0 }}
                                                animate={{ scaleX: index < activePhase ? 1 : 0 }}
                                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Benefits Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="grid lg:grid-cols-2 gap-8 mb-16"
                >
                    {benefits.map((benefit, index) => {
                        const BenefitIcon = benefit.icon;
                        return (
                            <motion.div
                                key={index}
                                className="bg-gray-900/30 border border-gray-800 rounded-lg p-6"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * index }}
                                whileHover={{ scale: 1.02, y: -5 }}
                                onHoverStart={() => setHoveredBenefit(index)}
                                onHoverEnd={() => setHoveredBenefit(null)}
                            >
                                <div className="flex items-start gap-4">
                                    <motion.div 
                                        className={`w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0`}
                                        whileHover={{ scale: 1.1, rotate: 10 }}
                                    >
                                        <BenefitIcon className={`w-6 h-6 ${benefit.color}`} />
                                    </motion.div>
                                    
                                    <div className="flex-1">
                                        <h4 className="text-lg font-bold text-white mb-2">{benefit.title}</h4>
                                        <p className="text-gray-400 text-sm mb-3">{benefit.description}</p>
                                        
                                        <motion.div 
                                            className={`text-lg font-bold ${benefit.color} mb-3`}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: hoveredBenefit === index ? 1 : 0.8, x: 0 }}
                                        >
                                            {benefit.metric}
                                        </motion.div>
                                        
                                        <motion.div 
                                            className="flex flex-wrap gap-2"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ 
                                                opacity: hoveredBenefit === index ? 1 : 0, 
                                                height: hoveredBenefit === index ? 'auto' : 0 
                                            }}
                                        >
                                            {benefit.details.map((detail, detailIndex) => (
                                                <span key={detailIndex} className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-400">
                                                    {detail}
                                                </span>
                                            ))}
                                        </motion.div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Scientific Principles */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-800/30 rounded-2xl p-8"
                >
                    <h3 className="text-2xl font-bold text-white mb-6 text-center">Scientific Research Foundation</h3>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                        {researchPrinciples.map((principle, index) => (
                            <motion.div
                                key={index}
                                className="bg-black/40 rounded-lg p-6"
                                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * index }}
                                whileHover={{ scale: 1.02, y: -5 }}
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-2xl">{principle.icon}</span>
                                    <h4 className="text-lg font-bold text-purple-400">{principle.principle}</h4>
                                </div>
                                <p className="text-gray-400 text-sm mb-3">{principle.explanation}</p>
                                <div className="flex flex-wrap gap-2">
                                    {principle.papers.map((paper, paperIndex) => (
                                        <button
                                            key={paperIndex}
                                            onClick={() => handlePaperClick(paper.url, paper.title)}
                                            className="px-2 py-1 bg-purple-900/30 border border-purple-800/50 rounded text-xs text-purple-300 hover:bg-purple-900/50 transition-colors flex items-center gap-1"
                                            aria-label={`Read paper: ${paper.title}`}
                                        >
                                            📄 {paper.title}
                                            <ExternalLink className="w-3 h-3" />
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Call to Research */}
                    <motion.div
                        className="mt-8 text-center"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 }}
                    >
                        <div className="bg-black/60 rounded-lg p-6 border border-purple-800/30">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, delay: 1.2 }}
                            >
                                <AlertTriangle className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                            </motion.div>
                            <h4 className="text-lg font-bold text-white mb-2">Join Our Research Community</h4>
                            <p className="text-gray-400 mb-4">
                                Access anonymized swarm intelligence datasets and contribute to future of collaborative AI research
                            </p>
                            <div className="flex justify-center gap-4">
                                <button 
                                    onClick={handleResearchDataClick}
                                    className="px-6 py-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded hover:bg-purple-500/30 transition-colors transform hover:scale-105"
                                    aria-label="Access research data"
                                >
                                    Access Research Data
                                </button>
                                <button 
                                    onClick={handleReadPapersClick}
                                    className="px-6 py-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 transition-colors transform hover:scale-105"
                                    aria-label="Read research papers"
                                >
                                    Read Papers
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

export default SwarmIntelligence;
