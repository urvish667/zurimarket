import React from 'react';
import { Link } from 'react-router-dom';

const AuthLayout = ({ children }) => {
    return (
        <div className="bg-surface text-on-surface min-h-screen flex flex-col font-body">
            <main className="flex-grow flex items-center justify-center px-6 py-12 lg:py-20 relative overflow-hidden">
                {/* Background Architectural Elements */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none"></div>
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary-container/10 rounded-full blur-[120px] pointer-events-none"></div>
                
                <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    {/* Left Side: Editorial Content */}
                    <div className="lg:col-span-6 space-y-8">
                        <div className="inline-block">
                            <span className="font-headline text-2xl font-bold tracking-tighter text-primary">Stadia Emerald</span>
                        </div>
                        <h1 className="font-headline text-5xl md:text-7xl font-bold leading-[0.9] tracking-tighter text-on-surface">
                            PRECISION <br />
                            <span className="text-primary-dim">PREDICTION</span> <br />
                            MARKETS.
                        </h1>
                        <p className="font-body text-lg text-on-surface-variant max-w-md leading-relaxed">
                            Join the elite architect of data-driven foresight. Access high-performance markets with
                            institutional-grade accuracy.
                        </p>
                        <div className="flex flex-col gap-6 pt-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded bg-surface-container-highest flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined">analytics</span>
                                </div>
                                <div>
                                    <p className="font-headline font-bold text-on-surface">Real-time Probabilities</p>
                                    <p className="font-body text-sm text-on-surface-variant">Live data feeds from global high-performance sources.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded bg-surface-container-highest flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined">shield</span>
                                </div>
                                <div>
                                    <p className="font-headline font-bold text-on-surface">Secure Infrastructure</p>
                                    <p className="font-body text-sm text-on-surface-variant">Encrypted transactional logic for absolute precision.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Right Side: Form Container */}
                    <div className="lg:col-span-6 flex justify-center lg:justify-end z-10">
                        {children}
                    </div>
                </div>
            </main>
            
            <footer className="w-full py-12 bg-surface-container-low border-t border-outline-variant/10 z-10">
                <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex flex-col gap-2">
                        <span className="font-headline font-bold text-primary">Stadia Emerald</span>
                        <p className="font-body text-xs text-on-surface-variant">© 2024 Stadia Emerald. Precision Prediction Markets.</p>
                    </div>
                    <div className="flex gap-8 cursor-pointer">
                        <span className="font-body text-xs text-on-surface-variant hover:text-white transition-colors">Terms</span>
                        <span className="font-body text-xs text-on-surface-variant hover:text-white transition-colors">Privacy</span>
                        <span className="font-body text-xs text-on-surface-variant hover:text-white transition-colors">Docs</span>
                        <span className="font-body text-xs text-on-surface-variant hover:text-white transition-colors">Support</span>
                    </div>
                </div>
            </footer>

            {/* Purely decorative image for background context */}
            <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none opacity-20">
                <img 
                    className="w-full h-full object-cover"
                    alt="Dark abstract architectural perspective with glowing green neon lines"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGyvnEiFhs2rHByFBzGtHAKQjSjnaULxyH_PhOCsBQ-bzCj0NwueOvfolICnj_NvZccvcns9iJtSauCKXxDP6qy5Ol4ynvbZ814Lbk5DK4AXZeOzgC-GZ3aZcNx12fkvcq77guSS9LC5zxVtNidTSpEpTRpohUW1uD8hT3_0v6sOY3o9OJifKb4-KG3rKwCKXBFj0lwbNnHByf8Sl-LQSKM1R_EJ0RkcxdRdVmcWt2SWZp9nG_8npk_fz_K1ZeK45K66tHjzbWxw" 
                />
            </div>
        </div>
    );
};

export default AuthLayout;
