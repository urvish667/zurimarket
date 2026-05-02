import React from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useChallengeDetail } from '../../hooks/useChallenges';
import ProgressBar from './components/ProgressBar';
import ChallengeStatusBadge from './components/ChallengeStatusBadge';
import DailyLogTable from './components/DailyLogTable';

const ChallengeDetail = () => {
    const { id } = useParams();
    const history = useHistory();
    const { challenge, loading, error } = useChallengeDetail(id);

    if (loading) {
        return (
            <div className="bg-[#0b0f0e] min-h-screen text-white font-body flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[#ddff5c]/20 border-t-[#ddff5c] animate-spin" />
            </div>
        );
    }

    if (error || !challenge) {
        return (
            <div className="bg-[#0b0f0e] min-h-screen text-white font-body flex flex-col items-center justify-center gap-4">
                <span className="material-symbols-outlined text-white/20 text-4xl">error</span>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30">
                    {error || 'Challenge not found'}
                </p>
                <button
                    onClick={() => history.push('/challenges')}
                    className="px-6 py-2 border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-white/50 hover:text-white hover:border-white/20 transition-all"
                >
                    Back to Challenges
                </button>
            </div>
        );
    }

    const tier = challenge.tier || {};
    const gained = challenge.currentBalance - challenge.startBalance;
    const isPositive = gained >= 0;
    const remaining = challenge.remainingDays ?? Math.max(0, Math.ceil((new Date(challenge.endDate) - new Date()) / (1000 * 60 * 60 * 24)));
    const losingDaysLeft = challenge.maxLosingDays - challenge.losingDaysUsed;
    const progressPct = challenge.progressPct ?? (
        challenge.profitTarget > challenge.startBalance
            ? Math.min(100, Math.max(0, ((challenge.currentBalance - challenge.startBalance) / (challenge.profitTarget - challenge.startBalance)) * 100))
            : 100
    );

    const isActive = challenge.status === 'ACTIVE';
    const isPassed = challenge.status === 'PASSED';
    const isFailed = challenge.status === 'FAILED';

    return (
        <div className="bg-[#0b0f0e] min-h-screen text-white font-body selection:bg-[#ddff5c] selection:text-[#0b0f0e]">
            {/* Header */}
            <header className="py-8 px-6 border-b border-white/5 bg-white/[0.02]">
                <div className="max-w-[1200px] mx-auto">
                    {/* Back nav */}
                    <button
                        onClick={() => history.push('/challenges')}
                        className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-white/30 hover:text-[#ddff5c] transition-colors mb-6 group"
                    >
                        <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
                        All Challenges
                    </button>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="font-headline text-3xl font-black uppercase tracking-tighter text-white">
                                    {tier.name || 'Challenge'}
                                </h1>
                                <ChallengeStatusBadge status={challenge.status} />
                            </div>
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/25">
                                Attempt #{challenge.attemptNumber} &middot; Started {new Date(challenge.startDate).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                        </div>

                        {isPassed && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20">
                                <span className="material-symbols-outlined text-emerald-400 text-base">verified</span>
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400">
                                    Challenge Complete — Rewards Credited
                                </span>
                            </div>
                        )}

                        {isFailed && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20">
                                <span className="material-symbols-outlined text-red-400 text-base">cancel</span>
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-red-400">
                                    Challenge Failed
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-[1200px] mx-auto py-8 px-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        label="Current Balance"
                        value={`R${(challenge.currentBalance / 100).toLocaleString()}`}
                        color={isPositive ? 'text-emerald-400' : 'text-red-400'}
                        icon="account_balance_wallet"
                    />
                    <StatCard
                        label="Profit / Loss"
                        value={`${isPositive ? '+' : ''}R${(gained / 100).toLocaleString()}`}
                        color={isPositive ? 'text-emerald-400' : 'text-red-400'}
                        icon="trending_up"
                    />
                    <StatCard
                        label="Days Remaining"
                        value={isActive ? remaining : '—'}
                        color={remaining <= 2 && isActive ? 'text-red-400' : 'text-white'}
                        icon="schedule"
                    />
                    <StatCard
                        label="Losing Days"
                        value={`${challenge.losingDaysUsed} / ${challenge.maxLosingDays}`}
                        color={losingDaysLeft <= 1 ? 'text-red-400' : 'text-white'}
                        icon="warning"
                    />
                </div>

                {/* Progress Section */}
                <div className="bg-white/[0.02] border border-white/5 p-6 md:p-8 mb-8">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-4">
                        Target Progress
                    </h2>
                    <ProgressBar
                        current={challenge.currentBalance}
                        target={challenge.profitTarget}
                        startBalance={challenge.startBalance}
                        label={null}
                    />
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                        <div>
                            <span className="text-[8px] font-black uppercase tracking-widest text-white/15 block mb-1">Start</span>
                            <span className="text-xs font-headline font-black text-white/40">R{(challenge.startBalance / 100).toLocaleString()}</span>
                        </div>
                        <div className="text-center">
                            <span className="text-[8px] font-black uppercase tracking-widest text-white/15 block mb-1">Current</span>
                            <span className={`text-xs font-headline font-black ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                                R{(challenge.currentBalance / 100).toLocaleString()}
                            </span>
                        </div>
                        <div className="text-right">
                            <span className="text-[8px] font-black uppercase tracking-widest text-white/15 block mb-1">Target</span>
                            <span className="text-xs font-headline font-black text-[#ddff5c]">R{(challenge.profitTarget / 100).toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Rules Summary */}
                <div className="bg-white/[0.02] border border-white/5 p-6 md:p-8 mb-8">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-4">
                        Challenge Rules
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <RuleItem icon="flag" label="Profit Target" value={`R${(challenge.profitTarget / 100).toLocaleString()}`} met={challenge.currentBalance >= challenge.profitTarget} />
                        <RuleItem icon="calendar_today" label="Complete Within" value={`${tier.durationDays || '—'} days`} met={isActive ? remaining > 0 : isPassed} failed={!isActive && remaining <= 0 && !isPassed} />
                        <RuleItem icon="block" label="Max Losing Days" value={`${challenge.maxLosingDays} days`} met={challenge.losingDaysUsed <= challenge.maxLosingDays} failed={challenge.losingDaysUsed > challenge.maxLosingDays} />
                        <RuleItem icon="speed" label="Max Daily Loss" value={`${challenge.maxDailyLossPct}%`} met={true} />
                    </div>
                </div>

                {/* Daily Log */}
                <div className="bg-white/[0.02] border border-white/5 p-6 md:p-8">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-4">
                        Daily Performance Log
                    </h2>
                    <DailyLogTable logs={challenge.dailyLogs} />
                </div>
            </main>
        </div>
    );
};

const StatCard = ({ label, value, color = 'text-white', icon }) => (
    <div className="bg-white/[0.02] border border-white/5 p-5 relative overflow-hidden group hover:border-white/10 transition-all">
        <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-white/10 text-sm">{icon}</span>
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20">{label}</span>
        </div>
        <p className={`text-xl font-headline font-black ${color}`}>{value}</p>
    </div>
);

const RuleItem = ({ icon, label, value, met = false, failed = false }) => (
    <div className={`flex items-center gap-3 p-3 border ${failed ? 'border-red-500/20 bg-red-500/[0.03]' : met ? 'border-emerald-500/20 bg-emerald-500/[0.03]' : 'border-white/5'}`}>
        <span className={`material-symbols-outlined text-base ${failed ? 'text-red-400' : met ? 'text-emerald-400' : 'text-white/20'}`}>
            {failed ? 'cancel' : met ? 'check_circle' : icon}
        </span>
        <div className="flex-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-white/40">{label}</span>
        </div>
        <span className="text-[9px] font-black uppercase tracking-widest text-white/60">{value}</span>
    </div>
);

export default ChallengeDetail;
