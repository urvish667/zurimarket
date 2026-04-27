import React from 'react';

const categories = [
    { id: 'all', name: 'All', icon: 'grid_view' },
    { id: 'politics', name: 'Politics', icon: 'account_balance' },
    { id: 'crypto', name: 'Crypto', icon: 'currency_bitcoin' },
    { id: 'sports', name: 'Sports', icon: 'sports_soccer' },
    { id: 'business', name: 'Business', icon: 'trending_up' },
    { id: 'science', name: 'Science', icon: 'science' },
    { id: 'entertainment', name: 'Entertainment', icon: 'movie' },
];

const CategoryBar = ({ activeCategory, onCategoryChange, searchQuery, onSearchChange }) => {
    return (
        <div className="w-full border-b border-white/5 bg-[#0b0f0e]">
            <div className="max-w-[1440px] mx-auto px-6 h-auto md:h-14 flex flex-col md:flex-row items-center justify-between gap-4 py-4 md:py-0">
                {/* Categories Scrollable Container */}
                <div className="flex items-center gap-6 overflow-x-auto no-scrollbar w-full md:w-auto scroll-smooth">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => onCategoryChange(cat.id)}
                            className={`flex items-center gap-1.5 whitespace-nowrap text-[10px] font-black uppercase tracking-[0.2em] transition-all relative py-4 md:py-1 ${
                                activeCategory === cat.id 
                                    ? 'text-[#ddff5c]' 
                                    : 'text-white/40 hover:text-white/80'
                            }`}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{cat.icon}</span>
                            {cat.name}
                            {activeCategory === cat.id && (
                                <div className="absolute bottom-0 md:-bottom-5 left-0 w-full h-0.5 bg-[#ddff5c]" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Market Search Bar */}
                <div className="w-full md:w-80 relative group">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#ddff5c] transition-colors">
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>search</span>
                    </span>
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="SEARCH MARKETS..." 
                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/5 rounded-none text-[10px] font-black tracking-widest uppercase focus:outline-none focus:bg-white/10 focus:border-[#ddff5c]/30 transition-all placeholder:text-white/20"
                    />
                </div>
            </div>
        </div>
    );
};

export default CategoryBar;
