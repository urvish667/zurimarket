import React, { useState, useEffect } from 'react';
import { fetchUserShares, submitSale } from './TradeUtils';
import { useMarketLabels } from '../../../hooks/useMarketLabels';
import { CoinIcon, formatCurrency } from '../../../utils/CurrencyUtils';

const SellSharesLayout = ({ marketId, market, token, onTransactionSuccess }) => {
    // Array of objects { outcome: "label", count: amount }
    const [ownedShares, setOwnedShares] = useState([]);
    const [sellAmount, setSellAmount] = useState(1);
    const [selectedOutcome, setSelectedOutcome] = useState(null);
    const [feeData, setFeeData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // Get custom labels for this market
    const { yesLabel, noLabel } = useMarketLabels(market);

    useEffect(() => {
        const fetchFeeData = async () => {
            try {
                const response = await fetch('/v0/setup');
                const data = await response.json();
                setFeeData(data.Betting.BetFees);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching fee data:', error);
                setIsLoading(false);
            }
        };

        fetchFeeData();
    }, []);

    useEffect(() => {
        fetchUserShares(marketId, token)
            .then(data => {
                let sharesObj;
                if (Array.isArray(data)) {
                    sharesObj = data[0] || { noSharesOwned: 0, yesSharesOwned: 0, value: 0 };
                } else if (typeof data === 'object' && data !== null) {
                    sharesObj = data;
                } else {
                    sharesObj = { noSharesOwned: 0, yesSharesOwned: 0, value: 0 };
                }

                // Temporary logic: the current API returns `yesSharesOwned`/`noSharesOwned` explicitly
                // In multiple choice, you might have specific option shares, but we map standard YES/NO for now
                // if the API evolves to return an array of { outcome, count } we'll map that directly.
                const newShares = [];
                if (sharesObj.yesSharesOwned > 0) newShares.push({ outcome: 'YES', label: yesLabel || 'YES', count: sharesObj.yesSharesOwned });
                if (sharesObj.noSharesOwned > 0) newShares.push({ outcome: 'NO', label: noLabel || 'NO', count: sharesObj.noSharesOwned });
                
                // (Future proofing for MC shares if the API adds arbitrary share mapping)
                if (sharesObj.optionsOwned) {
                    Object.entries(sharesObj.optionsOwned).forEach(([opt, count]) => {
                        if (count > 0) newShares.push({ outcome: opt, label: opt, count: count });
                    });
                }
                
                setOwnedShares(newShares);

                if (newShares.length > 0 && !selectedOutcome) {
                    setSelectedOutcome(newShares[0].outcome);
                    setSellAmount(newShares[0].count);
                }
            })
            .catch(error => {
                alert(`Error fetching shares: ${error.message}`);
                console.error('Error fetching shares:', error);
                setOwnedShares([]);
            });
    }, [marketId, token, yesLabel, noLabel, selectedOutcome]);


    const handleSellAmountChange = (event) => {
        const newAmount = parseInt(event.target.value, 10) || 0;
        const currentShare = ownedShares.find(s => s.outcome === selectedOutcome);
        
        if (currentShare) {
            if (newAmount > currentShare.count) {
                setSellAmount(currentShare.count);
            } else if (newAmount >= 0) {
                setSellAmount(newAmount);
            }
        }
    };

    const handleSaleSubmission = () => {
        if (!selectedOutcome || sellAmount < 1) return;

        const saleData = {
            marketId: marketId,
            outcome: selectedOutcome,
            amount: sellAmount,
        };

        submitSale(saleData, token, (data) => {
                alert(`Sale successful!`);
                onTransactionSuccess();
            }, (error) => {
                alert(`Sale failed: ${error.message}`);
                console.error('Sale error:', error);
            }
        );
    };

    return (
        <div className="p-6 bg-[#0b0f0e] text-white">
            <h2 className="text-xl font-headline font-black uppercase tracking-widest mb-6">Sell Shares</h2>

            {ownedShares.length === 0 ? (
                <div className="p-6 border border-white/5 bg-white/[0.02] text-center mb-6">
                    <span className="material-symbols-outlined text-white/20 text-3xl mb-2">sentiment_dissatisfied</span>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40">You own 0 shares in this market</p>
                </div>
            ) : (
                <>
                    {/* Select Position to Sell */}
                    <div className="grid grid-cols-1 gap-3 mb-6">
                        {ownedShares.map((share, i) => {
                            const isSelected = selectedOutcome === share.outcome;
                            return (
                                <button
                                    key={i}
                                    onClick={() => {
                                        setSelectedOutcome(share.outcome);
                                        setSellAmount(share.count);
                                    }}
                                    className={`p-4 border transition-all text-left flex justify-between items-center ${
                                        isSelected 
                                            ? 'border-red-500/50 bg-red-500/10 text-red-400' 
                                            : 'border-white/10 bg-white/[0.02] text-white/50 hover:border-white/30 hover:text-white/80'
                                    }`}
                                >
                                    <div className="flex flex-col">
                                        <span className="text-xs font-black uppercase tracking-widest line-clamp-1">{share.label}</span>
                                        <span className="text-[10px] font-black tracking-widest text-white/30 truncate mt-1">
                                            {share.count} Shares Owned
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="text-lg font-black tracking-[0.05em] text-white/70 flex items-center gap-1">
                                            <CoinIcon size="text-sm" />
                                            {share.count}
                                        </div>
                                        {isSelected && (
                                            <span className="material-symbols-outlined text-red-400 text-sm ml-2" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <div className="border-t border-white/10 my-6"></div>

                    {/* Amount Input */}
                    <div className="flex items-center gap-6 mb-8">
                        <h2 className="text-sm font-black uppercase tracking-widest text-white/40">Amount</h2>
                        <div className="relative flex-1">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center">
                                <CoinIcon size="text-sm" />
                            </div>
                            <input 
                                type="number" 
                                value={sellAmount} 
                                onChange={handleSellAmountChange} 
                                min="1"
                                max={ownedShares.find(s => s.outcome === selectedOutcome)?.count || 0}
                                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 text-white rounded-none text-lg font-black focus:outline-none focus:border-red-500/50 transition-colors"
                            />
                        </div>
                    </div>

                    {/* Confirm Button */}
                    <button 
                        onClick={handleSaleSubmission}
                        disabled={!selectedOutcome || sellAmount < 1}
                        className={`w-full py-4 text-xs font-black uppercase tracking-[0.2em] transition-all
                            ${!selectedOutcome || sellAmount < 1 
                                ? 'bg-white/5 text-white/20 cursor-not-allowed' 
                                : 'bg-red-500 text-white hover:bg-red-600 active:scale-[0.98]'}`}
                    >
                        {selectedOutcome ? `Confirm Sale of ${selectedOutcome}` : 'Select a position'}
                    </button>
                </>
            )}

            <div className="border-t border-white/10 my-6"></div>

            {!isLoading && feeData && (
                 <div className="mb-4 bg-white/5 p-4 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-red-400 text-sm">receipt_long</span>
                        <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">Fee Details</span>
                    </div>
                    {feeData.InitialBetFee === 0 && feeData.SellSharesFee === 0 ? (
                        <p className="text-[10px] uppercase font-black tracking-widest text-white/40">No fees on this transaction</p>
                    ) : (
                        <div className="space-y-1">
                            {feeData.InitialBetFee > 0 && (
                                <p className="text-[10px] uppercase font-black tracking-widest text-white/40 flex justify-between">
                                    <span>Initial Trade Fee:</span>
                                    <span className="text-white">🪙 {feeData.InitialBetFee}</span>
                                </p>
                            )}
                            {feeData.SellSharesFee > 0 && (
                                <p className="text-[10px] uppercase font-black tracking-widest text-white/40 flex justify-between">
                                    <span>Trading Fee:</span>
                                    <span className="text-white">🪙 {feeData.SellSharesFee}</span>
                                </p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SellSharesLayout;
