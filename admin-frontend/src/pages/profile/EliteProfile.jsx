import React, { useState } from 'react';
import { useAuth } from '../../helpers/AuthContent';
import useUserData from '../../hooks/useUserData';
import LoadingSpinner from '../../components/loaders/LoadingSpinner';

const EliteProfile = () => {
    const { username } = useAuth();
    const { userData, userLoading, userError } = useUserData(username, true);

    if (userLoading) return <LoadingSpinner />;
    if (userError) return <div className="p-8 text-red-500">Error loading profile data.</div>;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount / 100);
    };

    const copyReferralLink = () => {
        const link = `${window.location.origin}/register?ref=${userData?.referralCode}`;
        navigator.clipboard.writeText(link);
        alert('Referral link copied to clipboard!');
    };

    return (
        <div className="min-h-screen bg-[#0e0e0e] text-white font-body antialiased pb-20">
            <main className="max-w-[1440px] mx-auto px-6 pt-6 sm:pt-8 space-y-8 sm:space-y-10">
                
                {/* User Header Section */}
                <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div className="flex items-center gap-5 sm:gap-6">
                        <div className="relative">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-sm overflow-hidden border-2 border-[#b9f600] p-1 bg-[#131313]">
                                <div className="w-full h-full flex items-center justify-center text-3xl sm:text-4xl bg-[#191a1a]">
                                    {userData?.personalEmoji || '👤'}
                                </div>
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-[#262626] px-2 py-0.5 flex items-center gap-1 rounded-sm border border-[#484848]/15">
                                <span className="material-symbols-outlined text-[#d7ff81] text-base" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                                <span className="text-xs font-bold font-headline">{userData?.currentStreak || 0}</span>
                            </div>
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-0.5 uppercase font-headline">
                                {userData?.displayname || userData?.username}
                            </h1>
                            <p className="text-[#adaaaa] text-sm tracking-widest uppercase">@{userData?.username}</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-3 w-full md:w-auto">
                        <button className="flex-1 md:flex-none px-4 py-2 bg-[#1f2020] text-[#d7ff81] font-headline text-xs uppercase tracking-wider hover:bg-[#262626] transition-all duration-200 border border-[#484848]/15">
                            Edit Profile
                        </button>
                        <button className="flex-1 md:flex-none px-6 py-2 bg-gradient-to-br from-[#d7ff81] to-[#b9f600] text-[#486200] font-bold font-headline text-xs uppercase tracking-wider hover:brightness-110 transition-all active:scale-95 shadow-lg shadow-[#b9f600]/10">
                            Deposit Credits
                        </button>
                    </div>
                </section>

                {/* Personal Information & Profile Settings */}
                <section className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 bg-[#131313] p-5 sm:p-8 flex flex-col justify-between rounded-sm">
                        <h3 className="text-base font-bold font-headline uppercase tracking-widest mb-6">Personal Details</h3>
                        <div className="space-y-6 max-w-2xl">
                            <div>
                                <span className="text-[10px] uppercase tracking-[0.2em] text-[#adaaaa] mb-2 block font-medium">Display Name</span>
                                <p className="text-xl sm:text-2xl font-bold font-headline">{userData?.displayname || userData?.username}</p>
                            </div>
                            <div>
                                <span className="text-[10px] uppercase tracking-[0.2em] text-[#adaaaa] mb-2 block font-medium">Username</span>
                                <p className="text-lg font-bold font-headline">@{userData?.username}</p>
                            </div>
                            <div>
                                <span className="text-[10px] uppercase tracking-[0.2em] text-[#adaaaa] mb-2 block font-medium">Email Address</span>
                                <p className="text-lg font-bold font-headline">{userData?.email || 'Not provided'}</p>
                            </div>
                            <div>
                                <span className="text-[10px] uppercase tracking-[0.2em] text-[#adaaaa] mb-2 block font-medium">Account Status</span>
                                <p className="text-sm font-bold font-headline text-[#d7ff81]">Active</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Referral Hub & Active Activity */}
                <section className="grid grid-cols-12 gap-4">
                    {/* Referral Hub */}
                    <div className="col-span-12 lg:col-span-4 bg-[#131313] p-6 border-l-4 border-[#d7ff81] rounded-sm">
                        <h3 className="text-base font-bold font-headline uppercase tracking-widest mb-4">Referral Network</h3>
                        <div className="space-y-4">
                            <div>
                                <span className="text-[9px] uppercase tracking-widest text-[#adaaaa] mb-1.5 block">Personal Invite Code</span>
                                <div className="flex group">
                                    <div className="flex-1 bg-[#262626] px-3 py-2 text-xs font-mono tracking-wider text-[#d7ff81] border border-[#484848]/10 group-hover:border-[#d7ff81]/30 transition-all">
                                        {userData?.referralCode || 'GENERATING...'}
                                    </div>
                                    <button 
                                        onClick={copyReferralLink}
                                        className="bg-[#b9f600] px-3 text-[#486200] hover:bg-[#d7ff81] transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-sm font-bold">content_copy</span>
                                    </button>
                                </div>
                            </div>
                            <div className="pt-2">
                                <div className="flex justify-between items-end mb-1">
                                    <span className="text-[9px] uppercase tracking-widest text-[#adaaaa]">Network Size</span>
                                    <span className="text-base font-bold font-headline">{userData?.referralsCount || 0}</span>
                                </div>
                                <div className="w-full h-1 bg-[#262626]">
                                    <div className="h-full bg-[#b4f000]" style={{ width: `${Math.min((userData?.referralsCount || 0) * 10, 100)}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default EliteProfile;
