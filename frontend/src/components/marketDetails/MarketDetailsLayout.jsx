import React, { useState } from 'react';
import ResolutionAlert from '../resolutions/ResolutionAlert';
import MarketChart from '../charts/MarketChart';
import ActivityTabs from '../../components/tabs/ActivityTabs';
import ResolveModalButton from '../modals/resolution/ResolveModal';
import TradeCTA from '../TradeCTA';
import TradeTabs from '../../components/tabs/TradeTabs';
import TradingSidebar from './TradingSidebar';
import formatResolutionDate from '../../helpers/formatResolutionDate';
import { CoinIcon, formatCurrency } from '../../utils/CurrencyUtils';

// Colors for multi-outcome legend dots
const OUTCOME_COLORS = [
  '#34d399', '#f87171', '#60a5fa', '#fbbf24', '#a78bfa',
  '#fb923c', '#2dd4bf', '#f472b6', '#818cf8', '#4ade80',
];

function MarketDetailsTable({
  market,
  creator,
  numUsers,
  totalVolume,
  marketDust,
  commentCount = 0,
  currentProbability,
  probabilityChanges,
  optionProbabilities = {},
  marketId,
  username,
  usertype,
  isLoggedIn,
  token,
  refetchData,
}) {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showBetModal, setShowBetModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedOutcomeForSidebar, setSelectedOutcomeForSidebar] = useState(null);
  const [shareTooltip, setShareTooltip] = useState(false);

  const toggleBetModal = () => setShowBetModal(prev => !prev);

  const handleTransactionSuccess = () => {
    setShowBetModal(false);
    if (refetchData) refetchData();
    setRefreshTrigger(prev => prev + 1);
  };

  const shouldShowTradeButtons = !market.isResolved && isLoggedIn && new Date(market.resolutionDateTime) > new Date();
  const isMultipleChoice = market.outcomeType === 'MULTIPLE_CHOICE';
  const isMarketActive = !market.isResolved && new Date(market.resolutionDateTime) > new Date();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareTooltip(true);
    setTimeout(() => setShareTooltip(false), 2000);
  };

  const formatEndDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  };

  return (
    <div className='text-white w-full'>
      <ResolutionAlert
        isResolved={market.isResolved}
        resolutionResult={market.resolutionResult}
        market={market}
      />

      {/* ─── TWO-COLUMN LAYOUT ─── */}
      <div className="flex flex-col lg:flex-row gap-6 px-4 sm:px-6 py-6">

        {/* ─── LEFT COLUMN: Market Content ─── */}
        <div className="flex-1 min-w-0">

          {/* Market Header */}
          <div className='mb-6'>
            <div className='flex items-start gap-4 mb-4'>
              {/* Market Icon */}
              <div className='w-14 h-14 flex-shrink-0 bg-white/5 border border-white/10 flex items-center justify-center'>
                <span className='material-symbols-outlined text-[#ddff5c] text-2xl'>
                  {isMultipleChoice ? 'list_alt' : 'trending_up'}
                </span>
              </div>
              <div className='flex-1 min-w-0'>
                <h1
                  className='text-xl sm:text-2xl font-headline font-black uppercase tracking-wider leading-tight'
                  title={market.questionTitle}
                >
                  {market.questionTitle}
                </h1>
              </div>
            </div>

            {/* Metadata & Actions Row */}
            <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2'>
              
              {/* LEFT: Volume | End Date | Creator */}
              <div className='flex flex-wrap items-center gap-3 text-xs text-white/50'>
                <span className='font-black tracking-widest flex items-center gap-1'>
                  <span className='text-white/30'>🪙</span> Vol. {Math.round(totalVolume).toLocaleString()}
                </span>
                <span className='text-white/20'>|</span>
                <span className='font-black tracking-widest flex items-center gap-1'>
                  <span className='material-symbols-outlined text-white/30' style={{ fontSize: '14px' }}>schedule</span>
                  {market.isResolved ? 'Resolved' : formatEndDate(market.resolutionDateTime)}
                </span>
                <span className='text-white/20'>|</span>
                <a
                  href={`/user/${market.creatorUsername}`}
                  className='font-black tracking-widest hover:text-[#ddff5c] transition-colors'
                >
                  @{market.creatorUsername}
                </a>
              </div>

              {/* RIGHT: Action Icons Row */}
              <div className='flex flex-wrap items-center gap-2'>
                <div className='relative'>
                  <button
                    onClick={handleCopyLink}
                    className='w-10 h-10 flex items-center justify-center bg-white/[0.03] border border-white/10 hover:border-white/30 transition-all group'
                    title='Copy link'
                  >
                    <span className='material-symbols-outlined text-white/40 group-hover:text-white text-sm'>link</span>
                  </button>
                  {shareTooltip && (
                    <div className='absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-[#ddff5c] text-black text-[9px] font-black uppercase tracking-widest whitespace-nowrap z-50'>
                      Copied!
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    const text = `${market.questionTitle} — ${window.location.href}`;
                    if (navigator.share) {
                      navigator.share({ title: market.questionTitle, url: window.location.href });
                    } else {
                      navigator.clipboard.writeText(text);
                    }
                  }}
                  className='w-10 h-10 flex items-center justify-center bg-white/[0.03] border border-white/10 hover:border-white/30 transition-all group'
                  title='Share'
                >
                  <span className='material-symbols-outlined text-white/40 group-hover:text-white text-sm'>share</span>
                </button>
                <button
                  className='w-10 h-10 flex items-center justify-center bg-white/[0.03] border border-white/10 hover:border-white/30 transition-all group'
                  title='Bookmark'
                  onClick={() => {
                    // Logic for bookmarking will go here
                  }}
                >
                  <span className='material-symbols-outlined text-white/40 group-hover:text-white text-sm'>bookmark</span>
                </button>
                {(username === market.creatorUsername || usertype === 'ADMIN') && !market.isResolved && (
                  <ResolveModalButton
                    marketId={marketId}
                    token={token}
                    market={market}
                    disabled={!token}
                    className='h-10 flex items-center text-xs px-4 tracking-widest'
                  />
                )}
              </div>
            </div>
          </div>

          {/* ─── Probability Display (Binary) ─── */}
          {!isMultipleChoice && (
            <div className='mb-4'>
              <span className='text-[#34d399] text-xs font-black uppercase tracking-widest'>
                {market.yesLabel || 'YES'}
              </span>
              <div className='flex items-baseline gap-2'>
                <span className='text-3xl font-headline font-black text-[#34d399]'>
                  {(currentProbability * 100).toFixed(0)}%
                </span>
                <span className='text-xs font-black tracking-widest text-[#34d399]/60'>
                  chance
                </span>
              </div>
            </div>
          )}

          {/* ─── Multi-Outcome Legend ─── */}
          {isMultipleChoice && (
            <div className='flex flex-wrap items-center gap-3 mb-4'>
              {(market.options || []).map((opt, i) => {
                const prob = optionProbabilities[opt.label] || 0;
                return (
                  <div key={opt.id || i} className='flex items-center gap-1.5'>
                    <span
                      className='w-2.5 h-2.5 rounded-full flex-shrink-0'
                      style={{ backgroundColor: OUTCOME_COLORS[i % OUTCOME_COLORS.length] }}
                    />
                    <span className='text-xs font-black tracking-widest text-white/60'>
                      {opt.label} {(prob * 100).toFixed(0)}%
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* ─── CHART ─── */}
          <div className='mb-6'>
            <div className='bg-white/[0.02] border border-white/10'>
              {isMultipleChoice ? (
                <div className='p-4 text-center text-white/30 text-[10px] font-black uppercase tracking-widest'>
                  <span className='material-symbols-outlined text-lg block mb-2'>show_chart</span>
                  Multi-outcome chart coming soon
                </div>
              ) : (
                <MarketChart
                  data={probabilityChanges}
                  currentProbability={currentProbability}
                  title=''
                  className='w-full'
                  closeDateTime={market.resolutionDateTime}
                  yesLabel={market.yesLabel}
                  noLabel={market.noLabel}
                />
              )}
            </div>
          </div>

          {/* ─── OUTCOMES LIST (Multi-choice) ─── */}
          {isMultipleChoice && (
            <div className='mb-6'>
              {/* Table Header */}
              <div className='flex items-center px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white/30 border-b border-white/10'>
                <div className='flex-1'>Outcome</div>
                <div className='w-24 text-center'>% Chance</div>
                <div className='w-20 sm:w-40 flex justify-end pr-2'>Trade</div>
              </div>
              {/* Outcome Rows */}
              {(market.options || []).map((opt, i) => {
                const prob = optionProbabilities[opt.label] || 0;
                const percentage = (prob * 100).toFixed(0);
                return (
                  <div
                    key={opt.id || i}
                    onClick={() => setSelectedOutcomeForSidebar(opt.label)}
                    className='flex items-center px-4 py-3 border-b border-white/5 hover:bg-white/[0.02] transition-all group cursor-pointer'
                  >
                    {/* Outcome Name with color dot */}
                    <div className='flex-1 flex items-center gap-3 min-w-0'>
                      <div
                        className='w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-black text-black'
                        style={{ backgroundColor: OUTCOME_COLORS[i % OUTCOME_COLORS.length] }}
                      >
                        {opt.label.charAt(0)}
                      </div>
                      <div className='min-w-0'>
                        <span className='text-sm font-black tracking-widest text-white block truncate group-hover:text-[#ddff5c] transition-colors'>
                          {opt.label}
                        </span>
                      </div>
                    </div>
                    {/* Percentage */}
                    <div className='w-24 text-center'>
                      <span className='text-lg font-headline font-black text-white'>
                        {percentage}%
                      </span>
                    </div>
                    {/* Trade CTA */}
                    <div className='w-20 sm:w-40 flex justify-end pr-2'>
                        <span className='text-[10px] font-black uppercase tracking-widest text-white/30 group-hover:text-[#ddff5c] transition-colors'>
                            Trade ▾
                        </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ─── RULES / RESOLUTION CRITERIA ─── */}
          <div className='mb-6 bg-white/[0.02] border border-white/10'>
            <button
              onClick={() => setShowFullDescription(!showFullDescription)}
              className='w-full flex items-center justify-between p-4 group'
            >
              <span className='text-sm font-black uppercase tracking-widest text-white/80 group-hover:text-white transition-colors'>
                Rules
              </span>
              <span className='material-symbols-outlined text-white/40 group-hover:text-white transition-colors text-sm'>
                {showFullDescription ? 'expand_less' : 'expand_more'}
              </span>
            </button>
            <div className={`px-4 pb-4 ${showFullDescription ? '' : 'max-h-16 overflow-hidden'}`}>
              <p
                className='text-sm text-white/60 leading-relaxed whitespace-pre-wrap'
                style={{ wordBreak: 'break-word', overflowWrap: 'break-word', hyphens: 'auto' }}
              >
                {market.description}
              </p>
            </div>
            {!showFullDescription && market.description && market.description.length > 100 && (
              <button
                onClick={() => setShowFullDescription(true)}
                className='w-full px-4 pb-3 text-left text-xs font-black uppercase tracking-widest text-[#ddff5c]/60 hover:text-[#ddff5c] transition-colors'
              >
                Show more ▾
              </button>
            )}
          </div>

          {/* ─── STATS ROW ─── */}
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-2 text-center mb-6'>
            {[
              { label: 'Traders', value: `${numUsers}`, icon: 'group' },
              { label: 'Volume', value: formatCurrency(totalVolume), coinIcon: true, icon: 'database' },
              { label: 'Comments', value: `${commentCount}`, icon: 'chat_bubble' },
              {
                label: 'Closes',
                value: market.isResolved ? 'Closed' : formatResolutionDate(market.resolutionDateTime),
                icon: 'schedule',
              },
            ].map((item, index) => (
              <div key={index} className='bg-white/[0.02] border border-white/10 p-3 flex flex-col items-center justify-center'>
                <span className='material-symbols-outlined text-white/20 text-lg mb-1'>{item.icon}</span>
                <div className='text-[10px] font-black uppercase tracking-widest text-white/30 mb-0.5'>{item.label}</div>
                <div className='text-xs font-black tracking-widest truncate max-w-full flex items-center justify-center gap-1'>
                  {item.coinIcon && <CoinIcon size="text-[10px]" className="text-white/20" />}
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {marketDust > 0 && (
            <div className='flex justify-center mb-6'>
              <div className='bg-[#ddff5c]/5 border border-[#ddff5c]/20 px-4 py-2 flex items-center gap-2'>
                <span className='material-symbols-outlined text-[#ddff5c] text-sm'>auto_awesome</span>
                <span className='text-[10px] font-black uppercase tracking-widest text-[#ddff5c]/60'>Dust</span>
                <span className='text-xs font-black tracking-widest text-[#ddff5c] flex items-center gap-1'>
                  <CoinIcon size="text-xs" />
                  {formatCurrency(marketDust)}
                </span>
              </div>
            </div>
          )}

          {/* ─── ACTIVITY TABS ─── */}
          <div className='mx-auto w-full mb-8'>
            <ActivityTabs marketId={marketId} market={market} refreshTrigger={refreshTrigger} />
          </div>
        </div>

        {/* ─── RIGHT COLUMN: Trading Sidebar (Desktop Only) ─── */}
        <div className="hidden lg:block w-[340px] flex-shrink-0">
          <div className="sticky top-4">
            <TradingSidebar
              marketId={marketId}
              market={market}
              token={token}
              isLoggedIn={isLoggedIn}
              onTransactionSuccess={handleTransactionSuccess}
              currentProbability={currentProbability}
              optionProbabilities={optionProbabilities}
              externalSelectedOutcome={selectedOutcomeForSidebar}
            />
          </div>
        </div>
      </div>

      {/* ─── MOBILE: Floating Trade CTA ─── */}
      {shouldShowTradeButtons && (
        <TradeCTA onClick={toggleBetModal} disabled={!token} className="bg-[#ddff5c] text-black!" />
      )}
      <div className="h-24 lg:hidden" />

      {/* ─── MOBILE: Trade Modal ─── */}
      {showBetModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-end sm:items-center z-[100] p-0 sm:p-4">
          <div className="relative bg-[#0b0f0e] border border-white/10 w-full sm:max-w-md max-h-[85vh] overflow-y-auto custom-scrollbar shadow-2xl">
            <TradeTabs
              marketId={marketId}
              market={market}
              token={token}
              onTransactionSuccess={handleTransactionSuccess}
            />
            <button
              onClick={toggleBetModal}
              className="absolute top-3 right-3 text-white/30 hover:text-white transition-colors bg-black/50 rounded-full p-1.5 z-10"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MarketDetailsTable;
