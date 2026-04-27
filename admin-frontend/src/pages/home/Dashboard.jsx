import React from 'react';
import { useAuth } from '../../helpers/AuthContent';
import { useHistory } from 'react-router-dom';
import MarketGrid from '../../components/markets/MarketGrid';
import { CoinIcon, formatCurrency } from '../../utils/CurrencyUtils';

const Dashboard = () => {
    const { username } = useAuth();
    const history = useHistory();

    return (
        <div className="space-y-8 bg-[#0b0f0e] min-h-screen text-white rounded-none">
            {/* User Welcome & Stats Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Welcome Card */}
                <section className="lg:col-span-8 bg-white/[0.03] border border-white/5 p-8 rounded-none relative overflow-hidden group">
                    <div className="relative z-10">
                        <h1 className="font-headline text-3xl font-black uppercase tracking-tighter text-white leading-none">
                            Welcome back,<br />
                            <span className="text-[#ddff5c]">{username}</span>
                        </h1>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mt-4 max-w-sm leading-relaxed">
                            The kinetic ledger is moving. You have active predictions resolving soon. Stay sharp.
                        </p>
                        <div className="mt-8 flex gap-4">
                            <button 
                                onClick={() => history.push('/create')}
                                className="px-6 py-2.5 bg-[#ddff5c] text-[#0b0f0e] text-[10px] font-black uppercase tracking-widest rounded-none hover:brightness-110 transition-all active:scale-95"
                            >
                                Create Market
                            </button>
                            <button 
                                onClick={() => history.push('/account/me')}
                                className="px-6 py-2.5 border border-white/10 text-white/80 text-[10px] font-black uppercase tracking-widest rounded-none hover:bg-white/5 transition-all"
                            >
                                View Portfolio
                            </button>
                        </div>
                    </div>
                    {/* Architectural Accent */}
                    <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-[#ddff5c]/5 to-transparent pointer-events-none" />
                </section>

                {/* Quick Stats Grid */}
                <div className="lg:col-span-4 grid grid-cols-1 gap-4">
                    <div className="bg-white/[0.03] border border-white/5 p-6 rounded-none group hover:border-[#ddff5c]/30 transition-all">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/30 group-hover:text-[#ddff5c]/60">Portfolio Value</span>
                        <p className="text-2xl font-headline font-black text-white mt-1 uppercase tracking-tighter flex items-center">
                            <CoinIcon size="text-xl" />
                            {formatCurrency(1245000)}
                        </p>
                    </div>
                    <div className="bg-white/[0.03] border border-white/5 p-6 rounded-none group hover:border-[#ddff5c]/30 transition-all">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/30 group-hover:text-[#ddff5c]/60">Active Rewards</span>
                        <p className="text-2xl font-headline font-black text-white mt-1 uppercase tracking-tighter">12 Days</p>
                    </div>
                </div>
            </div>

            {/* Market Dashboard Integration */}
            <div className="flex flex-col gap-6">
                <div className="flex items-end justify-between border-b border-white/5 pb-4">
                    <div>
                        <h2 className="font-headline text-xl font-black uppercase tracking-tighter text-white">
                            Recommended for you
                        </h2>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mt-1">
                            Markets based on your trading history and interests
                        </p>
                    </div>
                    <button 
                        onClick={() => history.push('/markets')}
                        className="text-[10px] font-black uppercase tracking-widest text-[#ddff5c] hover:underline"
                    >
                        View All
                    </button>
                </div>
                
                {/* Reuse the MarketGrid */}
                <MarketGrid category="all" />
            </div>
        </div>
    );
};

export default Dashboard;
