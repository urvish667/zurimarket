import React, { useState } from 'react';
import { useChallenges } from '../../hooks/useChallenges';
import { useAuth } from '../../helpers/AuthContent';
import TierCard from './components/TierCard';
import ActiveChallengeCard from './components/ActiveChallengeCard';
import ChallengeStatusBadge from './components/ChallengeStatusBadge';
import RetryModal from './components/RetryModal';

const ChallengesHub = () => {
    const { username } = useAuth();
    const isLoggedIn = !!username;
    const {
        tiers,
        activeChallenge,
        history,
        loading,
        error,
        startChallenge,
        retryChallenge,
        refresh,
    } = useChallenges();

    const [retryTarget, setRetryTarget] = useState(null);

    if (loading) {
        return (
            <div className="bg-[#0b0f0e] min-h-screen text-white font-body flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-[#ddff5c]/20 border-t-[#ddff5c] animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Loading challenges...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#0b0f0e] min-h-screen text-white font-body selection:bg-[#ddff5c] selection:text-[#0b0f0e]">
            {/* Hero Header */}
            <header className="py-12 px-6 border-b border-white/5 bg-white/[0.02] relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#ddff5c]/[0.02] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                
                <div className="max-w-[1440px] mx-auto relative">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-[#ddff5c]/10 border border-[#ddff5c]/20">
                            <span className="material-symbols-outlined text-[#ddff5c] text-xl">workspace_premium</span>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ddff5c]">Prop Firm Challenge</span>
                    </div>
                    <h1 className="font-headline text-4xl md:text-5xl font-black uppercase tracking-tighter text-white mb-3">
                        Prove Your Skills
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 max-w-lg leading-relaxed">
                        Complete structured prediction challenges to unlock real-money withdrawals. 
                        Hit your targets, manage risk, and earn rewards.
                    </p>
                </div>
            </header>

            <main className="max-w-[1440px] mx-auto py-8 px-6">
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-[10px] font-black text-red-400 uppercase tracking-widest">
                        {error}
                    </div>
                )}

                {/* Active Challenge Section */}
                {activeChallenge && (
                    <section className="mb-12">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-1.5 h-1.5 bg-[#ddff5c] animate-pulse" />
                            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ddff5c]">
                                Your Active Challenge
                            </h2>
                        </div>
                        <ActiveChallengeCard challenge={activeChallenge} />
                    </section>
                )}

                {/* Available Challenges */}
                <section className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">
                            Available Challenges
                        </h2>
                        {!isLoggedIn && (
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/20">
                                Log in to start a challenge
                            </span>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        {tiers.map((tier) => (
                            <TierCard
                                key={tier.id}
                                tier={tier}
                                onStart={startChallenge}
                                hasActiveChallenge={!!activeChallenge}
                            />
                        ))}
                    </div>
                </section>

                {/* Challenge History */}
                {isLoggedIn && history && history.length > 0 && (
                    <section>
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-6">
                            Challenge History
                        </h2>
                        <div className="space-y-3">
                            {history.map((challenge) => {
                                const tier = challenge.tier || {};
                                const gained = challenge.currentBalance - challenge.startBalance;
                                const isPositive = gained >= 0;
                                const canRetry = challenge.status === 'FAILED' || challenge.status === 'EXPIRED';

                                return (
                                    <div
                                        key={challenge.id}
                                        className="bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                                    >
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <ChallengeStatusBadge status={challenge.status} size="small" />
                                            <div className="min-w-0">
                                                <h4 className="text-[11px] font-black uppercase tracking-widest text-white truncate">
                                                    {tier.name || 'Challenge'}
                                                </h4>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-white/20 mt-0.5">
                                                    Attempt #{challenge.attemptNumber} &middot; {formatDateRange(challenge.startDate, challenge.completedAt || challenge.endDate)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <span className="text-[8px] font-black uppercase tracking-widest text-white/15 block">Final P&L</span>
                                                <span className={`text-sm font-headline font-black ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                                                    {isPositive ? '+' : ''}R{(gained / 100).toLocaleString()}
                                                </span>
                                            </div>

                                            {canRetry && !activeChallenge && (
                                                <button
                                                    onClick={() => setRetryTarget(challenge)}
                                                    className="px-4 py-2 border border-[#ddff5c]/20 text-[9px] font-black uppercase tracking-[0.2em] text-[#ddff5c] hover:bg-[#ddff5c]/10 transition-all"
                                                >
                                                    Retry
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}
            </main>

            {/* Retry Modal */}
            {retryTarget && (
                <RetryModal
                    challenge={retryTarget}
                    onRetry={async (id) => {
                        await retryChallenge(id);
                        await refresh();
                    }}
                    onClose={() => setRetryTarget(null)}
                />
            )}
        </div>
    );
};

function formatDateRange(startStr, endStr) {
    const opts = { day: '2-digit', month: 'short', year: '2-digit' };
    try {
        const start = new Date(startStr).toLocaleDateString('en-ZA', opts);
        const end = new Date(endStr).toLocaleDateString('en-ZA', opts);
        return `${start} — ${end}`;
    } catch {
        return '';
    }
}

export default ChallengesHub;
