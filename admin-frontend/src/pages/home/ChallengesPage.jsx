import React, { useState } from 'react';
import CategoryBar from '../../components/markets/CategoryBar';
import { CoinIcon, formatCurrency } from '../../utils/CurrencyUtils';

const ChallengesPage = () => {
    const [activeCategory, setActiveCategory] = useState('all');

    // MOCK DATA for Challenges representing the premium ZuriMarket look
    const challenges = [
        {
            id: 1,
            title: "Bitcoin Bulls Sprint",
            description: "Predict the price movement of BTC over the next 24 hours. Highest accuracy wins the pool.",
            pool: 5000,
            participants: 124,
            endsIn: "4h 20m",
            category: "crypto",
            imageUrl: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?q=80&w=2069&auto=format&fit=crop"
        },
        {
            id: 2,
            title: "S&P 500 Volatility Challenge",
            description: "Daily market sentiment challenge. Forecast the closing percentage of the S&P 500.",
            pool: 2500,
            participants: 89,
            endsIn: "6h 12m",
            category: "business",
            imageUrl: "https://images.unsplash.com/photo-1611974717482-48a86503c80a?q=80&w=2070&auto=format&fit=crop"
        },
        {
            id: 3,
            title: "US Election Sentiment",
            description: "Predict the outcome of major swing state polling data releases.",
            pool: 10000,
            participants: 412,
            endsIn: "2d 14h",
            category: "politics",
            imageUrl: "https://images.unsplash.com/photo-1508003175372-ad0cc2755538?q=80&w=2070&auto=format&fit=crop"
        }
    ];

    const filteredChallenges = activeCategory === 'all' 
        ? challenges 
        : challenges.filter(c => c.category === activeCategory);

    return (
        <div className="bg-[#0b0f0e] min-h-screen text-white font-body selection:bg-[#ddff5c] selection:text-[#0b0f0e]">
            {/* Header */}
            <header className="py-12 px-6 border-b border-white/5 bg-white/[0.02]">
                <div className="max-w-[1440px] mx-auto">
                    <h1 className="font-headline text-5xl font-black uppercase tracking-tighter text-white">
                        Challenges
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ddff5c] mt-4 max-w-lg leading-relaxed">
                        Compete in prediction sprints, climb the kinetic leaderboard, and earn multiplier rewards.
                    </p>
                </div>
            </header>

            {/* Sub-Nav */}
            <CategoryBar 
                activeCategory={activeCategory} 
                onCategoryChange={setActiveCategory} 
            />

            {/* Grid */}
            <main className="max-w-[1440px] mx-auto py-12 px-6">
                {filteredChallenges.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredChallenges.map((challenge) => (
                            <div key={challenge.id} className="bg-white/[0.03] border border-white/10 group hover:border-[#ddff5c]/30 transition-all flex flex-col rounded-none relative overflow-hidden">
                                {/* Image Decor */}
                                <div className="h-48 bg-white/5 overflow-hidden group-hover:scale-105 transition-transform duration-700">
                                    <img src={challenge.imageUrl} alt="" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                </div>
                                
                                <div className="p-8 flex flex-col h-full bg-[#0b0f0e] z-10">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-1.5 h-1.5 bg-[#ddff5c] rounded-none animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ddff5c]">Active Challenge</span>
                                    </div>
                                    
                                    <h3 className="font-headline text-2xl font-black uppercase tracking-tighter mb-4 leading-none">
                                        {challenge.title}
                                    </h3>
                                    
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30 leading-relaxed max-w-xs mb-8">
                                        {challenge.description}
                                    </p>
                                    
                                    {/* Stats */}
                                    <div className="grid grid-cols-2 gap-8 border-y border-white/5 py-6 mb-8">
                                        <div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-white/20 block mb-1">Prize Pool</span>
                                            <span className="text-xl font-headline font-black text-white flex items-center">
                                                <CoinIcon size="text-lg" />
                                                {formatCurrency(challenge.pool * 100)}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-white/20 block mb-1">Ending In</span>
                                            <span className="text-xl font-headline font-black text-[#ddff5c]">{challenge.endsIn}</span>
                                        </div>
                                    </div>
                                    
                                    <button className="w-full py-4 bg-white text-[#0b0f0e] text-[10px] font-black uppercase tracking-[0.3em] rounded-none hover:bg-[#ddff5c] transition-all active:scale-95">
                                        Enter Challenge
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-24 text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30">No active challenges in this category.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ChallengesPage;
