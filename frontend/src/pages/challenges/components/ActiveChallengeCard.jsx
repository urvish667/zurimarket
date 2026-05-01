import React from 'react';
import { useHistory } from 'react-router-dom';
import ProgressBar from './ProgressBar';
import ChallengeStatusBadge from './ChallengeStatusBadge';

const ActiveChallengeCard = ({ challenge }) => {
    const history = useHistory();

    if (!challenge) return null;

    const tier = challenge.tier || {};
    const remaining = challenge.remainingDays ?? Math.max(0, Math.ceil((new Date(challenge.endDate) - new Date()) / (1000 * 60 * 60 * 24)));
    const losingDaysLeft = challenge.maxLosingDays - challenge.losingDaysUsed;
    const gained = challenge.currentBalance - challenge.startBalance;
    const isPositive = gained >= 0;

    return (
        <div
            onClick={() => history.push(`/challenges/${challenge.id}`)}
            className="bg-white/[0.03] border border-[#ddff5c]/20 group hover:border-[#ddff5c]/40 transition-all cursor-pointer relative overflow-hidden"
        >
            {/* Left accent */}
            <div className="absolute top-0 left-0 w-[2px] h-full bg-[#ddff5c]" />

            <div className="p-6 md:p-8">
                {/* Header row */}
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-headline text-xl font-black uppercase tracking-tight text-white leading-none">
                                {tier.name || 'Challenge'}
                            </h3>
                            <ChallengeStatusBadge status={challenge.status} size="small" />
                        </div>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/25">
                            Attempt #{challenge.attemptNumber}
                        </p>
                    </div>
                    <span className="material-symbols-outlined text-white/10 group-hover:text-[#ddff5c] group-hover:translate-x-1 transition-all">
                        chevron_right
                    </span>
                </div>

                {/* Progress */}
                <ProgressBar
                    current={challenge.currentBalance}
                    target={challenge.profitTarget}
                    startBalance={challenge.startBalance}
                    label="Target Progress"
                />

                {/* Stats row */}
                <div className="grid grid-cols-4 gap-4 mt-6 pt-5 border-t border-white/5">
                    <div>
                        <span className="text-[8px] font-black uppercase tracking-widest text-white/15 block mb-1">Balance</span>
                        <span className={`text-sm font-headline font-black ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                            R{(challenge.currentBalance / 100).toLocaleString()}
                        </span>
                    </div>
                    <div>
                        <span className="text-[8px] font-black uppercase tracking-widest text-white/15 block mb-1">P&L</span>
                        <span className={`text-sm font-headline font-black ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                            {isPositive ? '+' : ''}R{(gained / 100).toLocaleString()}
                        </span>
                    </div>
                    <div>
                        <span className="text-[8px] font-black uppercase tracking-widest text-white/15 block mb-1">Days Left</span>
                        <span className={`text-sm font-headline font-black ${remaining <= 2 ? 'text-red-400' : 'text-white'}`}>
                            {remaining}
                        </span>
                    </div>
                    <div>
                        <span className="text-[8px] font-black uppercase tracking-widest text-white/15 block mb-1">Losing Days</span>
                        <span className={`text-sm font-headline font-black ${losingDaysLeft <= 1 ? 'text-red-400' : 'text-white'}`}>
                            {challenge.losingDaysUsed}/{challenge.maxLosingDays}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActiveChallengeCard;
