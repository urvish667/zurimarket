import React from 'react';
import { Link } from 'react-router-dom';

const AuthLayout = ({ children }) => {
    return (
        <div className="bg-[#0b0f0e] text-[#fafdfa] min-h-screen flex flex-col font-body">
            {/* Header / Logo */}
            <header className="p-8">
                <Link to="/" className="inline-block">
                    <span className="font-headline text-2xl font-black tracking-tighter text-[#ddff5c]">ZURIMARKET</span>
                </Link>
            </header>

            <main className="flex-grow flex items-center justify-center px-6 pb-20 relative">
                {/* Minimal Background Decor */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#ddff5c]/5 rounded-full blur-[120px] pointer-events-none"></div>
                
                <div className="w-full max-w-md z-10">
                    {children}
                </div>
            </main>
            
            <footer className="w-full py-8 border-t border-white/5 opacity-50">
                <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-widest font-bold">
                    <p>© 2024 ZuriMarket. All Rights Reserved.</p>
                    <div className="flex gap-6">
                        <Link to="#" className="hover:text-[#ddff5c] transition-colors">Terms</Link>
                        <Link to="#" className="hover:text-[#ddff5c] transition-colors">Privacy</Link>
                        <Link to="#" className="hover:text-[#ddff5c] transition-colors">Support</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default AuthLayout;
