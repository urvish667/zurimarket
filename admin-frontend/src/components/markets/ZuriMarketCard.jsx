import React from 'react';
import { Link } from 'react-router-dom';
import formatResolutionDate from '../../helpers/formatResolutionDate';
import { CoinIcon, formatCurrency } from '../../utils/CurrencyUtils';

const CATEGORY_COLORS = {
    politics: { bg: 'bg-blue-500/10', text: 'text-blue-400', icon: 'account_balance' },
    crypto: { bg: 'bg-orange-500/10', text: 'text-orange-400', icon: 'currency_bitcoin' },
    sports: { bg: 'bg-green-500/10', text: 'text-green-400', icon: 'sports_soccer' },
    business: { bg: 'bg-purple-500/10', text: 'text-purple-400', icon: 'trending_up' },
    science: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', icon: 'science' },
    entertainment: { bg: 'bg-pink-500/10', text: 'text-pink-400', icon: 'movie' },
    other: { bg: 'bg-white/5', text: 'text-white/40', icon: 'more_horiz' },
};

const CircularProgress = ({ percentage, color = '#ddff5c', size = 32, strokeWidth = 3 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-out"
                />
            </svg>
            <span className="absolute text-[9px] font-bold font-headline" style={{ color }}>
                {Math.round(percentage)}%
            </span>
        </div>
    );
};

const ZuriMarketCard = ({ marketData }) => {
    const { market, lastProbability, totalVolume } = marketData;
    const probPercent = Math.round(lastProbability * 100);
    const category = market.category?.toLowerCase() || 'other';
    const catStyle = CATEGORY_COLORS[category] || CATEGORY_COLORS.other;
    const isMultipleChoice = market.outcomeType === 'MULTIPLE_CHOICE';
    const marketLink = market.slug || market.id;

    return (
        <Link 
            to={`/markets/${marketLink}`}
            className="group flex flex-col bg-[#131313] border border-[#ffffff0a] hover:border-[#ddff5c]/30 rounded-sm hover:-translate-y-1 transition-all duration-200"
        >
            {/* Top Bar: Category + Volume */}
            <div className="p-4 pb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {market.image_url ? (
                        <div className="w-6 h-6 rounded-sm bg-[#1f2020] overflow-hidden flex-shrink-0">
                            <img src={market.image_url} alt="" className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className={`w-6 h-6 rounded-sm flex items-center justify-center ${catStyle.bg} flex-shrink-0`}>
                            <span className={`material-symbols-outlined text-[14px] ${catStyle.text}`}>{catStyle.icon}</span>
                        </div>
                    )}
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#adaaaa]">
                        {category}
                    </span>
                </div>
                <div className="flex items-center gap-1 text-[9px] font-bold tracking-widest text-white/30 uppercase">
                    <CoinIcon size="text-[12px]" className="text-white/20" />
                    {formatCurrency(totalVolume)} Vol
                </div>
            </div>

            {/* Title Content */}
            <div className="px-4 pb-3 flex-1 flex flex-col">
                <h3 className="font-headline text-base font-bold leading-snug text-white/90 group-hover:text-white transition-colors line-clamp-3 mb-2">
                    {market.questionTitle}
                </h3>
                <div className="mt-auto flex items-center gap-3 text-[9px] font-bold uppercase tracking-widest text-[#adaaaa]/60">
                    <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[10px]">schedule</span>
                        {formatResolutionDate(market.resolutionDateTime)}
                    </span>
                    {isMultipleChoice && (
                        <span className="flex items-center gap-1 text-[#ddff5c]/50">
                            <span className="material-symbols-outlined text-[10px]">ballot</span>
                            {market.options?.length || '3+'} Options
                        </span>
                    )}
                </div>
            </div>

            {/* Bottom Actions / Prices (Condensed) */}
            <div className="px-3 pb-3">
                {isMultipleChoice ? (
                    <div className="flex bg-[#191a1a] p-1.5 rounded-sm justify-between items-center px-3 border border-[#ffffff05]">
                        <div className="min-w-0">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-[#ddff5c]/70">
                                Multiple Outcomes
                            </div>
                            <span className="text-xs font-bold text-[#adaaaa] truncate block max-w-[60%]">
                                Open market with {market.options?.length || '3+'} choices
                            </span>
                        </div>
                        <CircularProgress
                            percentage={100}
                            color="#ddff5c"
                            size={28}
                            strokeWidth={2.5}
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center justify-between bg-[#27ae60]/10 border border-[#27ae60]/20 p-2 rounded-sm group-hover:bg-[#27ae60]/20 transition-colors">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#27ae60]">Yes</span>
                            <span className="text-sm font-bold font-headline text-[#27ae60]">{probPercent}%</span>
                        </div>
                        <div className="flex items-center justify-between bg-[#191a1a] border border-[#ffffff05] p-2 rounded-sm group-hover:bg-[#ffffff0a] transition-colors">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#adaaaa]">No</span>
                            <span className="text-sm font-bold font-headline text-[#adaaaa]">{100 - probPercent}%</span>
                        </div>
                    </div>
                )}
            </div>
        </Link>
    );
};

export default ZuriMarketCard;
