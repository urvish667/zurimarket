import { API_URL } from '../../../../config';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMarketLabels } from '../../../../utils/labelMapping';
import Pagination from '../../../../components/common/Pagination';

const LeaderboardActivity = ({ marketId, market }) => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_URL}/v0/markets/leaderboard/${marketId}?page=${currentPage}&limit=10`);
                if (response.ok) {
                    const data = await response.json();
                    setLeaderboard(data.leaderboard || []);
                    setPagination(data.pagination);
                } else {
                    console.error('Error fetching leaderboard:', response.statusText);
                    setError('Failed to load leaderboard data');
                }
            } catch (err) {
                console.error('Error fetching leaderboard:', err);
                setError('Failed to load leaderboard data');
            } finally {
                setLoading(false);
            }
        };

        if (marketId) {
            fetchLeaderboard();
        }
    }, [marketId, currentPage]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const formatCurrency = (amount) => {
        return Math.floor(amount).toLocaleString();
    };

    const getProfitColor = (profit) => {
        if (profit > 0) return 'text-green-400';
        if (profit < 0) return 'text-red-400';
        return 'text-gray-300';
    };

    const getPositionBadge = (position) => {
        const baseClasses = "px-2 py-0.5 border text-[10px] font-black uppercase tracking-widest rounded-sm";
        switch (position) {
            case 'YES':
                return `${baseClasses} border-[#34d399]/30 bg-[#34d399]/10 text-[#34d399]`;
            case 'NO':
                return `${baseClasses} border-[#f87171]/30 bg-[#f87171]/10 text-[#f87171]`;
            case 'NEUTRAL':
                return `${baseClasses} border-yellow-500/30 bg-yellow-500/10 text-yellow-500`;
            default:
                return `${baseClasses} border-gray-500/30 bg-gray-500/10 text-gray-400`;
        }
    };

    const getRankDisplay = (rank) => {
        if (rank === 1) return "🥇";
        if (rank === 2) return "🥈";
        if (rank === 3) return "🥉";
        return `#${rank}`;
    };

    if (loading) {
        return (
            <div className="p-8 text-center">
                <div className="text-white/40 text-[10px] font-black uppercase tracking-widest animate-pulse">Loading leaderboard...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center">
                <div className="text-red-400 text-[10px] font-black uppercase tracking-widest">{error}</div>
            </div>
        );
    }

    if (leaderboard.length === 0) {
        return (
            <div className="p-12 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                <span className="material-symbols-outlined text-white/10 text-4xl mb-3">leaderboard</span>
                <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">No participants yet. Be the first to trade!</p>
            </div>
        );
    }

    const labels = market ? getMarketLabels(market) : { yes: "YES", no: "NO" };

    return (
        <div className="p-0 space-y-4">
            {/* Table Container */}
            <div className="overflow-x-auto">
                {/* Header */}
                <div className="grid grid-cols-2 sm:grid-cols-7 gap-4 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/30 border-b border-white/10 hidden sm:grid min-w-[800px]">
                    <div>Rank</div>
                    <div className="col-span-2">User</div>
                    <div className="text-right">Profit</div>
                    <div className="text-right">Value</div>
                    <div className="text-right">Spent</div>
                    <div className="text-right">Shares</div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white/30 border-b border-white/10 sm:hidden">
                    <div>User</div>
                    <div className="text-right">Profit</div>
                </div>

                {/* Leaderboard Rows */}
                <div className="min-w-0 sm:min-w-[800px]">
                    {leaderboard.map((entry) => (
                        <div key={entry.username} className="grid grid-cols-2 sm:grid-cols-7 gap-4 px-4 sm:px-6 py-4 border-b border-white/5 hover:bg-white/[0.03] transition-all items-center group">
                            
                            {/* Rank (sm+) */}
                            <div className="hidden sm:block text-white font-black text-sm group-hover:text-[#ddff5c] transition-colors">
                                {getRankDisplay(entry.rank)}
                            </div>

                            {/* User Info (Avatar + Name) */}
                            <div className="col-span-2 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-lg overflow-hidden flex-shrink-0 shadow-inner">
                                    {entry.avatar ? (
                                        <img src={entry.avatar} alt={entry.username} className="w-full h-full object-cover" />
                                    ) : (
                                        entry.personalEmoji || '👤'
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <div className="sm:hidden text-[#ddff5c] font-black text-[10px] mb-0.5">
                                        {getRankDisplay(entry.rank)}
                                    </div>
                                    <Link to={`/user/${entry.username}`} className="text-[#ddff5c] text-[11px] font-black uppercase tracking-widest hover:underline truncate block">
                                        @{entry.username}
                                    </Link>
                                    <div className="sm:hidden mt-1">
                                        <span className={getPositionBadge(entry.position)}>
                                            {entry.position}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Position (sm+) - integrated into user column for better layout? No, keep it separate for now */}
                            <div className="hidden sm:block">
                                <span className={getPositionBadge(entry.position)}>
                                    {entry.position}
                                </span>
                            </div>

                            {/* Profit */}
                            <div className="text-right">
                                <div className={`font-black text-xs tracking-widest ${getProfitColor(entry.profit)}`}>
                                    {entry.profit >= 0 ? '+' : ''}🪙 {formatCurrency(entry.profit)}
                                </div>
                                <div className="sm:hidden text-[9px] font-black tracking-widest uppercase text-white/20 mt-1">
                                    {Math.floor(entry.yesSharesOwned)}Y {Math.floor(entry.noSharesOwned)}N
                                </div>
                            </div>

                            {/* Current Value (sm+) */}
                            <div className="hidden sm:block text-right text-xs font-black tracking-widest text-white">
                                🪙 {formatCurrency(entry.currentValue)}
                            </div>

                            {/* Total Spent (sm+) */}
                            <div className="hidden sm:block text-right text-xs font-black tracking-widest text-white/40">
                                🪙 {formatCurrency(entry.totalSpent)}
                            </div>

                            {/* Shares (sm+) */}
                            <div className="hidden sm:block text-right text-[10px] font-black uppercase tracking-widest text-white/30">
                                <div><span className="text-[#34d399]/60">Y</span> {Math.floor(entry.yesSharesOwned)}</div>
                                <div><span className="text-[#f87171]/60">N</span> {Math.floor(entry.noSharesOwned)}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {pagination && (
                <div className="px-4 py-6">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={pagination.totalPages}
                        onPageChange={handlePageChange}
                        totalRows={pagination.totalRows}
                        limit={pagination.limit}
                    />
                </div>
            )}
        </div>
    );
};

export default LeaderboardActivity;
