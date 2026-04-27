import React, { useState, useEffect } from 'react';
import { submitBet } from '../layouts/trade/TradeUtils';
import { fetchUserShares, submitSale } from '../layouts/trade/TradeUtils';
import { useMarketLabels } from '../../hooks/useMarketLabels';
import MarketProjectionLayout from '../layouts/marketprojection/MarketProjectionLayout';
import { CoinIcon, formatCurrency } from '../../utils/CurrencyUtils';

const TradingSidebar = ({ marketId, market, token, isLoggedIn, onTransactionSuccess, currentProbability, optionProbabilities = {}, externalSelectedOutcome }) => {
  const [mode, setMode] = useState('buy'); // 'buy' or 'sell'
  const [selectedOutcome, setSelectedOutcome] = useState(null);

  useEffect(() => {
    if (externalSelectedOutcome) {
      setSelectedOutcome(externalSelectedOutcome);
      setMode('buy');
    }
  }, [externalSelectedOutcome]);
  const [amount, setAmount] = useState(10);
  const [feeData, setFeeData] = useState(null);
  const [ownedShares, setOwnedShares] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { yesLabel, noLabel } = useMarketLabels(market);
  const isMultipleChoice = market.outcomeType === 'MULTIPLE_CHOICE';

  // Fetch fee data
  useEffect(() => {
    const fetchFeeData = async () => {
      try {
        const response = await fetch('/v0/setup');
        const data = await response.json();
        setFeeData(data.Betting.BetFees);
      } catch (error) {
        console.error('Error fetching fee data:', error);
      }
    };
    fetchFeeData();
  }, []);

  // Fetch user shares for sell mode
  useEffect(() => {
    if (mode === 'sell' && token) {
      fetchUserShares(marketId, token)
        .then(data => {
          let sharesObj;
          if (Array.isArray(data)) {
            sharesObj = data[0] || { noSharesOwned: 0, yesSharesOwned: 0 };
          } else if (typeof data === 'object' && data !== null) {
            sharesObj = data;
          } else {
            sharesObj = { noSharesOwned: 0, yesSharesOwned: 0 };
          }
          const newShares = [];
          if (sharesObj.yesSharesOwned > 0) newShares.push({ outcome: 'YES', label: yesLabel || 'YES', count: sharesObj.yesSharesOwned });
          if (sharesObj.noSharesOwned > 0) newShares.push({ outcome: 'NO', label: noLabel || 'NO', count: sharesObj.noSharesOwned });
          if (sharesObj.optionsOwned) {
            Object.entries(sharesObj.optionsOwned).forEach(([opt, count]) => {
              if (count > 0) newShares.push({ outcome: opt, label: opt, count });
            });
          }
          setOwnedShares(newShares);
        })
        .catch(() => setOwnedShares([]));
    }
  }, [mode, marketId, token, yesLabel, noLabel]);

  const handleAmountChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setAmount(val >= 0 ? val : 0);
  };

  const handleQuickAmount = (val) => {
    if (val === 'max') {
      if (mode === 'sell') {
        const share = ownedShares.find(s => s.outcome === selectedOutcome);
        setAmount(share?.count || 0);
      } else {
        setAmount(1000);
      }
    } else {
      setAmount(prev => prev + val);
    }
  };

  const handleSubmit = () => {
    if (!token || !selectedOutcome || amount < 1) return;
    setIsSubmitting(true);

    if (mode === 'buy') {
      submitBet(
        { marketId, amount, outcome: selectedOutcome },
        token,
        () => {
          setIsSubmitting(false);
          onTransactionSuccess();
        },
        (error) => {
          setIsSubmitting(false);
          alert(`Error: ${error.message}`);
        }
      );
    } else {
      submitSale(
        { marketId, amount, outcome: selectedOutcome },
        token,
        () => {
          setIsSubmitting(false);
          onTransactionSuccess();
        },
        (error) => {
          setIsSubmitting(false);
          alert(`Error: ${error.message}`);
        }
      );
    }
  };

  const yesProb = isMultipleChoice ? null : currentProbability;
  const noProb = isMultipleChoice ? null : (1 - currentProbability);

  const isMarketActive = !market.isResolved && new Date(market.resolutionDateTime) > new Date();

  if (!isMarketActive) {
    return (
      <div className="bg-white/[0.03] border border-white/10 p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-white/30 text-lg">lock</span>
          <span className="text-xs font-black uppercase tracking-widest text-white/40">Market Closed</span>
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest text-white/30">
          This market has been resolved and trading is no longer available.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/[0.03] border border-white/10">
      {/* Selected Outcome Header */}
      {selectedOutcome && (
        <div className="px-5 pt-4 pb-3 border-b border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 bg-[#ddff5c]/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-[#ddff5c] text-sm">
              {selectedOutcome === 'YES' || selectedOutcome === (yesLabel || 'YES') ? 'trending_up' : 'trending_down'}
            </span>
          </div>
          <span className="font-headline font-black text-sm uppercase tracking-widest text-white">
            {selectedOutcome}
          </span>
        </div>
      )}

      {/* Buy / Sell Toggle */}
      <div className="flex border-b border-white/10">
        <button
          onClick={() => { setMode('buy'); setSelectedOutcome(null); setAmount(10); }}
          className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest transition-all ${
            mode === 'buy'
              ? 'text-white border-b-2 border-[#ddff5c] bg-white/[0.03]'
              : 'text-white/30 hover:text-white/50'
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => { setMode('sell'); setSelectedOutcome(null); setAmount(1); }}
          className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest transition-all ${
            mode === 'sell'
              ? 'text-white border-b-2 border-red-400 bg-white/[0.03]'
              : 'text-white/30 hover:text-white/50'
          }`}
        >
          Sell
        </button>
      </div>

      <div className="p-5">
        {/* Outcome Selection */}
        {mode === 'buy' ? (
          <div className="grid grid-cols-2 gap-2 mb-5">
            {!isMultipleChoice ? (
              <>
                <button
                  onClick={() => setSelectedOutcome('YES')}
                  className={`py-3 px-3 text-center transition-all text-xs font-black uppercase tracking-widest ${
                    selectedOutcome === 'YES'
                      ? 'bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400'
                      : 'bg-emerald-500/5 border border-emerald-500/20 text-emerald-500/60 hover:bg-emerald-500/10 hover:text-emerald-400'
                  }`}
                >
                  <span className="block text-lg font-headline font-black mb-0.5">
                    {yesLabel || 'Yes'}
                  </span>
                  {yesProb !== null && (
                    <span className="text-[10px] text-emerald-400/60">{(yesProb * 100).toFixed(0)}¢</span>
                  )}
                </button>
                <button
                  onClick={() => setSelectedOutcome('NO')}
                  className={`py-3 px-3 text-center transition-all text-xs font-black uppercase tracking-widest ${
                    selectedOutcome === 'NO'
                      ? 'bg-red-500/20 border-2 border-red-500 text-red-400'
                      : 'bg-red-500/5 border border-red-500/20 text-red-500/60 hover:bg-red-500/10 hover:text-red-400'
                  }`}
                >
                  <span className="block text-lg font-headline font-black mb-0.5">
                    {noLabel || 'No'}
                  </span>
                  {noProb !== null && (
                    <span className="text-[10px] text-red-400/60">{(noProb * 100).toFixed(0)}¢</span>
                  )}
                </button>
              </>
            ) : (
              <div className="col-span-2 flex flex-col gap-2">
                {(market.options || []).map((opt, i) => {
                  const prob = optionProbabilities[opt.label] || 0;
                  const isSelected = selectedOutcome === opt.label;
                  return (
                    <button
                      key={opt.id || i}
                      onClick={() => setSelectedOutcome(opt.label)}
                      className={`py-2.5 px-3 text-left transition-all text-xs font-black uppercase tracking-widest flex justify-between items-center ${
                        isSelected
                          ? 'bg-[#ddff5c]/10 border-2 border-[#ddff5c] text-[#ddff5c]'
                          : 'bg-white/[0.02] border border-white/10 text-white/50 hover:border-white/30 hover:text-white/80'
                      }`}
                    >
                      <span className="truncate">{opt.label}</span>
                      <span className={isSelected ? 'text-[#ddff5c]' : 'text-white/30'}>
                        {(prob * 100).toFixed(0)}%
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* Sell mode: show owned shares */
          <div className="mb-5">
            {ownedShares.length === 0 ? (
              <div className="p-4 border border-white/5 bg-white/[0.02] text-center">
                <span className="material-symbols-outlined text-white/20 text-2xl block mb-1">inventory_2</span>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30">No shares to sell</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {ownedShares.map((share, i) => {
                  const isSelected = selectedOutcome === share.outcome;
                  return (
                    <button
                      key={i}
                      onClick={() => { setSelectedOutcome(share.outcome); setAmount(share.count); }}
                      className={`py-2.5 px-3 text-left transition-all text-xs font-black uppercase tracking-widest flex justify-between items-center ${
                        isSelected
                          ? 'bg-red-500/10 border-2 border-red-500 text-red-400'
                          : 'bg-white/[0.02] border border-white/10 text-white/50 hover:border-white/30'
                      }`}
                    >
                      <span>{share.label}</span>
                      <span>{share.count} shares</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Amount */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Amount</span>
          </div>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center">
              <CoinIcon size="text-sm" />
            </div>
            <input
              type="number"
              value={amount}
              onChange={handleAmountChange}
              min="1"
              className="w-full pl-9 pr-3 py-3 bg-white/5 border border-white/10 text-white text-lg font-black focus:outline-none focus:border-[#ddff5c]/50 transition-colors"
            />
          </div>
        </div>

        {/* Quick Amount Buttons */}
        <div className="flex gap-2 mb-5">
          {[1, 20, 100].map(val => (
            <button
              key={val}
              onClick={() => handleQuickAmount(val)}
              className="flex-1 py-1.5 text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/10 text-white/50 hover:text-white hover:border-white/30 transition-all flex items-center justify-center gap-0.5"
            >
              <CoinIcon size="text-[8px]" className="opacity-40" />
              +{val}
            </button>
          ))}
          <button
            onClick={() => handleQuickAmount('max')}
            className="flex-1 py-1.5 text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/10 text-white/50 hover:text-white hover:border-white/30 transition-all"
          >
            Max
          </button>
        </div>

        {/* CTA Button */}
        {!isLoggedIn ? (
          <a
            href="/login"
            className="block w-full py-3.5 text-center text-xs font-black uppercase tracking-[0.2em] bg-[#ddff5c] text-black hover:brightness-110 transition-all"
          >
            Log In to Trade
          </a>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!selectedOutcome || amount < 1 || isSubmitting}
            className={`w-full py-3.5 text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
              !selectedOutcome || amount < 1 || isSubmitting
                ? 'bg-white/5 text-white/20 cursor-not-allowed'
                : mode === 'buy'
                  ? 'bg-emerald-500 text-black hover:bg-emerald-400 active:scale-[0.98]'
                  : 'bg-red-500 text-white hover:bg-red-600 active:scale-[0.98]'
            }`}
          >
            {isSubmitting ? 'Processing...' : 
             !selectedOutcome ? 'Select outcome' : (
               <>
                {mode === 'buy' ? 'Buy' : 'Sell'} {selectedOutcome}
               </>
             )}
          </button>
        )}

        {/* Fee Info */}
        {feeData && (
          <div className="mt-4 pt-3 border-t border-white/5">
            {(mode === 'buy' ? feeData.BuySharesFee : feeData.SellSharesFee) > 0 ? (
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/30">
                <span>Trading Fee</span>
                <span className="flex items-center gap-1">
                  <CoinIcon size="text-[10px]" />
                  {formatCurrency(mode === 'buy' ? feeData.BuySharesFee : feeData.SellSharesFee)}
                </span>
              </div>
            ) : (
              <p className="text-[10px] font-black uppercase tracking-widest text-white/20 text-center">No trading fees</p>
            )}
          </div>
        )}

        {/* Projection (buy only) */}
        {mode === 'buy' && selectedOutcome && amount > 0 && !isMultipleChoice && (
          <div className="mt-4 pt-3 border-t border-white/5">
            <MarketProjectionLayout
              marketId={marketId}
              amount={amount}
              direction={selectedOutcome}
            />
          </div>
        )}

        {mode === 'buy' && selectedOutcome && amount > 0 && isMultipleChoice && (
          <div className="mt-4 pt-3 border-t border-white/5">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 text-center">
              Projection preview is currently available for binary markets only.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradingSidebar;
