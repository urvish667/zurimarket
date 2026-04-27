import React from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { useAuth } from '../../helpers/AuthContent';
import useUserData from '../../hooks/useUserData';
import useUserCredit from '../utils/userFinanceTools/FetchUserCredit';
import { NotificationsSVG, ProfileSVG, CreateSVG } from '../../assets/components/SvgIcons';
import { CoinIcon, formatCurrency } from '../../utils/CurrencyUtils';

const TopNavbar = () => {
    const { username, logout } = useAuth();
    const { userData } = useUserData(null, true);
    const { userCredit } = useUserCredit(username);
    const history = useHistory();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    // Display Name Logic: prioritize Full Name, then DisplayName, then Username
    const userDisplayName = userData?.fullName || userData?.displayname || username;

    return (
        <nav className="sticky top-0 z-50 w-full bg-[#0b0f0e] border-b border-white/5 backdrop-blur-xl bg-opacity-90">
            <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
                {/* Left Side: Logo */}
                <div className="flex-shrink-0">
                    <Link to="/" className="flex items-center">
                        <span className="font-headline text-xl font-black tracking-tighter text-[#ddff5c]">ZURIMARKET</span>
                    </Link>
                </div>
                
                {/* Center: Navigation Options */}
                <div className="hidden md:flex items-center justify-center flex-1 gap-12">
                    <Link 
                        to="/" 
                        className={`font-body text-xs font-black uppercase tracking-[0.2em] transition-all hover:scale-105 ${isActive('/') ? 'text-[#ddff5c]' : 'text-white/40 hover:text-white'}`}
                    >
                        Markets
                    </Link>
                    <Link 
                        to="/challenges" 
                        className={`font-body text-xs font-black uppercase tracking-[0.2em] transition-all hover:scale-105 ${isActive('/challenges') ? 'text-[#ddff5c]' : 'text-white/40 hover:text-white'}`}
                    >
                        Challenges
                    </Link>
                    <Link 
                        to="/activity" 
                        className={`font-body text-xs font-black uppercase tracking-[0.2em] transition-all hover:scale-105 ${isActive('/activity') ? 'text-[#ddff5c]' : 'text-white/40 hover:text-white'}`}
                    >
                        Activity
                    </Link>
                </div>

                {/* Right Side: Auth / User Menu */}
                <div className="flex items-center gap-4">
                    {!username ? (
                        <div className="flex items-center gap-2">
                            <Link 
                                to="/login" 
                                className="px-5 py-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                            >
                                Log In
                            </Link>
                            <Link 
                                to="/register" 
                                className="px-5 py-2 bg-[#ddff5c] text-[#0b0f0e] text-[10px] font-black uppercase tracking-widest rounded-none hover:brightness-110 transition-all"
                            >
                                Sign Up
                            </Link>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            {/* Wallet Display */}
                            <Link 
                                to="/account/wallet"
                                className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/5 hover:border-[#ddff5c]/30 transition-all cursor-pointer group"
                            >
                                <CoinIcon size="text-[10px]" className="text-white/30 group-hover:text-[#ddff5c]" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/30 group-hover:text-[#ddff5c] transition-colors">{userCredit !== null ? formatCurrency(userCredit) : '...'}</span>
                            </Link>

                            {/* Icons and Profile */}
                            <div className="flex items-center gap-1">
                                <button className="p-2 text-white/20 hover:text-[#ddff5c] transition-colors">
                                    <NotificationsSVG className="w-5 h-5" />
                                </button>
                                
                                <div className="relative group">
                                    <button className="flex items-center gap-3 pl-3 pr-1 py-1 hover:bg-white/5 transition-all">
                                        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/60 group-hover:text-white transition-colors">
                                            {userDisplayName}
                                        </span>
                                        <div className="w-8 h-8 bg-[#ddff5c]/10 rounded-none flex items-center justify-center border border-[#ddff5c]/20">
                                            <ProfileSVG className="w-4 h-4 text-[#ddff5c]" />
                                        </div>
                                    </button>
                                    
                                    {/* Dropdown */}
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-[#0b0f0e] border border-white/5 rounded-none shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-2">
                                        <Link to="/portfolio" className="flex items-center px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-[#ddff5c] hover:bg-white/5 transition-all">
                                            My Portfolio
                                        </Link>
                                        <Link to="/account/me" className="flex items-center px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-[#ddff5c] hover:bg-white/5 transition-all">
                                            My Profile
                                        </Link>
                                        <Link to="/stats" className="flex items-center px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-[#ddff5c] hover:bg-white/5 transition-all">
                                            Leaderboard
                                        </Link>
                                        <Link 
                                            to="/create" 
                                            className="flex items-center gap-2 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-[#ddff5c] hover:bg-white/5 transition-all"
                                        >
                                            <CreateSVG className="w-3 h-3" />
                                            <span>Create Market</span>
                                        </Link>
                                        <div className="h-px bg-white/5 my-1 mx-2" />
                                        <button 
                                            onClick={logout}
                                            className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-red-500/40 hover:text-red-500 transition-all"
                                        >
                                            Log out
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default TopNavbar;
