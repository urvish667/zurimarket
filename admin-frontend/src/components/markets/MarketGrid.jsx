import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config';
import ZuriMarketCard from './ZuriMarketCard';
import LoadingSpinner from '../loaders/LoadingSpinner';

const MarketGrid = ({ category = 'all', status = 'active', searchQuery = '' }) => {
    const [markets, setMarkets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMarkets = async () => {
            setLoading(true);
            try {
                // Determine endpoint based on status
                let endpoint = status === 'active' ? 'active' : (status === 'ending' ? 'active' : 'closed');
                let url = `${API_URL}/v0/markets/${endpoint}`;
                
                const response = await fetch(url);
                if (!response.ok) throw new Error('Failed to fetch markets');
                const data = await response.json();
                
                if (data && data.markets) {
                    let filtered = data.markets;

                    // Filter by category if not 'all'
                    if (category !== 'all') {
                        filtered = filtered.filter(m => {
                            const marketCat = m.market.category?.toLowerCase() || 'other';
                            return marketCat === category.toLowerCase();
                        });
                    }

                    // Filter by searchQuery if present
                    if (searchQuery) {
                        const query = searchQuery.toLowerCase();
                        filtered = filtered.filter(m => 
                            (m.market.questionTitle && m.market.questionTitle.toLowerCase().includes(query)) || 
                            (m.market.description && m.market.description.toLowerCase().includes(query))
                        );
                    }

                    // For "ending" status, we might want to sort by end date
                    if (status === 'ending') {
                        filtered = [...filtered].sort((a, b) => 
                            new Date(a.market.endTime) - new Date(b.market.endTime)
                        );
                    }

                    setMarkets(filtered);
                }
            } catch (err) {
                console.error('Error fetching markets:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMarkets();
    }, [category, status, searchQuery]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
            <LoadingSpinner />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Loading Markets...</span>
        </div>
    );

    if (error) return (
        <div className="py-24 text-center">
            <p className="text-red-400 font-black text-xs uppercase tracking-widest text-white/50">{error}</p>
        </div>
    );

    if (markets.length === 0) return (
        <div className="py-24 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30">No active markets found in this category.</p>
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {markets.map((marketData) => (
                <ZuriMarketCard key={marketData.market.id} marketData={marketData} />
            ))}
        </div>
    );
};

export default MarketGrid;
