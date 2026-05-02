import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useAuth } from '../../../helpers/AuthContent';

const Sidebar = () => {
    const { logout, username } = useAuth();
    const history = useHistory();
    const location = useLocation();

    const query = new URLSearchParams(location.search);
    const activeTab = query.get('tab') || 'users';

    const menuItems = [
        { id: 'system', label: 'Dashboard', icon: <SystemIcon /> },
        { id: 'users', label: 'User Management', icon: <UsersIcon /> },
        { id: 'markets', label: 'Market Moderation', icon: <MarketsIcon /> },
        { id: 'audit', label: 'Audit Log', icon: <AuditIcon /> },
        { id: 'adduser', label: 'Add Admin/User', icon: <AddUserIcon /> },
        { id: 'economics', label: 'Economic Policy', icon: <EconomicsIcon /> },
        { id: 'challenges', label: 'Challenges', icon: <ChallengesIcon /> },
    ];

    const handleTabChange = (id) => {
        history.push(`/?tab=${id}`);
    };

    return (
        <aside className="w-72 bg-[#0b0f0e] border-r border-white/5 flex flex-col h-screen sticky top-0 overflow-y-auto antialiased">
            {/* Logo Section */}
            <div className="p-8">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#ddff5c] flex items-center justify-center rounded-none rotate-45">
                        <span className="text-[#0b0f0e] font-black text-xl -rotate-45">Z</span>
                    </div>
                    <span className="font-headline text-lg font-black tracking-tighter text-white">
                        ZURI<span className="text-[#ddff5c]">MARKET</span>
                        <div className="text-[10px] text-white/30 tracking-[0.3em] font-black -mt-1 uppercase">Admin</div>
                    </span>
                </div>
            </div>

            {/* Navigation Section */}
            <nav className="flex-grow px-4 mt-4 space-y-2">
                <div className="px-4 mb-4 text-[10px] font-black uppercase tracking-[0.25em] text-white/20">Main Menu</div>
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => handleTabChange(item.id)}
                        className={`w-full flex items-center gap-4 px-4 py-4 transition-all group relative ${
                            activeTab === item.id 
                            ? 'text-[#ddff5c] bg-white/5' 
                            : 'text-white/40 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        {/* Active Indicator */}
                        {activeTab === item.id && (
                            <div className="absolute left-0 w-1 h-8 bg-[#ddff5c] rounded-r-full shadow-[0_0_15px_rgba(221,255,92,0.5)]" />
                        )}
                        
                        <div className={`${activeTab === item.id ? 'text-[#ddff5c]' : 'text-white/20 group-hover:text-white'} transition-colors`}>
                            {item.icon}
                        </div>
                        
                        <span className="text-[11px] font-black uppercase tracking-widest">
                            {item.label}
                        </span>
                    </button>
                ))}
            </nav>

            {/* User/Footer Section */}
            <div className="p-4 mt-auto border-t border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-4 px-4 py-4 mb-2">
                    <div className="w-10 h-10 bg-white/5 border border-white/10 flex items-center justify-center rounded-none overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-br from-[#ddff5c]/20 to-transparent" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white truncate max-w-[120px]">
                            {username}
                        </span>
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#ddff5c]/50">Super Admin</span>
                    </div>
                </div>
                
                <button 
                    onClick={logout}
                    className="w-full flex items-center gap-4 px-4 py-4 text-red-500/40 hover:text-red-500 hover:bg-red-500/5 transition-all group"
                >
                    <LogoutIcon />
                    <span className="text-[11px] font-black uppercase tracking-widest">Logout Session</span>
                </button>
            </div>
        </aside>
    );
};

// --- Custom Premium Icons ---

const SystemIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
    </svg>
);

const UsersIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

const MarketsIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
        <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
        <path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z" />
    </svg>
);

const AuditIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M16 13H8" />
        <path d="M16 17H8" />
        <path d="M10 9H8" />
    </svg>
);

const AddUserIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="19" y1="8" x2="19" y2="14" />
        <line x1="16" y1="11" x2="22" y2="11" />
    </svg>
);

const EconomicsIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
);

const ChallengesIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
        <path d="M4 22h16" />
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22" />
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22" />
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
);

const LogoutIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
);

export default Sidebar;
