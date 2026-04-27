import React from 'react';
import { useLocation, Link, useHistory } from 'react-router-dom';
import { useAuth } from '../../../helpers/AuthContent';

const AccountSectionLayout = ({ children }) => {
    const { logout } = useAuth();
    const location = useLocation();
    const history = useHistory();

    const menuItems = [
        { id: 'me', label: 'My Profile', icon: 'person', path: '/account/me' },
        { id: 'wallet', label: 'My Wallet', icon: 'account_balance_wallet', path: '/account/wallet' },
        { id: 'earn', label: 'Earn Coins', icon: 'payments', path: '/account/earn' },
        { id: 'xp', label: 'XP Points', icon: 'stars', path: '/account/xp' },
        { id: 'security', label: 'Change Password', icon: 'lock_reset', path: '/account/security' },
    ];

    const activeItem = menuItems.find(item => location.pathname === item.path) || menuItems[0];

    return (
        <div className="min-h-screen bg-transparent flex flex-col md:flex-row font-satoshi pb-20">
            {/* Navigation - Responsive Sidebar */}
            <div className="w-full md:w-56 flex flex-col pt-0 md:pt-8 shrink-0 border-b md:border-b-0 md:border-r border-white/5 bg-[#0b0f0e] md:bg-transparent sticky top-0 z-40 md:static">
                <nav className="flex md:flex-col px-4 space-x-2 md:space-x-0 md:space-y-1 overflow-x-auto md:overflow-visible no-scrollbar pb-4 md:pb-0">
                    {menuItems.map((item) => (
                        <Link
                            key={item.id}
                            to={item.path}
                            className={`flex items-center px-4 py-3 text-[9px] font-black uppercase tracking-[0.2em] rounded-none transition-all whitespace-nowrap min-w-fit ${location.pathname === item.path
                                ? 'bg-[#ddff5c] text-[#0b0f0e]'
                                : 'text-white/40 hover:text-white/80 hover:bg-white/5'
                                }`}
                        >
                            <span className="material-symbols-outlined mr-3 text-base text-inherit">{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                    <div className="hidden md:block h-[1px] bg-white/5 my-4 mx-2"></div>
                    <button 
                        onClick={logout}
                        className="hidden md:flex items-center px-4 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-[#ff4d4f]/60 hover:text-[#ff4d4f] hover:bg-[#ff4d4f]/5 rounded-none transition-all whitespace-nowrap"
                    >
                        <span className="material-symbols-outlined mr-3 text-base">delete_forever</span>
                        Logout
                    </button>
                </nav>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 px-4 md:px-10 pt-6 md:pt-8">
                <div className="max-w-[1000px] mx-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AccountSectionLayout;
