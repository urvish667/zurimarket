import { API_URL } from '../../../../config';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMarketLabels } from '../../../../utils/labelMapping';

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
        return amount.toLocaleString();
    };

    const getProfitColor = (profit) => {
        if (profit > 0) return 'text-green-400';
        if (profit < 0) return 'text-red-400';
        return 'text-gray-300';
    };

    const getPositionBadge = (position) => {
        const baseClasses = "px-2 py-0.5 border text-[10px] font-black uppercase tracking-widest";
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
            <div className="p-4 text-center">
                <div className="text-gray-400">Loading leaderboard...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-center">
                <div className="text-red-400">{error}</div>
            </div>
        );
    }

    if (leaderboard.length === 0) {
        return (
            <div className="p-4 text-center">
                <div className="text-gray-400">No participants yet</div>
            </div>
        );
    }

    const labels = market ? getMarketLabels(market) : { yes: "YES", no: "NO" };

    return (
        <div className="p-0">
            {/* Header */}
            <div className="grid grid-cols-2 sm:grid-cols-7 gap-2 sm:gap-4 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white/30 border-b border-white/10 hidden sm:grid">
                <div>Rank</div>
                <div>User</div>
                <div>Position</div>
                <div className="text-right">Profit</div>
                <div className="text-right">Value</div>
                <div className="text-right">Spent</div>
                <div className="text-right">Shares</div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white/30 border-b border-white/10 sm:hidden">
                <div>User</div>
                <div className="text-right">Profit</div>
            </div>

            {/* Leaderboard Rows */}
            {leaderboard.map((entry, index) => (
                <div key={entry.username} className="grid grid-cols-2 sm:grid-cols-7 gap-2 sm:gap-4 px-4 py-3 border-b border-white/5 hover:bg-white/[0.02] transition-colors items-center">
                    
                    {/* Rank + Username (xs) / Rank (sm+) */}
                    <div className="flex items-center sm:hidden">
                        <div className="text-[#ddff5c] font-black text-sm mr-2 w-6">
                            {getRankDisplay(entry.rank)}
                        </div>
                        <div className="min-w-0">
                            <Link to={`/user/${entry.username}`} className="text-[#ddff5c] text-xs font-black uppercase tracking-widest hover:brightness-110 transition-colors truncate block">
                                @{entry.username}
                            </Link>
                        </div>
                    </div>

                    <div className="hidden sm:block text-white font-black text-sm">
                        {getRankDisplay(entry.rank)}
                    </div>

                    {/* Username (sm+) */}
                    <div className="hidden sm:block min-w-0">
                        <Link to={`/user/${entry.username}`} className="text-[#ddff5c] text-xs font-black uppercase tracking-widest hover:brightness-110 transition-colors truncate block">
                            @{entry.username}
                        </Link>
                    </div>

                    {/* Position (sm+) */}
                    <div className="hidden sm:block">
                        <span className={getPositionBadge(entry.position)}>
                            {entry.position}
                        </span>
                    </div>

                    {/* P&L + Subline (xs) / Profit (sm+) */}
                    <div className="text-right">
                        <div className={`font-black text-xs tracking-widest ${getProfitColor(entry.profit)}`}>
                            {entry.profit >= 0 ? '+' : ''}🪙 {formatCurrency(Math.floor(entry.profit))}
                        </div>
                        <div className="sm:hidden text-[10px] font-black tracking-widest uppercase text-white/30 mt-1">
                            {entry.position} • {entry.yesSharesOwned}Y {entry.noSharesOwned}N
                        </div>
                    </div>

                    {/* Current Value (sm+) */}
                    <div className="hidden sm:block text-right text-xs font-black tracking-widest text-white">
                        🪙 {formatCurrency(Math.floor(entry.currentValue))}
                    </div>

                    {/* Total Spent (sm+) */}
                    <div className="hidden sm:block text-right text-xs font-black tracking-widest text-white/50">
                        🪙 {formatCurrency(Math.floor(entry.totalSpent))}
                    </div>

                    {/* Shares (sm+) */}
                    <div className="hidden sm:block text-right text-[10px] font-black uppercase tracking-widest text-white/40">
                        <div><span className="text-[#34d399]">Y</span> {Math.floor(entry.yesSharesOwned)}</div>
                        <div><span className="text-[#f87171]">N</span> {Math.floor(entry.noSharesOwned)}</div>
                    </div>
                </div>
            ))}
            {pagination && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                    totalRows={pagination.totalRows}
                    limit={pagination.limit}
                />
            )}
        </div>
    );
};

export default LeaderboardActivity;
