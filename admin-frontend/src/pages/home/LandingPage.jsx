import React, { useState } from 'react';
import CategoryBar from '../../components/markets/CategoryBar';
import MarketGrid from '../../components/markets/MarketGrid';

const LandingPage = () => {
    const [activeCategory, setActiveCategory] = useState('all');
    const [marketStatus, setMarketStatus] = useState('active');
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className="bg-[#0b0f0e] text-white selection:bg-[#ddff5c] selection:text-[#0b0f0e] font-body min-h-screen">
            <main className="max-w-[1440px] mx-auto">
                {/* Search & Categories Bar */}
                <CategoryBar 
                    activeCategory={activeCategory} 
                    onCategoryChange={setActiveCategory}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                />

                {/* Main Dashboard Content */}
                <section className="py-12 px-6">
                    <div className="flex flex-col gap-8">
                        {/* Dashboard Header */}
                        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
                            <div>
                                <h2 className="font-headline text-2xl font-black uppercase tracking-tighter text-white">
                                    {marketStatus} Markets
                                </h2>
                                <p className="font-satoshi text-sm text-white/50 mt-2">
                                    {activeCategory !== 'all' ? `${activeCategory} • ` : ''}Real-time sentiment from the ZuriMarket kinetic ledger
                                </p>
                            </div>
                            
                            {/* Tabs for Sorting (Sharp) */}
                            <div className="flex items-center bg-white/5 border border-white/5 p-1 rounded-none w-full md:w-auto overflow-x-auto no-scrollbar">
                                {['active', 'new', 'ending'].map((status) => (
                                    <button 
                                        key={status}
                                        onClick={() => setMarketStatus(status)}
                                        className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-none flex-1 md:flex-none whitespace-nowrap ${
                                            marketStatus === status 
                                                ? 'bg-[#ddff5c] text-[#0b0f0e]' 
                                                : 'text-white/40 hover:text-white/80'
                                        }`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* The Market Grid */}
                        <MarketGrid 
                            category={activeCategory} 
                            status={marketStatus}
                            searchQuery={searchQuery}
                        />
                    </div>
                </section>
            </main>
        </div>
    );
};

export default LandingPage;
