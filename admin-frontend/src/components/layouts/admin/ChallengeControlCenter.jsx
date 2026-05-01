import React, { useState, useEffect } from 'react';
import { adminFetch } from '../../../utils/api';

function ChallengeControlCenter() {
    const [stats, setStats] = useState(null);
    const [challenges, setChallenges] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [evaluating, setEvaluating] = useState(false);
    const [evalResult, setEvalResult] = useState(null);

    // Filters
    const [statusFilter, setStatusFilter] = useState('');
    const [usernameFilter, setUsernameFilter] = useState('');
    const [page, setPage] = useState(1);
    const limit = 15;

    const fetchStats = async () => {
        try {
            const response = await adminFetch('/v0/admin/challenges/stats');
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Failed to fetch challenge stats:', error);
        }
    };

    const fetchChallenges = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
            if (statusFilter) params.set('status', statusFilter);
            if (usernameFilter.trim()) params.set('username', usernameFilter.trim());

            const response = await adminFetch(`/v0/admin/challenges?${params}`);
            if (response.ok) {
                const data = await response.json();
                setChallenges(data.challenges || []);
                setTotal(data.total || 0);
            }
        } catch (error) {
            console.error('Failed to fetch challenges:', error);
        } finally {
            setLoading(false);
        }
    };

    const triggerDailyEvaluation = async () => {
        setEvaluating(true);
        setEvalResult(null);
        try {
            const response = await adminFetch('/v0/challenges/evaluate-daily', { method: 'POST' });
            if (response.ok) {
                const data = await response.json();
                setEvalResult(data);
                // Refresh data after evaluation
                fetchStats();
                fetchChallenges();
            }
        } catch (error) {
            console.error('Failed to trigger evaluation:', error);
            setEvalResult({ error: 'Evaluation failed' });
        } finally {
            setEvaluating(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        fetchChallenges();
    }, [page, statusFilter, usernameFilter]);

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard
                    label="Active Challenges"
                    value={stats?.active ?? '—'}
                    color="text-[#ddff5c]"
                    glow="bg-[#ddff5c]/5"
                />
                <StatsCard
                    label="Pass Rate"
                    value={stats ? `${stats.passRate?.toFixed(1) || 0}%` : '—'}
                    color="text-emerald-400"
                    glow="bg-emerald-500/5"
                />
                <StatsCard
                    label="Revenue (Entry Fees)"
                    value={stats ? `R${((stats.totalRevenue || 0) / 100).toLocaleString()}` : '—'}
                    color="text-blue-400"
                    glow="bg-blue-500/5"
                />
                <StatsCard
                    label="Rewards Paid"
                    value={stats ? `R${((stats.totalRewardsPaid || 0) / 100).toLocaleString()}` : '—'}
                    color="text-purple-400"
                    glow="bg-purple-500/5"
                />
            </div>

            {/* Summary Breakdown */}
            {stats && (
                <div className="grid grid-cols-4 gap-4">
                    <MiniStat label="Total" value={stats.totalChallenges} />
                    <MiniStat label="Passed" value={stats.passed} color="text-emerald-400" />
                    <MiniStat label="Failed" value={stats.failed} color="text-red-400" />
                    <MiniStat label="Expired" value={stats.expired} color="text-white/30" />
                </div>
            )}

            {/* Daily Evaluation Trigger */}
            <div className="bg-white/[0.02] border border-white/5 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-white mb-1">
                        Daily Evaluation Engine
                    </h3>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/20">
                        Evaluate all active challenges for expiry, losing days, and target completion
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    {evalResult && (
                        <span className={`text-[9px] font-black uppercase tracking-widest ${evalResult.error ? 'text-red-400' : 'text-emerald-400'}`}>
                            {evalResult.error || `${evalResult.processed} processed, ${evalResult.failed} errors`}
                        </span>
                    )}
                    <button
                        onClick={triggerDailyEvaluation}
                        disabled={evaluating}
                        className="px-6 py-3 bg-[#ddff5c] text-[#0b0f0e] text-[10px] font-black uppercase tracking-[0.2em] hover:brightness-110 transition-all disabled:opacity-50 whitespace-nowrap"
                    >
                        {evaluating ? (
                            <span className="flex items-center gap-2">
                                <span className="w-3 h-3 border border-[#0b0f0e] border-t-transparent animate-spin" />
                                Evaluating...
                            </span>
                        ) : 'Run Evaluation'}
                    </button>
                </div>
            </div>

            {/* Challenges List */}
            <div className="bg-white/[0.02] border border-white/5 overflow-hidden">
                {/* Filters */}
                <div className="px-6 py-4 border-b border-white/5 flex flex-col md:flex-row items-center gap-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 whitespace-nowrap">
                        Filters:
                    </span>
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        className="bg-[#0b0f0e] border border-white/10 text-white text-[10px] font-black uppercase tracking-widest px-3 py-2 focus:border-[#ddff5c]/30 focus:outline-none"
                    >
                        <option value="">All Statuses</option>
                        <option value="ACTIVE">Active</option>
                        <option value="PASSED">Passed</option>
                        <option value="FAILED">Failed</option>
                        <option value="EXPIRED">Expired</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Filter by username..."
                        value={usernameFilter}
                        onChange={(e) => { setUsernameFilter(e.target.value); setPage(1); }}
                        className="bg-[#0b0f0e] border border-white/10 text-white text-[10px] font-black uppercase tracking-widest px-3 py-2 focus:border-[#ddff5c]/30 focus:outline-none placeholder:text-white/15 flex-1"
                    />
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/20 whitespace-nowrap">
                        {total} total
                    </span>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-6 h-6 border-2 border-[#ddff5c]/20 border-t-[#ddff5c] animate-spin" />
                    </div>
                ) : challenges.length === 0 ? (
                    <div className="py-12 text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/20">No challenges found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="text-left py-3 px-4 text-[8px] font-black uppercase tracking-[0.2em] text-white/20">ID</th>
                                    <th className="text-left py-3 px-4 text-[8px] font-black uppercase tracking-[0.2em] text-white/20">User</th>
                                    <th className="text-left py-3 px-4 text-[8px] font-black uppercase tracking-[0.2em] text-white/20">Tier</th>
                                    <th className="text-center py-3 px-4 text-[8px] font-black uppercase tracking-[0.2em] text-white/20">Status</th>
                                    <th className="text-right py-3 px-4 text-[8px] font-black uppercase tracking-[0.2em] text-white/20">Balance</th>
                                    <th className="text-right py-3 px-4 text-[8px] font-black uppercase tracking-[0.2em] text-white/20">Target</th>
                                    <th className="text-right py-3 px-4 text-[8px] font-black uppercase tracking-[0.2em] text-white/20">Progress</th>
                                    <th className="text-center py-3 px-4 text-[8px] font-black uppercase tracking-[0.2em] text-white/20">Losing Days</th>
                                    <th className="text-left py-3 px-4 text-[8px] font-black uppercase tracking-[0.2em] text-white/20">Started</th>
                                </tr>
                            </thead>
                            <tbody>
                                {challenges.map((c) => {
                                    const tier = c.tier || {};
                                    const pct = c.profitTarget > c.startBalance
                                        ? Math.min(100, Math.max(0, ((c.currentBalance - c.startBalance) / (c.profitTarget - c.startBalance)) * 100))
                                        : 100;
                                    const gained = c.currentBalance - c.startBalance;

                                    return (
                                        <tr key={c.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                                            <td className="py-3 px-4 text-[10px] font-black text-white/30">#{c.id}</td>
                                            <td className="py-3 px-4 text-[10px] font-black text-white uppercase tracking-wider">{c.username}</td>
                                            <td className="py-3 px-4 text-[10px] font-black text-white/50 uppercase tracking-wider">{tier.name || '—'}</td>
                                            <td className="py-3 px-4 text-center">
                                                <StatusPill status={c.status} />
                                            </td>
                                            <td className={`py-3 px-4 text-right text-[10px] font-black uppercase tracking-wider ${gained >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                R{(c.currentBalance / 100).toLocaleString()}
                                            </td>
                                            <td className="py-3 px-4 text-right text-[10px] font-black text-[#ddff5c]/50 uppercase tracking-wider">
                                                R{(c.profitTarget / 100).toLocaleString()}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center gap-2 justify-end">
                                                    <div className="w-16 h-1.5 bg-white/5 overflow-hidden">
                                                        <div
                                                            className={`h-full ${pct >= 100 ? 'bg-emerald-400' : 'bg-[#ddff5c]'}`}
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-[9px] font-black text-white/30 w-8 text-right">{pct.toFixed(0)}%</span>
                                                </div>
                                            </td>
                                            <td className={`py-3 px-4 text-center text-[10px] font-black uppercase tracking-wider ${c.losingDaysUsed >= c.maxLosingDays ? 'text-red-400' : 'text-white/40'}`}>
                                                {c.losingDaysUsed}/{c.maxLosingDays}
                                            </td>
                                            <td className="py-3 px-4 text-[9px] font-black text-white/25 uppercase tracking-wider whitespace-nowrap">
                                                {new Date(c.startDate).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short' })}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/20">
                            Page {page} of {totalPages}
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page <= 1}
                                className="px-3 py-1.5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:border-white/20 transition-all disabled:opacity-30"
                            >
                                Prev
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page >= totalPages}
                                className="px-3 py-1.5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:border-white/20 transition-all disabled:opacity-30"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// --- Sub-components ---

const StatsCard = ({ label, value, color, glow }) => (
    <div className="bg-white/[0.02] border border-white/5 p-6 backdrop-blur-md relative overflow-hidden group hover:bg-white/[0.04] transition-all">
        <div className={`absolute top-0 right-0 w-32 h-32 ${glow} blur-[50px] -mr-16 -mt-16`} />
        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 block mb-4">{label}</label>
        <span className={`text-2xl font-black ${color}`}>{value}</span>
    </div>
);

const MiniStat = ({ label, value, color = 'text-white' }) => (
    <div className="bg-white/[0.02] border border-white/5 px-4 py-3 flex items-center justify-between">
        <span className="text-[9px] font-black uppercase tracking-widest text-white/20">{label}</span>
        <span className={`text-sm font-black ${color}`}>{value ?? 0}</span>
    </div>
);

const statusStyles = {
    ACTIVE: 'bg-[#ddff5c]/10 text-[#ddff5c] border-[#ddff5c]/20',
    PASSED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    FAILED: 'bg-red-500/10 text-red-400 border-red-500/20',
    EXPIRED: 'bg-white/5 text-white/30 border-white/10',
};

const StatusPill = ({ status }) => (
    <span className={`inline-block px-2 py-0.5 border text-[8px] font-black uppercase tracking-[0.15em] ${statusStyles[status] || statusStyles.EXPIRED}`}>
        {status}
    </span>
);

export default ChallengeControlCenter;
