import React, { useState } from 'react';
import { CoinIcon, formatCurrency } from '../../../utils/CurrencyUtils';
import { useAuth } from '../../../helpers/AuthContent';

const tierIcons = {
    rookie: 'military_tech',
    prospect: 'trending_up',
    'all-star': 'stars',
    legend: 'emoji_events',
};

const tierAccents = {
    rookie: { border: 'border-white/10', hoverBorder: 'hover:border-[#ddff5c]/30', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    prospect: { border: 'border-white/10', hoverBorder: 'hover:border-[#ddff5c]/30', badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    'all-star': { border: 'border-white/10', hoverBorder: 'hover:border-[#ddff5c]/30', badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    legend: { border: 'border-[#ddff5c]/10', hoverBorder: 'hover:border-[#ddff5c]/50', badge: 'bg-[#ddff5c]/10 text-[#ddff5c] border-[#ddff5c]/20' },
};

const BadgeHierarchy = {
    "none": 0,
    "rookie": 1,
    "prospect": 2,
    "all-star": 3,
    "legend": 4,
};

const TierRequiredBadge = {
    "rookie": "none",
    "prospect": "rookie",
    "all-star": "prospect",
    "legend": "all-star",
};

const TierCard = ({ tier, onStart, hasActiveChallenge }) => {
    const { username, challengeBadge } = useAuth();
    const isLoggedIn = !!username;
    const [starting, setStarting] = useState(false);
    const [error, setError] = useState('');

    const isFree = tier.entryFee === 0;
    const icon = tierIcons[tier.slug] || 'workspace_premium';
    const accent = tierAccents[tier.slug] || tierAccents.rookie;

    const userBadgeLevel = BadgeHierarchy[challengeBadge] || 0;
    const requiredBadge = TierRequiredBadge[tier.slug];
    const requiredBadgeLevel = BadgeHierarchy[requiredBadge] || 0;
    const isLocked = isLoggedIn && (userBadgeLevel < requiredBadgeLevel);

    const handleStart = async () => {
        if (!isLoggedIn) {
            setError('Please log in to start a challenge.');
            return;
        }
        if (hasActiveChallenge) {
            setError('Complete your active challenge first.');
            return;
        }
        if (isLocked) {
            return;
        }
        setStarting(true);
        setError('');
        try {
            await onStart(tier.slug);
        } catch (err) {
            setError(err.message);
        } finally {
            setStarting(false);
        }
    };

    return (
        <div className={`bg-white/[0.02] border ${accent.border} ${accent.hoverBorder} group transition-all duration-300 flex flex-col relative overflow-hidden`}>
            {/* Top accent line */}
            <div className={`h-[2px] w-full ${tier.slug === 'legend' ? 'bg-gradient-to-r from-[#ddff5c] to-[#caf300]' : 'bg-white/5 group-hover:bg-[#ddff5c]/30'} transition-all`} />

            <div className="p-6 md:p-8 flex flex-col flex-1">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 ${tier.slug === 'legend' ? 'bg-[#ddff5c]/10 border border-[#ddff5c]/20' : 'bg-white/5'}`}>
                            <span className={`material-symbols-outlined ${tier.slug === 'legend' ? 'text-[#ddff5c]' : 'text-white/40 group-hover:text-[#ddff5c]'} transition-colors text-xl`}>
                                {icon}
                            </span>
                        </div>
                        <div>
                            <h3 className="font-headline text-lg font-black uppercase tracking-tight text-white leading-none">
                                {tier.name}
                            </h3>
                            <div className={`inline-flex items-center gap-1.5 mt-1.5 px-2 py-0.5 border ${accent.badge} text-[8px] font-black uppercase tracking-[0.2em]`}>
                                {isFree ? 'Free Entry' : `R${(tier.entryFee / 100).toLocaleString()} Entry`}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <p className="text-[10px] font-black uppercase tracking-widest text-white/25 leading-relaxed mb-6 max-w-[280px]">
                    {tier.description}
                </p>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 border-y border-white/5 py-5 mb-6">
                    <div>
                        <span className="text-[8px] font-black uppercase tracking-widest text-white/15 block mb-1">Starting Balance</span>
                        <span className="text-sm font-headline font-black text-white flex items-center">
                            R{(tier.startingBalance / 100).toLocaleString()}
                        </span>
                    </div>
                    <div>
                        <span className="text-[8px] font-black uppercase tracking-widest text-white/15 block mb-1">Target</span>
                        <span className="text-sm font-headline font-black text-[#ddff5c] flex items-center">
                            R{(tier.profitTarget / 100).toLocaleString()}
                        </span>
                    </div>
                    <div>
                        <span className="text-[8px] font-black uppercase tracking-widest text-white/15 block mb-1">Duration</span>
                        <span className="text-sm font-headline font-black text-white">{tier.durationDays} days</span>
                    </div>
                    <div>
                        <span className="text-[8px] font-black uppercase tracking-widest text-white/15 block mb-1">Max Losing Days</span>
                        <span className="text-sm font-headline font-black text-white">{tier.maxLosingDays}</span>
                    </div>
                </div>

                {/* Reward */}
                <div className="flex items-center gap-2 mb-6 px-3 py-2.5 bg-white/[0.02] border border-white/5">
                    <span className="material-symbols-outlined text-[#ddff5c] text-base">redeem</span>
                    <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white/50">Reward:</span>
                    <span className="text-[9px] font-black uppercase tracking-[0.15em] text-[#ddff5c]">
                        {tier.rewardAmount > 0 ? `R${(tier.rewardAmount / 100).toLocaleString()} Real Money` : 'Withdraw Profits'}
                        {tier.grantsFunded && ' + Funded Badge'}
                        {tier.grantsEventCreate && ' + Event Creation'}
                    </span>
                </div>

                {/* CTA */}
                <div className="mt-auto">
                    {error && (
                        <p className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-3">{error}</p>
                    )}
                    <button
                        onClick={handleStart}
                        disabled={starting || hasActiveChallenge || isLocked}
                        className={`w-full py-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                            hasActiveChallenge
                                ? 'bg-white/5 text-white/20 cursor-not-allowed'
                                : isLocked
                                    ? 'bg-white/5 text-white/30 cursor-not-allowed'
                                    : starting
                                        ? 'bg-[#ddff5c]/50 text-[#0b0f0e] cursor-wait'
                                        : 'bg-white text-[#0b0f0e] hover:bg-[#ddff5c]'
                        }`}
                    >
                        {isLocked ? (
                            <>
                                <span className="material-symbols-outlined text-[14px]">lock</span>
                                Requires {requiredBadge} badge
                            </>
                        ) : starting ? 'Starting...' : hasActiveChallenge ? 'Challenge Active' : isFree ? 'Start Free Challenge' : `Start for R${(tier.entryFee / 100).toLocaleString()}`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TierCard;
