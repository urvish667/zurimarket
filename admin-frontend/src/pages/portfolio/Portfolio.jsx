import React, { useState } from 'react';
import { useAuth } from '../../helpers/AuthContent';
import useUserData from '../../hooks/useUserData';
import usePortfolio from '../../hooks/usePortfolio';
import LoadingSpinner from '../../components/loaders/LoadingSpinner';
import Pagination from '../../components/common/Pagination';

const Portfolio = () => {
    const { username } = useAuth();
    const [currentPage, setCurrentPage] = useState(1);
    const { userData, userLoading, userError } = useUserData(username, true);
    const { portfolio, portfolioLoading, portfolioError } = usePortfolio(username, currentPage, 20);
    const [activeTab, setActiveTab] = useState('positions');

    if (userLoading || portfolioLoading) return <LoadingSpinner />;
    if (userError || portfolioError) return <div className="p-8 text-red-500">Error loading portfolio data.</div>;

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount / 100);
    };

    const totalLiquidity = userData?.accountBalance || 0;
    const portfolioValue = (portfolio?.totalSharesOwned || 0) * 100; // Mock calculation
    const totalProfitLoss = 0; // TBD logic
    const winRate = "68.4"; // TBD logic
    const transactionCount = portfolio?.pagination?.totalRows || 0;

    return (
        <div className="min-h-screen bg-[#0e0e0e] text-white font-body antialiased pb-20">
            <main className="max-w-[1440px] mx-auto px-6 pt-6 sm:pt-8 space-y-8 sm:space-y-10">
                
                {/* Header Section */}
                <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-0.5 uppercase font-headline">
                            My Portfolio
                        </h1>
                        <p className="text-[#adaaaa] text-sm tracking-widest uppercase">Trading Activity & Balances</p>
                    </div>
                </section>

                {/* Financial Overview Blocks (Polymarket Style) */}
                <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total Balance / Liquidity */}
                    <div className="bg-[#131313] p-5 sm:p-6 flex flex-col justify-center rounded-sm border-l-4 border-blue-500 hover:bg-[#1a1c1a] transition-colors">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-blue-400 mb-2 block font-medium">Total Balance</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl sm:text-3xl font-bold font-headline tracking-tighter">
                                {formatCurrency(totalLiquidity).replace('R', '').trim()}
                            </span>
                            <span className="text-xs text-[#adaaaa] font-headline">ZAR</span>
                        </div>
                    </div>

                    {/* Position Value */}
                    <div className="bg-[#131313] p-5 sm:p-6 flex flex-col justify-center rounded-sm border-l-4 border-[#27ae60] hover:bg-[#1a1c1a] transition-colors">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-[#27ae60] mb-2 block font-medium">Position Value</span>
                        <p className="text-2xl sm:text-3xl font-bold font-headline">{formatCurrency(portfolioValue)}</p>
                    </div>

                    {/* Total Profit / Loss */}
                    <div className="bg-[#131313] p-5 sm:p-6 flex flex-col justify-center rounded-sm border-l-4 border-[red] hover:bg-[#1a1c1a] transition-colors">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-[#adaaaa] mb-2 block font-medium">Total Profit / Loss</span>
                        <p className={`text-2xl sm:text-3xl font-bold font-headline ${totalProfitLoss >= 0 ? 'text-[#27ae60]' : 'text-red-400'}`}>
                            {totalProfitLoss >= 0 ? '+' : ''}{formatCurrency(totalProfitLoss)}
                        </p>
                    </div>

                    {/* Markets Traded / Positions */}
                    <div className="bg-[#131313] p-5 sm:p-6 flex flex-col justify-center rounded-sm border-l-4 border-[#e2d634] hover:bg-[#1a1c1a] transition-colors">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-[#e2d634] mb-2 block font-medium">Markets Traded</span>
                        <p className="text-2xl sm:text-3xl font-bold font-headline">{transactionCount}</p>
                    </div>
                </section>

                {/* Activity Tabs & Content */}
                <section className="bg-[#131313] overflow-hidden rounded-sm">
                    <div className="flex border-b border-[#484848]/15">
                        <button 
                            onClick={() => setActiveTab('positions')}
                            className={`px-6 py-4 text-[10px] font-bold font-headline uppercase tracking-widest transition-all ${activeTab === 'positions' ? 'text-white border-b-2 border-white bg-[#1f2020]' : 'text-[#adaaaa] hover:text-white'}`}
                        >
                            Positions
                        </button>
                        <button 
                            onClick={() => setActiveTab('history')}
                            className={`px-6 py-4 text-[10px] font-bold font-headline uppercase tracking-widest transition-all ${activeTab === 'history' ? 'text-white border-b-2 border-white bg-[#1f2020]' : 'text-[#adaaaa] hover:text-white'}`}
                        >
                            History
                        </button>
                    </div>
                    
                    {/* Activity Table (Type, Market, Amount) */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[9px] font-headline uppercase tracking-[0.2em] text-[#adaaaa] border-b border-[#484848]/10 bg-[#1f2020]">
                                    <th className="px-6 py-3 font-normal w-24">Type</th>
                                    <th className="px-6 py-3 font-normal">Market</th>
                                    <th className="px-6 py-3 font-normal text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#484848]/5">
                                {portfolio?.portfolioItems?.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-[#1a1c1a] transition-colors group text-xs">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 bg-[#27ae60]/10 text-[#27ae60] rounded-sm font-bold tracking-wider">
                                                BUY {item.yesSharesOwned > 0 ? 'YES' : 'NO'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium mb-0.5 group-hover:text-blue-400 transition-colors line-clamp-1">{item.questionTitle}</p>
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono text-[#d7ff81]">
                                            {item.yesSharesOwned + item.noSharesOwned} Shares
                                        </td>
                                    </tr>
                                ))}
                                {(!portfolio?.portfolioItems || portfolio.portfolioItems.length === 0) && (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-8 text-center text-[#adaaaa] text-xs italic">
                                            No recent activity found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {portfolio?.pagination && portfolio.pagination.totalPages > 1 && (
                        <div className="border-t border-[#484848]/15 bg-[#131313]">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={portfolio.pagination.totalPages}
                                onPageChange={handlePageChange}
                                totalRows={portfolio.pagination.totalRows}
                                limit={portfolio.pagination.limit}
                            />
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default Portfolio;
