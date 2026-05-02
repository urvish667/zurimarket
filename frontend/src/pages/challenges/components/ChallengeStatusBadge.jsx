import React from 'react';

const statusConfig = {
    ACTIVE: {
        label: 'Active',
        bg: 'bg-[#ddff5c]/10',
        border: 'border-[#ddff5c]/30',
        text: 'text-[#ddff5c]',
        dot: 'bg-[#ddff5c]',
        animate: true,
    },
    PASSED: {
        label: 'Passed',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        text: 'text-emerald-400',
        dot: 'bg-emerald-400',
        animate: false,
    },
    FAILED: {
        label: 'Failed',
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        text: 'text-red-400',
        dot: 'bg-red-400',
        animate: false,
    },
    EXPIRED: {
        label: 'Expired',
        bg: 'bg-white/5',
        border: 'border-white/10',
        text: 'text-white/40',
        dot: 'bg-white/30',
        animate: false,
    },
};

const ChallengeStatusBadge = ({ status, size = 'default' }) => {
    const config = statusConfig[status] || statusConfig.EXPIRED;
    const isSmall = size === 'small';

    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 ${config.bg} border ${config.border} ${isSmall ? 'px-2 py-1' : ''}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${config.dot} ${config.animate ? 'animate-pulse' : ''}`} />
            <span className={`${isSmall ? 'text-[8px]' : 'text-[9px]'} font-black uppercase tracking-[0.2em] ${config.text}`}>
                {config.label}
            </span>
        </div>
    );
};

export default ChallengeStatusBadge;
