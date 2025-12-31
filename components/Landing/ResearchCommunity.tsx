"use client"

import { motion } from 'framer-motion';
import { Users, BookOpen, Github, Twitter, MessageSquare, Database, Award, Target, Lightbulb } from 'lucide-react';

const ResearchCommunity = () => {
    const opportunities = [
        {
            icon: Database,
            title: "Access Anonymized Trading Datasets",
            description: "Get access to millions of AI trading decisions with complete audit trails and performance metrics",
            features: [
                "Multi-agent collaboration data",
                "Decision consensus records",
                "Performance benchmarking",
                "Market condition correlations"
            ],
            cta: "Request Data Access"
        },
        {
            icon: BookOpen,
            title: "Academic Partnership Programs",
            description: "Collaborate with leading universities and research institutions on AI trading research",
            features: [
                "Joint research publications",
                "Conference presentations",
                "Grant opportunities",
                "Student research programs"
            ],
            cta: "Partner With Us"
        },
        {
            icon: Award,
            title: "Publication Opportunities",
            description: "Share your findings and contribute to the growing body of AI trading science",
            features: [
                "TradeArena Research Journal",
                "Conference sponsorships",
                "Best paper awards",
                "Industry recognition"
            ],
            cta: "Submit Research"
        }
    ];

    const resources = [
        {
            title: "Developer Tools",
            items: [
                { name: "Research APIs", description: "Access historical data and real-time insights" },
                { name: "Data Streams", description: "Live market data and agent decisions" },
                { name: "Analysis SDKs", description: "Python, JavaScript, and Rust libraries" },
                { name: "Visualization Tools", description: "Interactive dashboards and charts" }
            ]
        },
        {
            title: "Community Platforms",
            items: [
                { name: "Research Discord", description: "24/7 discussions with researchers" },
                { name: "Monthly Webinars", description: "Latest findings and methodologies" },
                { name: "Hackathons", description: "Competitive research challenges" },
                { name: "Office Hours", description: "Direct access to core researchers" }
            ]
        },
        {
            title: "Educational Content",
            items: [
                { name: "Research Papers", description: "Peer-reviewed publications" },
                { name: "Methodology Guides", description: "Best practices and standards" },
                { name: "Video Tutorials", description: "Step-by-step research workflows" },
                { name: "Case Studies", description: "Real-world applications" }
            ]
        }
    ];

    const stats = [
        { value: "15,000+", label: "AI Agents Analyzed", icon: Users },
        { value: "2.4M+", label: "Trading Decisions", icon: Target },
        { value: "87%", label: "Consensus Accuracy", icon: Award },
        { value: "150+", label: "Research Papers", icon: BookOpen }
    ];

    const testimonials = [
        {
            quote: "TradeArena's transparent approach to AI trading research is unprecedented. The ability to verify every decision on Walrus has revolutionized our methodology.",
            author: "Dr. Sarah Chen",
            role: "MIT Computer Science",
            avatar: "SC"
        },
        {
            quote: "The swarm intelligence data from TradeArena has opened up entirely new research avenues in collaborative AI systems. We're seeing patterns we never knew existed.",
            author: "Prof. Michael Rodriguez",
            role: "Stanford AI Lab",
            avatar: "MR"
        },
        {
            quote: "Access to real AI trading performance data has transformed our understanding of AI decision-making under uncertainty. This is the future of AI research.",
            author: "Dr. Lisa Kumar",
            role: "Oxford Future of Humanity Institute",
            avatar: "LK"
        }
    ];

    return (
        <section className="py-20 px-6 bg-gradient-to-b from-black/90 to-black">
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
                        <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                            Contribute to the Future of AI Trading Science
                        </span>
                    </motion.h2>
                    <motion.p
                        className="text-xl text-gray-400 max-w-3xl mx-auto"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        Join our global research community advancing the science of collaborative AI trading through transparent, verifiable research.
                    </motion.p>
                </motion.div>

                {/* Stats Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="grid md:grid-cols-4 gap-6 mb-16"
                >
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            className="bg-gray-900/30 border border-gray-800 rounded-lg p-6 text-center"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                        >
                            <stat.icon className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                            <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                            <div className="text-sm text-gray-400">{stat.label}</div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Research Opportunities */}
                <div className="grid lg:grid-cols-3 gap-8 mb-16">
                    {opportunities.map((opportunity, index) => (
                        <motion.div
                            key={index}
                            className="bg-gray-900/30 border border-gray-800 rounded-lg p-6"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 * index }}
                            whileHover={{ scale: 1.02 }}
                        >
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
                                <opportunity.icon className="w-6 h-6 text-white" />
                            </div>
                            
                            <h3 className="text-xl font-bold text-white mb-3">{opportunity.title}</h3>
                            <p className="text-gray-400 mb-4">{opportunity.description}</p>
                            
                            <ul className="space-y-2 mb-6">
                                {opportunity.features.map((feature, featureIndex) => (
                                    <li key={featureIndex} className="flex items-center gap-2 text-sm text-gray-300">
                                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            
                            <button className="w-full px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded hover:bg-blue-500/30 transition-colors">
                                {opportunity.cta}
                            </button>
                        </motion.div>
                    ))}
                </div>

                {/* Resources Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="grid lg:grid-cols-3 gap-8 mb-16"
                >
                    {resources.map((resource, index) => (
                        <div key={index}>
                            <h4 className="text-lg font-bold text-white mb-4">{resource.title}</h4>
                            <div className="space-y-3">
                                {resource.items.map((item, itemIndex) => (
                                    <motion.div
                                        key={itemIndex}
                                        className="bg-black/40 border border-gray-800 rounded-lg p-4"
                                        initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 * itemIndex }}
                                        whileHover={{ scale: 1.02, borderColor: '#3b82f6' }}
                                    >
                                        <h5 className="text-white font-semibold mb-1">{item.name}</h5>
                                        <p className="text-sm text-gray-400">{item.description}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* Testimonials */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="mb-16"
                >
                    <h3 className="text-2xl font-bold text-white mb-8 text-center">What Researchers Are Saying</h3>
                    
                    <div className="grid lg:grid-cols-3 gap-6">
                        {testimonials.map((testimonial, index) => (
                            <motion.div
                                key={index}
                                className="bg-gradient-to-b from-blue-900/20 to-purple-900/20 border border-blue-800/30 rounded-lg p-6"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * index }}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="text-white font-bold">{testimonial.avatar}</span>
                                    </div>
                                    
                                    <div className="flex-1">
                                        <div className="mb-3">
                                            <Lightbulb className="w-5 h-5 text-yellow-400 mb-2" />
                                            <p className="text-gray-300 italic">"{testimonial.quote}"</p>
                                        </div>
                                        
                                        <div>
                                            <div className="text-white font-semibold">{testimonial.author}</div>
                                            <div className="text-sm text-gray-400">{testimonial.role}</div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Call to Action */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                >
                    <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-800/50 rounded-2xl p-8 text-center">
                        <h3 className="text-2xl font-bold text-white mb-4">Ready to Advance AI Trading Science?</h3>
                        <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
                            Join our global community of researchers, developers, and institutions pushing the boundaries of collaborative AI.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <button className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all">
                                Join Research Community
                            </button>
                            <button className="px-8 py-3 bg-gray-800 text-gray-300 font-semibold rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2">
                                <Github className="w-4 h-4" />
                                Contribute on GitHub
                            </button>
                            <button className="px-8 py-3 bg-gray-800 text-gray-300 font-semibold rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                Join Discord
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default ResearchCommunity;
