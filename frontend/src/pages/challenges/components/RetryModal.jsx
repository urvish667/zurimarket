import React, { useState } from 'react';

const RetryModal = ({ challenge, onRetry, onClose }) => {
    const [retrying, setRetrying] = useState(false);
    const [error, setError] = useState('');

    const tier = challenge?.tier || {};
    const isFree = tier.entryFee === 0;

    const handleRetry = async () => {
        setRetrying(true);
        setError('');
        try {
            await onRetry(challenge.id);
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setRetrying(false);
        }
    };

    if (!challenge) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-[#131313] border border-white/10 max-w-md w-full">
                {/* Top accent */}
                <div className="h-[2px] w-full bg-gradient-to-r from-[#ddff5c] to-[#caf300]" />

                <div className="p-8">
                    {/* Icon */}
                    <div className="flex items-center justify-center w-12 h-12 bg-[#ddff5c]/10 border border-[#ddff5c]/20 mb-6 mx-auto">
                        <span className="material-symbols-outlined text-[#ddff5c] text-2xl">restart_alt</span>
                    </div>

                    <h3 className="font-headline text-xl font-black uppercase tracking-tight text-white text-center mb-2">
                        Retry {tier.name}?
                    </h3>

                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30 text-center mb-6 leading-relaxed">
                        {isFree
                            ? 'This will reset all progress and start a new attempt with fresh metrics.'
                            : `This will deduct R${(tier.entryFee / 100).toLocaleString()} from your virtual balance and start a new attempt.`
                        }
                    </p>

                    {/* Details */}
                    <div className="border-y border-white/5 py-4 mb-6 space-y-2">
                        <div className="flex justify-between">
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Starting Balance</span>
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/60">R{(tier.startingBalance / 100).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Target</span>
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#ddff5c]">R{(tier.profitTarget / 100).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Duration</span>
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/60">{tier.durationDays} days</span>
                        </div>
                        {!isFree && (
                            <div className="flex justify-between pt-2 border-t border-white/5">
                                <span className="text-[9px] font-black uppercase tracking-widest text-red-400/60">Entry Fee</span>
                                <span className="text-[9px] font-black uppercase tracking-widest text-red-400">R{(tier.entryFee / 100).toLocaleString()}</span>
                            </div>
                        )}
                    </div>

                    {error && (
                        <p className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-4 text-center">{error}</p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-white/50 hover:text-white hover:border-white/20 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleRetry}
                            disabled={retrying}
                            className="flex-1 py-3 bg-[#ddff5c] text-[#0b0f0e] text-[10px] font-black uppercase tracking-[0.2em] hover:brightness-110 transition-all disabled:opacity-50"
                        >
                            {retrying ? 'Retrying...' : isFree ? 'Retry Free' : `Retry (R${(tier.entryFee / 100).toLocaleString()})`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RetryModal;
