import React from 'react';
import AccountSectionLayout from '../../components/layouts/profile/AccountSectionLayout';
import useUserData from '../../hooks/useUserData';
import { useAuth } from '../../helpers/AuthContent';
import { CoinIcon, formatCurrency } from '../../utils/CurrencyUtils';

const WalletPage = () => {
    const { username } = useAuth();
    const { userData, userLoading, userError } = useUserData(null, true);

    if (userLoading) return (
        <AccountSectionLayout>
            <div className="flex items-center justify-center min-h-[40vh]">
                <div className="w-8 h-8 border-2 border-[#ddff5c]/20 border-t-[#ddff5c] animate-spin rounded-none"></div>
            </div>
        </AccountSectionLayout>
    );

    const balance = userData?.accountBalance || 0;
    // Mocking other fields based on the UI requirement
    const unutilised = 0;
    const winnings = 0;
    const coins = 65; // Matches the screenshot

    return (
        <AccountSectionLayout>
            {/* Title Section */}
            <div className="flex items-center mb-8 gap-4 md:gap-6 border-b border-white/5 origin-left">
                <button className="text-[9px] font-black border-b-2 border-[#ddff5c] pb-3 uppercase tracking-[0.3em] text-white">MY WALLET</button>
                <div className="flex-1"></div>
            </div>

            {/* Current Balance Card */}
            <div className="bg-[#131313] border border-[#ddff5c]/20 p-6 md:p-8 rounded-none relative overflow-hidden mb-6">
                <div className="absolute top-0 left-0 w-[2px] h-full bg-[#ddff5c]"></div>
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-[#ddff5c]/10 border border-[#ddff5c]/20">
                            <span className="material-symbols-outlined text-[#ddff5c] text-2xl">account_balance_wallet</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Current Balance</p>
                            <h2 className="text-3xl font-black text-[#ddff5c] tracking-tighter uppercase flex items-center">
                                <CoinIcon size="text-2xl" />
                                {formatCurrency(balance)}
                            </h2>
                        </div>
                    </div>
                    <button className="w-full md:w-auto px-10 py-4 bg-[#ddff5c] text-[#0b0f0e] text-[10px] font-black uppercase tracking-[0.2em] rounded-none hover:brightness-110 transition-all shadow-[0_0_20px_rgba(221,255,92,0.15)]">
                        Add Funds
                    </button>
                </div>
            </div>

            {/* Secondary Balances */}
            <div className="grid grid-cols-1 gap-4 mb-8">
                {/* Unutilised */}
                <div className="bg-[#0e0e0e]/50 border border-white/5 p-6 flex justify-between items-center">
                    <div>
                        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Amount Unutilised</p>
                        <p className="text-sm font-black text-white uppercase tracking-wider flex items-center">
                            <CoinIcon size="text-sm" className="text-white/60" />
                            {formatCurrency(unutilised)}
                        </p>
                    </div>
                    <span className="material-symbols-outlined text-white/10">info</span>
                </div>

                {/* Winnings */}
                <div className="bg-[#0e0e0e]/50 border border-white/5 p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="w-full md:w-auto">
                        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Winnings</p>
                        <p className="text-sm font-black text-white uppercase tracking-wider flex items-center">
                            <CoinIcon size="text-sm" className="text-white/60" />
                            {formatCurrency(winnings)}
                        </p>
                    </div>
                    <button className="w-full md:w-auto px-6 py-2.5 border border-white/20 text-[9px] font-black text-white/60 uppercase tracking-[0.2em] hover:bg-white/5 hover:text-white transition-all">
                        Verify to Withdraw
                    </button>
                </div>

                {/* Coins */}
                <div className="bg-[#0e0e0e]/50 border border-white/5 p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="w-full md:w-auto flex items-center gap-3">
                        <img src="/coin.png" alt="Coin" className="w-5 h-5 object-contain" />
                        <div>
                            <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-0.5">Coins Balance</p>
                            <p className="text-sm font-black text-[#ddff5c] uppercase tracking-wider">{coins}</p>
                        </div>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <button className="flex-1 md:flex-none px-6 py-2.5 border border-white/20 text-[9px] font-black text-white/60 uppercase tracking-[0.2em] hover:bg-white/5 hover:text-white transition-all">
                            Redeem
                        </button>
                        <button className="flex-1 md:flex-none px-6 py-2.5 border border-white/20 text-[9px] font-black text-white/60 uppercase tracking-[0.2em] hover:bg-white/5 hover:text-white transition-all">
                            Buy
                        </button>
                    </div>
                </div>
            </div>

            {/* List Actions */}
            <div className="space-y-4">
                {[
                    { id: 'transactions', label: 'My Transactions', desc: 'Review last 6 months transactions', icon: 'history' },
                    { id: 'withdraw', label: 'Withdraw Money', desc: 'Verify your account first', icon: 'payments' },
                    { id: 'kyc', label: 'My KYC Details', desc: 'View Mobile, Email, Bank', icon: 'badge' },
                    { id: 'earn', label: 'Earn Coins', desc: 'Play and Earn Coins', icon: 'stars' },
                ].map((item) => (
                    <button key={item.id} className="w-full bg-[#0e0e0e]/50 border border-white/5 p-6 flex items-center justify-between group hover:bg-[#131313] hover:border-white/10 transition-all text-left">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-white/5 group-hover:bg-[#ddff5c]/10 transition-all">
                                <span className="material-symbols-outlined text-white/40 group-hover:text-[#ddff5c] transition-all">{item.icon}</span>
                            </div>
                            <div>
                                <p className="text-[11px] font-black text-white uppercase tracking-widest">{item.label}</p>
                                <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.15em] mt-1 group-hover:text-white/40 transition-all">{item.desc}</p>
                            </div>
                        </div>
                        <span className="material-symbols-outlined text-white/10 group-hover:text-[#ddff5c] group-hover:translate-x-1 transition-all">chevron_right</span>
                    </button>
                ))}
            </div>
        </AccountSectionLayout>
    );
};

export default WalletPage;
