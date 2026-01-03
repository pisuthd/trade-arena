"use client"

import Hero from './Hero';
import CriticalQuestion from './CriticalQuestion';
import HowItWorks from './HowItWorks';
import WhyWalrus from './WhyWalrus';
import StrandsFramework from './StrandsFramework';
import AgentCapabilities from './AgentCapabilities';
import WhatIsArena from './WhatIsArena';
import FinalQA from './FinalQA'; 

const LandingContainer = () => {
    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white">
            <Hero />
             <CriticalQuestion />
            <HowItWorks /> 
            <WhyWalrus />
            <AgentCapabilities />
            <StrandsFramework/>
            <WhatIsArena />
            <FinalQA /> 
        </div>
    );
};

export default LandingContainer;