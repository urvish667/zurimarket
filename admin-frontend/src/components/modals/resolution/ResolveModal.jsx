import React, { useState } from 'react';
import { resolveMarket } from './ResolveUtils';
import { useMarketLabels } from '../../../hooks/useMarketLabels';

const ResolveModalButton = ({ marketId, token, market, disabled, className }) => {
    const [showResolveModal, setShowResolveModal] = useState(false);
    const [selectedResolution, setSelectedResolution] = useState(null);
    
    // Get custom labels for this market
    const { yesLabel, noLabel } = useMarketLabels(market);

    const isMultipleChoice = market.outcomeType === 'MULTIPLE_CHOICE';
    const options = isMultipleChoice 
        ? (market.options || []) 
        : [{ label: yesLabel || 'YES', value: 'YES' }, { label: noLabel || 'NO', value: 'NO' }];

    const toggleResolveModal = () => setShowResolveModal(prev => !prev);

    const handleConfirm = () => {
        if (!selectedResolution) return;
        
        resolveMarket(marketId, token, selectedResolution)
            .then(data => {
                alert("Market successfully resolved!");
                setShowResolveModal(false);
                // Optionally reload or callback to parent
                window.location.reload();
            })
            .catch(error => {
                console.error("Failed to resolve market:", error);
                alert(`Failed to resolve market: ${error.message}`);
            });
    };

    return (
        <div>
            <button 
                onClick={toggleResolveModal} 
                disabled={disabled}
                className={`bg-[#0b0f0e] border border-white/20 text-[#ddff5c] text-xs font-black uppercase tracking-wider py-2 px-6 hover:bg-white/5 hover:border-[#ddff5c] transition-all flex items-center gap-2 ${className || ''}`}
            >
                <span className="material-symbols-outlined text-[16px]">gavel</span>
                Resolve Market
            </button>
            
            {showResolveModal && (
                <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-[100] backdrop-blur-sm">
                    <div className="relative bg-[#0b0f0e] border border-white/20 p-8 text-white m-6 w-full max-w-sm shadow-2xl">
                        
                        <div className="flex items-center gap-3 mb-6">
                            <span className="material-symbols-outlined text-[#ddff5c] text-2xl">gavel</span>
                            <h2 className="text-xl font-headline font-black uppercase tracking-widest text-white">Resolve Market</h2>
                        </div>

                        <p className="text-xs text-white/50 mb-6 uppercase tracking-widest leading-relaxed">
                            Select the definitive outcome. This action is irreversible and will distribute payouts to holders of the winning outcome.
                        </p>

                        <div className="grid gap-3 mb-8 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                            {options.map((opt, i) => {
                                const val = isMultipleChoice ? opt.label : opt.value;
                                const labelText = isMultipleChoice ? opt.label : opt.label;
                                const isSelected = selectedResolution === val;
                                
                                return (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedResolution(val)}
                                        className={`p-4 border transition-all text-left flex justify-between items-center ${
                                            isSelected 
                                                ? 'border-[#ddff5c] bg-[#ddff5c]/10 text-[#ddff5c]' 
                                                : 'border-white/10 bg-white/[0.02] text-white/50 hover:border-white/30 hover:text-white/80'
                                        }`}
                                    >
                                        <span className="text-xs font-black uppercase tracking-widest">{labelText}</span>
                                        {isSelected && (
                                            <span className="material-symbols-outlined text-[#ddff5c] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>radio_button_checked</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <button 
                            onClick={handleConfirm}
                            disabled={!selectedResolution}
                            className={`w-full py-4 text-xs font-black uppercase tracking-[0.2em] transition-all flex justify-center items-center gap-2
                                ${!selectedResolution 
                                    ? 'bg-white/5 text-white/20 cursor-not-allowed' 
                                    : 'bg-[#ddff5c] text-black hover:bg-[#c4e649] active:scale-[0.98]'}`}
                        >
                            <span className="material-symbols-outlined text-sm">lock</span>
                            {selectedResolution ? `CONFIRM ${selectedResolution}` : 'Select Winner'}
                        </button>

                        <button 
                            onClick={toggleResolveModal} 
                            className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResolveModalButton;
