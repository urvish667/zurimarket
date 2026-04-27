import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../helpers/AuthContent'
import useUserCredit from '../utils/userFinanceTools/FetchUserCredit';
import LoginModalButton from '../modals/login/LoginModalClick';
import {
  AboutSVG,
  AdminGearSVG,
  CoinsSVG,
  HomeSVG,
  LockPasswordSVG,
  LogoutSVG,
  MarketsSVG,
  MenuGrowSVG,
  MenuShrinkSVG,
  NotificationsSVG,
  PollsSVG,
  ProfileSVG,
  CreateSVG,
  StatsSVG,
} from '../../assets/components/SvgIcons';

const SidebarLink = ({ to, icon: Icon, children, onClick }) => (
  <li>
    <Link
      to={to}
      className='flex items-center px-4 py-2.5 text-on-surface-variant rounded-xl hover:bg-surface-container-highest hover:text-primary group transition-all duration-200'
      onClick={onClick}
    >
      <Icon className='w-5 h-5 text-inherit transition-colors duration-200' />
      <span className='ml-3 text-sm font-medium'>{children}</span>
    </Link>
  </li>
);

const SidebarGroup = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="px-4 mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-outline">
      {title}
    </h3>
    <ul className="space-y-1">
      {children}
    </ul>
  </div>
);

const Sidebar = () => {
  const { isLoggedIn, usertype, logout, changePasswordNeeded, username } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      const sidebarEl = document.getElementById('sidebar');
      if (sidebarEl && !sidebarEl.contains(event.target) && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isSidebarOpen]);

  const handleLogoutClick = () => {
    logout();
    setIsSidebarOpen(false);
  };

  const renderLinks = () => {
    if (!isLoggedIn) {
      return (
        <>
          <SidebarGroup title="Main">
            <SidebarLink to='/' icon={HomeSVG}>Home</SidebarLink>
            <SidebarLink to='/markets' icon={MarketsSVG}>Markets</SidebarLink>
          </SidebarGroup>
          <SidebarGroup title="Platform">
            <SidebarLink to='/polls' icon={PollsSVG}>Polls</SidebarLink>
            <SidebarLink to='/about' icon={AboutSVG}>About</SidebarLink>
            <SidebarLink to='/stats' icon={StatsSVG}>Stats</SidebarLink>
          </SidebarGroup>
          <div className="px-4 mt-4">
            <LoginModalButton />
          </div>
        </>
      );
    }

    if (usertype === 'ADMIN') {
      return (
        <>
          <SidebarGroup title="Admin">
            <SidebarLink to='/admin' icon={AdminGearSVG}>Dashboard</SidebarLink>
            <SidebarLink to='/markets' icon={MarketsSVG}>Manage Markets</SidebarLink>
          </SidebarGroup>
          <SidebarGroup title="System">
            <SidebarLink to='/stats' icon={StatsSVG}>Platform Stats</SidebarLink>
            <SidebarLink to='/about' icon={AboutSVG}>About</SidebarLink>
          </SidebarGroup>
        </>
      );
    }

    if (changePasswordNeeded) {
      return (
        <SidebarGroup title="Account Security">
          <SidebarLink to='/changepassword' icon={LockPasswordSVG}>Change Password</SidebarLink>
          <SidebarLink to='/' icon={LogoutSVG} onClick={handleLogoutClick}>Logout</SidebarLink>
        </SidebarGroup>
      );
    }

    return (
      <>
        <SidebarGroup title="Main">
          <SidebarLink to='/' icon={HomeSVG}>Dashboard</SidebarLink>
          <SidebarLink to='/markets' icon={MarketsSVG}>Explore Markets</SidebarLink>
        </SidebarGroup>

        <SidebarGroup title="Your Activity">
          <SidebarLink to='/account/me' icon={ProfileSVG}>My Profile</SidebarLink>
          <SidebarLink to='/notifications' icon={NotificationsSVG}>Watchlist</SidebarLink>
        </SidebarGroup>

        <SidebarGroup title="Social">
          <SidebarLink to='/stats' icon={StatsSVG}>Leaderboard</SidebarLink>
          <SidebarLink to='/about' icon={AboutSVG}>Referrals</SidebarLink>
        </SidebarGroup>

        <SidebarGroup title="Support">
          <SidebarLink to='/about' icon={AboutSVG}>Help & Info</SidebarLink>
        </SidebarGroup>
      </>
    );
  };

  return (
    <>
      <aside
        id='sidebar'
        className={`fixed top-0 left-0 z-30 w-64 h-full bg-[#0b0f0e] border-r border-white/5 flex flex-col transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0`}
      >
        <div className='flex items-center justify-between p-4 md:hidden border-b border-white/5'>
          <span className="text-sm font-black tracking-tighter text-[#ddff5c]">ZURIMARKET</span>
          <button onClick={toggleSidebar}>
            <MenuShrinkSVG className='w-5 h-5 text-white' />
          </button>
        </div>
        <nav className='flex-grow overflow-y-auto px-2 py-6 no-scrollbar'>
          {renderLinks()}
        </nav>
        <footer className='p-4 border-t border-white/5'>
          <div className="p-4 bg-white/[0.03] rounded-none border border-white/5">
            <p className='text-[10px] text-white/30 font-black uppercase tracking-widest leading-relaxed'>
              Predict market outcomes and earn rewards on the ZuriMarket kinetic ledger.
            </p>
          </div>
        </footer>
      </aside>
      
      {/* Mobile Menu Button (Floating or Bottom Bar) */}
      {!isSidebarOpen && (
        <div className='fixed bottom-0 left-0 right-0 z-50 bg-[#0b0f0e]/80 backdrop-blur-lg border-t border-white/5 flex justify-around items-center p-3 md:hidden'>
          <Link to='/' className='text-white/40 hover:text-[#ddff5c] transition-colors'>
            <HomeSVG className='w-6 h-6' />
          </Link>
          <Link to='/markets' className='text-white/40 hover:text-[#ddff5c] transition-colors'>
            <MarketsSVG className='w-6 h-6' />
          </Link>
          <Link to='/create' className='p-3 bg-[#ddff5c] text-[#0b0f0e] rounded-none -mt-8 shadow-2xl transition-transform active:scale-90'>
            <CreateSVG className='w-6 h-6' />
          </Link>
          <Link to='/account/me' className='text-white/40 hover:text-[#ddff5c] transition-colors'>
            <ProfileSVG className='w-6 h-6' />
          </Link>
          <button onClick={toggleSidebar} className='text-white/40 hover:text-[#ddff5c] transition-colors'>
            <MenuGrowSVG className='w-6 h-6' />
          </button>
        </div>
      )}
    </>
  );
};

export default Sidebar;
