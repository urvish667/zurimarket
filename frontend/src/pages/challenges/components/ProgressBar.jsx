import React from 'react';

const ProgressBar = ({ current, target, startBalance, label = 'Progress', showValues = true }) => {
    const gained = current - startBalance;
    const needed = target - startBalance;
    const pct = needed > 0 ? Math.min(100, Math.max(0, (gained / needed) * 100)) : 100;
    const isComplete = pct >= 100;

    return (
        <div className="w-full">
            {label && (
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">{label}</span>
                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${isComplete ? 'text-emerald-400' : 'text-[#ddff5c]'}`}>
                        {pct.toFixed(1)}%
                    </span>
                </div>
            )}
            <div className="w-full h-2 bg-white/5 overflow-hidden relative">
                <div
                    className={`h-full transition-all duration-1000 ease-out ${
                        isComplete
                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                            : 'bg-gradient-to-r from-[#ddff5c] to-[#caf300]'
                    }`}
                    style={{ width: `${pct}%` }}
                />
                {/* Subtle shimmer animation */}
                <div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"
                    style={{ width: `${pct}%` }}
                />
            </div>
            {showValues && (
                <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">
                        R{(current / 100).toLocaleString()}
                    </span>
                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">
                        R{(target / 100).toLocaleString()}
                    </span>
                </div>
            )}
        </div>
    );
};

export default ProgressBar;
