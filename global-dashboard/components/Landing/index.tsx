"use client"

import Hero from './Hero';
import CriticalQuestion from './CriticalQuestion';
import HowItWorks from './HowItWorks';
import StrandsFramework from './StrandsFramework';
import AgentCapabilities from './AgentCapabilities';
import TradeArenaBenefits from './TradeArenaBenefits';
import FinalQA from './FinalQA'; 

const LandingContainer = () => {
    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white">
            <Hero />
             <CriticalQuestion />
            <HowItWorks /> 
            <AgentCapabilities />
            <StrandsFramework/>
            <TradeArenaBenefits />
            <FinalQA /> 
        </div>
    );
};

export default LandingContainer;
