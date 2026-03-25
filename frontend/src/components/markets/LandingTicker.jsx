import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config';

const LandingTicker = () => {
    const [markets, setMarkets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTickerMarkets = async () => {
            try {
                const response = await fetch(`${API_URL}/v0/markets/active?limit=8`);
                const data = await response.json();
                if (data && data.markets) {
                    setMarkets(data.markets);
                }
            } catch (error) {
                console.error('Error fetching ticker markets:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTickerMarkets();
    }, []);

    if (loading || markets.length === 0) return null;

    return (
        <div className="w-full bg-surface-container-high/30 backdrop-blur-sm border-y border-outline-variant/10 py-3 overflow-hidden flex items-center group">
            <div className="flex animate-marquee whitespace-nowrap gap-12 group-hover:pause">
                {/* Duplicate for seamless loop */}
                {[...markets, ...markets].map((m, idx) => (
                    <div key={`${m.market.id}-${idx}`} className="flex items-center gap-4 px-4">
                        <span className="text-secondary-fixed font-black text-sm tracking-tighter uppercase font-logo">
                            {m.market.title.length > 40 ? m.market.title.substring(0, 40) + '...' : m.market.title}
                        </span>
                        <div className={`flex items-center gap-1 font-bold ${m.lastProbability > 0.5 ? 'text-primary' : 'text-error'}`}>
                            <span className="material-symbols-outlined text-xs">
                                {m.lastProbability > 0.5 ? 'trending_up' : 'trending_down'}
                            </span>
                            <span className="text-sm">{(m.lastProbability * 100).toFixed(0)}%</span>
                        </div>
                        <span className="text-on-surface-variant/40 font-bold ml-2">//</span>
                    </div>
                ))}
            </div>
            
            <style jsx>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 30s linear infinite;
                }
                .group-hover\:pause:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </div>
    );
};

export default LandingTicker;
