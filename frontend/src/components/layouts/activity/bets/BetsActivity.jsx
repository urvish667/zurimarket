import { API_URL } from '../../../../config';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Pagination from '../../../common/Pagination';
import { useAuth } from '../../../../helpers/AuthContent';

const BetsActivityLayout = ({ marketId, refreshTrigger }) => {
    const [bets, setBets] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const { token } = useAuth();

    useEffect(() => {
        const fetchBets = async () => {
            const headers = { 'Authorization': `Bearer ${token}` };
            const response = await fetch(`${API_URL}/v0/markets/bets/${marketId}?page=${currentPage}&limit=20`, { headers });

            if (response.ok) {
                const data = await response.json();
                setBets(data.bets || []);
                setPagination(data.pagination);
            } else {
                console.error('Error fetching bets:', response.statusText);
            }
        };
        fetchBets();
    }, [marketId, refreshTrigger, currentPage, token]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    return (
        <div className="p-0">
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-4 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white/30 border-b border-white/10">
                <div>User</div>
                <div className="text-center">Side</div>
                <div className="text-right">Amt</div>
                <div className="hidden sm:block text-right">After</div>
                <div className="text-right">Date</div>
            </div>
            {bets.map((bet, index) => (
                <div key={index} className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-4 px-4 py-3 border-b border-white/5 hover:bg-white/[0.02] transition-colors items-center">
                    {/* Username */}
                    <div className="min-w-0">
                        <Link to={`/user/${bet.username}`} className="text-[#ddff5c] text-xs font-black uppercase tracking-widest hover:brightness-110 transition-colors truncate block">
                            @{bet.username}
                        </Link>
                    </div>

                    {/* Outcome */}
                    <div className="text-center">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 border ${bet.outcome === 'YES' ? 'border-[#34d399]/30 bg-[#34d399]/10 text-[#34d399]' : 'border-[#f87171]/30 bg-[#f87171]/10 text-[#f87171]'}`}>
                            {bet.outcome}
                        </span>
                    </div>

                    {/* Amount */}
                    <div className="text-right text-xs font-black tracking-widest text-white">
                        {bet.amount}
                    </div>

                    {/* After (sm+) */}
                    <div className="hidden sm:block text-right text-xs font-black tracking-widest text-white/50">
                        {(bet.probability * 100).toFixed(0)}%
                    </div>

                    {/* Placed */}
                    <div className="text-right text-[10px] font-black uppercase tracking-widest text-white/30">
                        {new Date(bet.placedAt).toLocaleDateString(undefined, {month:'short', day:'2-digit'})}
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

export default BetsActivityLayout;
