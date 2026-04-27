import React from 'react';
import AccountSectionLayout from '../../components/layouts/profile/AccountSectionLayout';

const PlaceholderPage = ({ title }) => {
    return (
        <AccountSectionLayout>
            <div className="flex items-center mb-8 gap-4 md:gap-6 border-b border-white/5 origin-left">
                <button className="text-[9px] font-black border-b-2 border-[#ddff5c] pb-3 uppercase tracking-[0.3em] text-white underline-offset-8">{title.toUpperCase()}</button>
            </div>
            
            <div className="py-20 text-center bg-[#0e0e0e]/50 border border-white/5">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ddff5c]">System initialization in progress</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-white/20 mt-4 leading-relaxed">
                    This kinetic sub-sector is currently being indexed by the ZuriMarket grid.<br/>
                    Check back soon for active data feeds.
                </p>
            </div>
        </AccountSectionLayout>
    );
};

export default PlaceholderPage;
