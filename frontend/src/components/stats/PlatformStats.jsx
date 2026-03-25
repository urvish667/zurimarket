import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config';

const PlatformStats = () => {
    const [stats, setStats] = useState({ totalUsers: 0, totalMarkets: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch(`${API_URL}/v0/stats`);
                const data = await response.json();
                if (data && data.platformStats) {
                    setStats(data.platformStats);
                }
            } catch (error) {
                console.error('Error fetching platform stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return null;

    return (
        <div className="flex gap-12 items-center justify-center py-6 bg-surface-container-low/50 backdrop-blur border-b border-outline-variant/10">
            <div className="flex flex-col items-center">
                <span className="text-3xl font-black text-secondary font-headline tracking-tighter">
                    {stats.totalUsers.toLocaleString()}
                </span>
                <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest">Active Predictors</span>
            </div>
            <div className="w-px h-8 bg-outline-variant/20"></div>
            <div className="flex flex-col items-center">
                <span className="text-3xl font-black text-secondary font-headline tracking-tighter">
                    {stats.totalMarkets.toLocaleString()}
                </span>
                <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest">Live Markets</span>
            </div>
            <div className="w-px h-8 bg-outline-variant/20"></div>
            <div className="flex flex-col items-center">
                <span className="text-3xl font-black text-primary font-headline tracking-tighter">
                    R150,000+
                </span>
                <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest">Paid Out</span>
            </div>
        </div>
    );
};

export default PlatformStats;
