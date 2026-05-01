import React, { useState, useEffect } from 'react';
import MarketProjectionLayout from '../marketprojection/MarketProjectionLayout';
import { submitBet } from './TradeUtils';
import { useMarketLabels } from '../../../hooks/useMarketLabels';
import { CoinIcon, formatCurrency } from '../../../utils/CurrencyUtils';
import { API_URL } from '../../../config';

const BuySharesLayout = ({ marketId, market, token, onTransactionSuccess }) => {
    const [betAmount, setBetAmount] = useState(1);
    const [selectedOutcome, setSelectedOutcome] = useState(null);
    const [feeData, setFeeData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // Get custom labels for this market
    const { yesLabel, noLabel } = useMarketLabels(market);

    const isMultipleChoice = market.outcomeType === 'MULTIPLE_CHOICE';
    const options = isMultipleChoice 
        ? (market.options || []) 
        : [{ label: yesLabel || 'YES', value: 'YES' }, { label: noLabel || 'NO', value: 'NO' }];

    useEffect(() => {
        const fetchFeeData = async () => {
            try {
                const response = await fetch(`${API_URL}/v0/setup`);
                const data = await response.json();
                setFeeData(data.betting.betFees);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching fee data:', error);
                setIsLoading(false);
            }
        };

        fetchFeeData();
    }, []);

    const handleBetAmountChange = (event) => {
        const newAmount = parseInt(event.target.value, 10);
        setBetAmount(newAmount >= 0 ? newAmount : '');
    };

    const handleBetSubmission = () => {
        if (!token) {
            alert('Please log in to place a bet.');
            return;
        }

        if (!selectedOutcome) {
            alert('Please select an outcome to trade.');
            return;
        }

        const betData = {
            marketId,
            amount: betAmount,
            outcome: selectedOutcome,
        };

        submitBet(betData, token, (data) => {
            alert(`Bet placed successfully!`);
            onTransactionSuccess();
        }, (error) => {
            alert(`Error placing bet: ${error.message}`);
        });
    };

    return (
        <div className="p-6 bg-[#0b0f0e] text-white">
            <h2 className="text-xl font-headline font-black uppercase tracking-widest mb-6">Purchase Shares</h2>
            
            {/* Options Selection */}
            <div className={`grid gap-3 mb-6 ${isMultipleChoice ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2'}`}>
                {options.map((opt, i) => {
                    const val = isMultipleChoice ? opt.label : opt.value;
                    const labelText = isMultipleChoice ? opt.label : opt.label;
                    const isSelected = selectedOutcome === val;
                    return (
                        <button
                            key={i}
                            onClick={() => setSelectedOutcome(val)}
                            className={`p-4 border transition-all text-left flex justify-between items-center ${
                                isSelected 
                                    ? 'border-[#ddff5c] bg-[#ddff5c]/10 text-[#ddff5c]' 
                                    : 'border-white/10 bg-white/[0.02] text-white/50 hover:border-white/30 hover:text-white/80'
                            }`}
                        >
                            <span className="text-xs font-black uppercase tracking-widest line-clamp-1">{labelText}</span>
                            {isSelected && (
                                <span className="material-symbols-outlined text-[#ddff5c] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                            )}
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
                        value={betAmount} 
                        onChange={handleBetAmountChange} 
                        min="1"
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 text-white rounded-none text-lg font-black focus:outline-none focus:border-[#ddff5c]/50 transition-colors"
                    />
                </div>
            </div>

            {/* Confirm Button */}
            <button 
                onClick={handleBetSubmission}
                disabled={!selectedOutcome || betAmount < 1}
                className={`w-full py-4 text-xs font-black uppercase tracking-[0.2em] transition-all
                    ${!selectedOutcome || betAmount < 1 
                        ? 'bg-white/5 text-white/20 cursor-not-allowed' 
                        : 'bg-[#ddff5c] text-black hover:bg-[#c4e649] active:scale-[0.98]'}`}
            >
                {selectedOutcome ? `Confirm Purchase of ${selectedOutcome}` : 'Select an outcome'}
            </button>

            <div className="border-t border-white/10 my-6"></div>

            {!isLoading && feeData && (
                <div className="mb-4 bg-white/5 p-4 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-[#ddff5c] text-sm">receipt_long</span>
                        <span className="text-[10px] font-black text-[#ddff5c] uppercase tracking-widest">Fee Details</span>
                    </div>
                    {feeData.initialBetFee === 0 && feeData.buySharesFee === 0 ? (
                        <p className="text-[10px] uppercase font-black tracking-widest text-white/40">No fees on this transaction</p>
                    ) : (
                        <div className="space-y-1">
                            {feeData.initialBetFee > 0 && (
                                <p className="text-[10px] uppercase font-black tracking-widest text-white/40 flex justify-between items-center">
                                    <span>Initial Trade Fee:</span>
                                    <span className="text-white flex items-center gap-1">
                                        <CoinIcon size="text-[10px]" />
                                        {formatCurrency(feeData.initialBetFee)}
                                    </span>
                                </p>
                            )}
                            {feeData.buySharesFee > 0 && (
                                <p className="text-[10px] uppercase font-black tracking-widest text-white/40 flex justify-between items-center">
                                    <span>Trading Fee:</span>
                                    <span className="text-white flex items-center gap-1">
                                        <CoinIcon size="text-[10px]" />
                                        {formatCurrency(feeData.buySharesFee)}
                                    </span>
                                </p>
                            )}
                        </div>
                    )}
                </div>
            ) [diff_block_end]}

            <div className="border-t border-white/10 my-6"></div>
            
            {!isMultipleChoice ? (
                <MarketProjectionLayout
                    marketId={marketId}
                    amount={betAmount}
                    direction={selectedOutcome}
                />
            ) : (
                <div className="bg-white/5 p-4 border border-white/10">
                    <p className="text-[10px] uppercase font-black tracking-widest text-white/40">
                        Projection preview is currently available for binary markets only.
                    </p>
                </div>
            )}
        </div>
    );
};

export default BuySharesLayout;
