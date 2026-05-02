import React from 'react';

const DailyLogTable = ({ logs = [] }) => {
    if (!logs || logs.length === 0) {
        return (
            <div className="py-8 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/20">No daily logs yet</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-white/5">
                        <th className="text-left py-3 px-4 text-[8px] font-black uppercase tracking-[0.2em] text-white/20">Date</th>
                        <th className="text-right py-3 px-4 text-[8px] font-black uppercase tracking-[0.2em] text-white/20">Open</th>
                        <th className="text-right py-3 px-4 text-[8px] font-black uppercase tracking-[0.2em] text-white/20">Close</th>
                        <th className="text-right py-3 px-4 text-[8px] font-black uppercase tracking-[0.2em] text-white/20">P&L</th>
                        <th className="text-right py-3 px-4 text-[8px] font-black uppercase tracking-[0.2em] text-white/20">Loss %</th>
                        <th className="text-center py-3 px-4 text-[8px] font-black uppercase tracking-[0.2em] text-white/20">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.map((log, index) => {
                        const isLoss = log.dailyPnl < 0;
                        const hasViolation = !!log.ruleViolation;

                        return (
                            <tr
                                key={log.id || index}
                                className={`border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors ${hasViolation ? 'bg-red-500/[0.03]' : ''}`}
                            >
                                <td className="py-3 px-4 text-[10px] font-black text-white/50 uppercase tracking-wider">
                                    {formatDate(log.date)}
                                </td>
                                <td className="py-3 px-4 text-right text-[10px] font-black text-white/40 uppercase tracking-wider">
                                    R{(log.openBalance / 100).toLocaleString()}
                                </td>
                                <td className="py-3 px-4 text-right text-[10px] font-black text-white/40 uppercase tracking-wider">
                                    R{(log.closeBalance / 100).toLocaleString()}
                                </td>
                                <td className={`py-3 px-4 text-right text-[10px] font-black uppercase tracking-wider ${isLoss ? 'text-red-400' : 'text-emerald-400'}`}>
                                    {isLoss ? '' : '+'}R{(log.dailyPnl / 100).toLocaleString()}
                                </td>
                                <td className={`py-3 px-4 text-right text-[10px] font-black uppercase tracking-wider ${log.dailyLossPct > 8 ? 'text-red-400' : 'text-white/30'}`}>
                                    {log.dailyLossPct > 0 ? `-${log.dailyLossPct.toFixed(1)}%` : '—'}
                                </td>
                                <td className="py-3 px-4 text-center">
                                    {hasViolation ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-[8px] font-black uppercase tracking-widest text-red-400">
                                            <span className="material-symbols-outlined text-[10px]">warning</span>
                                            {log.ruleViolation.replace('_', ' ')}
                                        </span>
                                    ) : log.isLosingDay ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-500/10 border border-orange-500/20 text-[8px] font-black uppercase tracking-widest text-orange-400">
                                            Loss Day
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-black uppercase tracking-widest text-emerald-400">
                                            OK
                                        </span>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr + 'T00:00:00Z');
    return d.toLocaleDateString('en-ZA', { day: '2-digit', month: 'short' });
}

export default DailyLogTable;
