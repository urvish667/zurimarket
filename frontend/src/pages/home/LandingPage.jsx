import React from 'react';
import { useHistory } from 'react-router-dom';
import LandingTicker from '../../components/markets/LandingTicker';
import PlatformStats from '../../components/stats/PlatformStats';

const LandingPage = () => {
    const history = useHistory();

    return (
        <div className="bg-background text-on-background selection:bg-secondary-fixed selection:text-on-secondary font-body min-h-screen">
            {/* TopAppBar */}
            <nav className="flex justify-between items-center w-full px-8 py-4 sticky top-0 z-50 bg-[#0e1514]">
                <div className="flex-shrink-0">
                    <span className="text-xl font-black tracking-tighter text-[#b9f600] font-logo">SOCIAL PREDICT</span>
                </div>
                <div className="hidden md:flex gap-8 items-center absolute left-1/2 transform -translate-x-1/2">
                    <a className="text-[#b9f600] border-b-2 border-[#b9f600] pb-1 font-bold text-sm" href="#">Markets</a>
                    <a className="text-[#94d3c1] font-medium text-sm hover:text-[#b9f600] transition-colors duration-200" href="#">Challenges</a>
                    <a className="text-[#94d3c1] font-medium text-sm hover:text-[#b9f600] transition-colors duration-200" href="#">Live Rewards</a>
                </div>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => history.push('/login')}
                        className="px-5 py-2 text-[#94d3c1] text-sm font-bold hover:text-[#b9f600] transition-all duration-150 ease-in-out scale-95 active:scale-90">
                        Login
                    </button>
                    <button 
                        onClick={() => history.push('/register')} 
                        className="px-6 py-2 bg-[#b9f600] text-[#141f00] text-sm font-bold rounded-xl hover:shadow-[0_0_20px_rgba(185,246,0,0.3)] transition-all duration-150 ease-in-out active:scale-95">
                        Sign Up
                    </button>
                </div>
            </nav>
            
            <LandingTicker />

            <main>
                {/* Hero Section */}
                <section className="relative min-h-[600px] flex items-center px-8 overflow-hidden bg-surface-container-lowest">
                    <div className="absolute inset-0 z-0 opacity-40">
                        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent z-10"></div>
                        <img className="w-full h-full object-cover" data-alt="Abstract glowing digital data and financial chart lines" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBV4LUKr1EdhspPxXtX0QbNS8wB6PSvK6JiXxjXxzyswyQhdDQXAJmzav61ypLUXX6zFsv6IFo6G8t_-D_N33Mb2zkLVZaNTS5eCDAI7ogCdWHdXVIMU-F3_T9UAgbg7WoyuhDDrBXU6yPEwcqtElJ_VtAY0gxHBy97D6OxYXHRUYsYxLphnhdYbQP77twfiby0mU3st8o-ZZZkBpB7jM4GdCTSaJXkHHYUgpq86jhqT9a7RcGvDfOuUGxxb8MFw0Lkhh_7C9eD_g" />
                    </div>
                    <div className="relative z-10 max-w-4xl">
                        <h1 className="font-headline text-6xl md:text-8xl font-black text-secondary leading-tight tracking-tighter mb-6">
                            Predict Everything.<br />
                            <span className="text-secondary-fixed">Earn Real Money.</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-on-surface-variant max-w-2xl mb-10 leading-relaxed">
                            The world's most accurate kinetic ledger. Forecast anything from global elections and stock pivots to championship finals and red carpet sweeps.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <button onClick={() => history.push('/login')} className="px-10 py-4 bg-secondary-fixed text-on-secondary text-lg font-bold rounded-xl hover:scale-105 transition-transform">Explore All Markets</button>
                            <button className="px-10 py-4 border border-outline-variant text-primary text-lg font-bold rounded-xl hover:bg-surface-container-high transition-colors">How it works</button>
                        </div>
                    </div>
                </section>
                
                <PlatformStats />

                {/* Market Categories / Bento Section */}
                <section className="py-24 px-8 bg-surface">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="font-headline text-4xl font-bold text-primary mb-2">Live Real-World Markets</h2>
                            <p className="text-on-surface-variant">Real-time sentiment from the Kinetic Ledger.</p>
                        </div>
                        <div className="flex gap-2 hidden md:flex">
                            <span className="px-4 py-1 rounded-full bg-surface-container-high text-on-surface text-sm font-medium">Politics</span>
                            <span className="px-4 py-1 rounded-full bg-surface-container-high text-on-surface text-sm font-medium">Crypto</span>
                            <span className="px-4 py-1 rounded-full bg-surface-container-high text-on-surface text-sm font-medium">Economics</span>
                            <span className="px-4 py-1 rounded-full bg-surface-container-high text-on-surface text-sm font-medium">Entertainment</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        {/* Large Featured Market */}
                        <div className="md:col-span-8 bg-surface-container-low rounded-xl p-8 relative overflow-hidden group">
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="material-symbols-outlined text-tertiary text-sm">trending_up</span>
                                    <span className="text-tertiary text-sm font-bold tracking-widest uppercase">Hot Market</span>
                                </div>
                                <h3 className="font-headline text-3xl font-bold text-secondary mb-8 max-w-lg">Will Bitcoin reach a new all-time high ($100k+) by December 31st, 2024?</h3>
                                <div className="mt-auto grid grid-cols-2 gap-4">
                                    <button className="flex flex-col items-center justify-center p-6 bg-surface-container-high rounded-xl hover:bg-primary-container transition-colors group/btn">
                                        <span className="text-on-surface-variant text-xs mb-1 group-hover/btn:text-primary">YES</span>
                                        <span className="text-2xl font-bold text-secondary">64¢</span>
                                    </button>
                                    <button className="flex flex-col items-center justify-center p-6 bg-surface-container-high rounded-xl hover:bg-error-container/20 transition-colors group/btn">
                                        <span className="text-on-surface-variant text-xs mb-1 group-hover/btn:text-error">NO</span>
                                        <span className="text-2xl font-bold text-secondary">36¢</span>
                                    </button>
                                </div>
                            </div>
                            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-1/4 translate-y-1/4">
                                <span className="material-symbols-outlined text-[300px]" style={{ fontVariationSettings: "'FILL' 1" }}>currency_bitcoin</span>
                            </div>
                        </div>
                        {/* Secondary Market */}
                        <div className="md:col-span-4 bg-surface-container-low rounded-xl p-6 flex flex-col">
                            <div className="mb-4">
                                <span className="px-2 py-0.5 bg-on-tertiary-fixed-variant text-tertiary rounded text-[10px] font-bold">ECONOMICS</span>
                            </div>
                            <h3 className="font-headline text-xl font-bold text-secondary mb-4 leading-snug">Will the Federal Reserve cut interest rates in their next meeting?</h3>
                            <div className="space-y-3 mt-auto">
                                <div className="flex justify-between items-center p-4 bg-surface-container-lowest rounded-lg border border-outline-variant/10">
                                    <span className="font-bold text-on-surface">Yes</span>
                                    <span className="text-secondary-fixed font-black">78% Chance</span>
                                </div>
                                <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                                    <div className="h-full bg-tertiary w-[78%]"></div>
                                </div>
                            </div>
                        </div>
                        {/* Smaller Grid Items */}
                        <div className="md:col-span-4 bg-surface-container-low rounded-xl p-6">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="material-symbols-outlined text-primary text-lg">movie</span>
                                <span className="text-on-surface-variant text-xs font-bold">AWARDS</span>
                            </div>
                            <h4 className="font-headline text-lg font-bold text-secondary mb-6">Who will win Best Picture at the next major ceremony?</h4>
                            <div className="space-y-2">
                                <button className="w-full flex justify-between px-4 py-2 bg-surface-container-high rounded hover:bg-surface-container-highest transition-colors">
                                    <span>Oppenheimer 2</span><span className="font-bold text-primary">12¢</span>
                                </button>
                                <button className="w-full flex justify-between px-4 py-2 bg-surface-container-high rounded hover:bg-surface-container-highest transition-colors">
                                    <span>The Kinetic Ledger</span><span className="font-bold text-primary">45¢</span>
                                </button>
                            </div>
                        </div>
                        <div className="md:col-span-4 bg-surface-container-low rounded-xl p-6">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="material-symbols-outlined text-primary text-lg">sports_soccer</span>
                                <span className="text-on-surface-variant text-xs font-bold">SPORTS</span>
                            </div>
                            <h4 className="font-headline text-lg font-bold text-secondary mb-4">Champions League: Real Madrid vs. Manchester City</h4>
                            <div className="flex gap-2">
                                <button className="flex-1 py-3 bg-surface-container-high rounded font-bold text-sm hover:ring-1 ring-secondary-fixed">RMA (2.45)</button>
                                <button className="flex-1 py-3 bg-surface-container-high rounded font-bold text-sm hover:ring-1 ring-secondary-fixed">DRAW (3.10)</button>
                                <button className="flex-1 py-3 bg-surface-container-high rounded font-bold text-sm hover:ring-1 ring-secondary-fixed">MCI (1.85)</button>
                            </div>
                        </div>
                        <div className="md:col-span-4 bg-surface-container-low rounded-xl p-6 border-2 border-primary-container relative">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-primary text-xs font-black tracking-widest uppercase">My Active Bets</span>
                                <span className="w-2 h-2 rounded-full bg-secondary-fixed animate-pulse"></span>
                            </div>
                            <div className="space-y-4 filter blur-[2px] opacity-70">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] text-on-surface-variant uppercase tracking-tighter">Please Login</span>
                                    <div className="flex justify-between font-bold">
                                        <span>Candidate A Win</span>
                                        <span className="text-tertiary">+$420.00</span>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className="text-sm font-bold text-on-surface bg-surface-container/90 px-3 py-1 rounded badge backdrop-blur z-20">Log in to view</span>
                            </div>
                        </div>
                    </div>
                </section>
                {/* How It Works */}
                <section className="py-24 px-8 bg-surface-container-lowest">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="font-headline text-5xl font-bold text-secondary mb-4">Master The Ledger</h2>
                            <p className="text-on-surface-variant text-lg">Four steps to turn your intuition into capital.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 mx-auto bg-surface-container-high rounded-full flex items-center justify-center border border-primary/20">
                                    <span className="material-symbols-outlined text-primary text-3xl">account_balance_wallet</span>
                                </div>
                                <h3 className="font-headline text-xl font-bold">1. Fund Wallet</h3>
                                <p className="text-sm text-on-surface-variant leading-relaxed">Securely deposit funds into your kinetic account via crypto or xfiat.</p>
                            </div>
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 mx-auto bg-surface-container-high rounded-full flex items-center justify-center border border-primary/20">
                                    <span className="material-symbols-outlined text-primary text-3xl">query_stats</span>
                                </div>
                                <h3 className="font-headline text-xl font-bold">2. Analyze Events</h3>
                                <p className="text-sm text-on-surface-variant leading-relaxed">Browse thousands of global markets across sports, tech, and geopolitics.</p>
                            </div>
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 mx-auto bg-secondary-fixed rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(185,246,0,0.2)]">
                                    <span className="material-symbols-outlined text-on-secondary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>gavel</span>
                                </div>
                                <h3 className="font-headline text-xl font-bold">3. Predict & Trade</h3>
                                <p className="text-sm text-on-surface-variant leading-relaxed">Buy shares in an outcome. If you're right, your shares settle at $1.00.</p>
                            </div>
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 mx-auto bg-surface-container-high rounded-full flex items-center justify-center border border-primary/20">
                                    <span className="material-symbols-outlined text-primary text-3xl">payments</span>
                                </div>
                                <h3 className="font-headline text-xl font-bold">4. Instant Payout</h3>
                                <p className="text-sm text-on-surface-variant leading-relaxed">Collect your earnings instantly upon event resolution.</p>
                            </div>
                        </div>
                    </div>
                </section>
                {/* Success Stories */}
                <section className="py-24 px-8 bg-surface overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
                        <div>
                            <h2 className="font-headline text-5xl font-bold text-secondary mb-8 leading-tight">Where Intuition Meets <span className="text-tertiary">Probability</span></h2>
                            <div className="space-y-8">
                                <div className="flex gap-6 items-start">
                                    <div className="w-12 h-12 rounded-lg bg-surface-container-high flex-shrink-0 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-tertiary">public</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-secondary mb-1">The Geopolitical Strategist</h4>
                                        <p className="text-on-surface-variant text-sm italic leading-relaxed">"I predicted the UK interest rate hold three weeks before the market reacted. SocialPredict allowed me to turn that macro research into a $12k gain." — Marcus G.</p>
                                    </div>
                                </div>
                                <div className="flex gap-6 items-start">
                                    <div className="w-12 h-12 rounded-lg bg-surface-container-high flex-shrink-0 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-tertiary">sports_basketball</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-secondary mb-1">The Courtside Analyst</h4>
                                        <p className="text-on-surface-variant text-sm italic leading-relaxed">"Live betting is seamless. Caught the underdog rally in the 4th quarter and doubled my position in seconds." — Elena R.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="aspect-square bg-surface-container-low rounded-3xl overflow-hidden shadow-2xl">
                                <img className="w-full h-full object-cover grayscale opacity-50" data-alt="Modern high-tech workspace with multiple glowing screens showing financial charts" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8MBO-zEVLtdn2D0OFCHG7HyddAfp1X7KIGVRfvaJMiFME6hV77MX4sqXgRXgpCHVFWjAsvzS-3YDyQjgTl9RcRLxC_33O0kBkdNyBPQOFMqi5EfbpXsd4bw1fM-qoMjfLvz9sE8hqBMxWFYyd9qeFtvezDwZEvGJ20rnQn_az5Z4GGEJ-MG4sY9vAqV8cs2Rr2OJchbeeJkCfNXoLPafpW8PdM3VL2J58XInDwwSWUgdSM44AWIP-ribHLmY4qEaIA6p9JvxYQQ" />
                                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
                                <div className="absolute bottom-8 left-8 right-8 p-6 bg-surface-container/80 backdrop-blur-xl rounded-xl border border-outline-variant/20">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-xs font-black text-primary tracking-widest">LIVE WINNER</span>
                                        <span className="text-xs text-on-surface-variant">2 mins ago</span>
                                    </div>
                                    <p className="font-headline font-bold text-lg text-secondary mb-1">User @Kinetix_99</p>
                                    <p className="text-on-surface-variant text-sm mb-4">Won $4,290 on "Will AI regulation pass EU parliament this Q3?"</p>
                                    <div className="flex items-center gap-1 text-secondary-fixed">
                                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                                        <span className="text-xs font-bold">Top 1% Predictor</span>
                                    </div>
                                </div>
                            </div>
                            {/* Kinetic Glow Element */}
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-tertiary/10 blur-[80px] rounded-full"></div>
                            <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-primary/5 blur-[100px] rounded-full"></div>
                        </div>
                    </div>
                </section>
                {/* CTA Section */}
                <section className="py-24 px-8">
                    <div className="max-w-5xl mx-auto bg-surface-container-high rounded-[2rem] p-12 md:p-20 text-center relative overflow-hidden">
                        <div className="relative z-10">
                            <h2 className="font-headline text-5xl md:text-6xl font-bold text-secondary mb-6 leading-tight">Ready to join the<br />Kinetic Ledger?</h2>
                            <p className="text-on-surface-variant text-lg md:text-xl max-w-2xl mx-auto mb-10">Get a $50 deposit bonus when you verify your account today. The world is moving. Start predicting.</p>
                            <div className="flex flex-col md:flex-row gap-4 justify-center">
                                <button onClick={() => history.push('/register')} className="px-12 py-5 bg-secondary-fixed text-on-secondary text-xl font-bold rounded-xl hover:scale-105 transition-transform shadow-[0_20px_40px_rgba(185,246,0,0.15)]">Get Started Now</button>
                            </div>
                        </div>
                        {/* Abstract Texture */}
                        <div className="absolute inset-0 pointer-events-none opacity-5">
                            <svg height="100%" preserveAspectRatio="none" viewBox="0 0 100 100" width="100%">
                                <path className="text-primary" d="M0 100 L100 0 L100 100 Z" fill="currentColor"></path>
                            </svg>
                        </div>
                    </div>
                </section>
            </main>
            {/* Footer */}
            <footer className="w-full px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-[#1a2120] bg-[#090f0f] relative !z-50">
                <div className="space-y-6">
                    <span className="text-xl font-black tracking-tighter text-[#b9f600] font-logo">SOCIAL PREDICT</span>
                    <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
                        The world's leading decentralized prediction platform. Built for precision, powered by the Kinetic Ledger.
                    </p>
                    <p className="text-slate-500 text-xs">© 2024 Social Predict.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-3">
                        <span className="text-[#94d3c1] font-bold text-xs uppercase tracking-widest mb-2">Platform</span>
                        <a className="text-slate-500 hover:text-[#44ddc1] transition-all text-sm opacity-80 hover:opacity-100" href="/about">About</a>
                        <a className="text-slate-500 hover:text-[#44ddc1] transition-all text-sm opacity-80 hover:opacity-100" href="/login">Markets</a>
                    </div>
                    <div className="flex flex-col gap-3">
                        <span className="text-[#94d3c1] font-bold text-xs uppercase tracking-widest mb-2">Legal</span>
                        <a className="text-slate-500 hover:text-[#44ddc1] transition-all text-sm opacity-80 hover:opacity-100" href="#">Terms</a>
                        <a className="text-slate-500 hover:text-[#44ddc1] transition-all text-sm opacity-80 hover:opacity-100" href="#">Privacy</a>
                    </div>
                </div>
                <div className="flex flex-col gap-6 items-start md:items-end">
                    <span className="text-[#94d3c1] font-bold text-xs uppercase tracking-widest">Connect</span>
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface hover:text-[#b9f600] transition-colors cursor-pointer">
                            <span className="material-symbols-outlined">share</span>
                        </div>
                    </div>
                    <div className="text-slate-500 text-[10px] md:text-right max-w-[200px]">
                        Trading in prediction markets involves significant risk of loss. Always trade responsibly.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
