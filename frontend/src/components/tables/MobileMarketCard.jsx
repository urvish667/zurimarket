import React from 'react';
import { Link } from 'react-router-dom';
import formatResolutionDate from '../../helpers/formatResolutionDate';
import ExpandableText from '../utils/ExpandableText';
import { getResolvedText, getResultCssClass } from '../../utils/labelMapping';
import { CoinIcon } from '../../utils/CurrencyUtils';

const MobileMarketCard = ({ marketData }) => {
  const isMarketOpen =
    !marketData.market.isResolved &&
    formatResolutionDate(marketData.market.resolutionDateTime) !== 'Closed';

  return (
    <div className='bg-gray-800 p-4 mb-4 rounded-lg'>
      <div className='grid grid-cols-[1fr,auto] gap-2 items-center mb-2'>
        <Link
          to={`/user/${marketData.creator.username}`}
          className='text-gray-400 hover:text-blue-400 transition-colors duration-200 truncate'
        >
          <span>
            {marketData.creator.username} {marketData.creator.personalEmoji}
          </span>
        </Link>
        {isMarketOpen ? (
          <Link
            to={`/markets/${marketData.market.id}`}
            className='bg-blue-500 text-white px-3 py-1 rounded-full text-sm whitespace-nowrap'
          >
            Bet
          </Link>
        ) : (
          <span className='bg-gray-500 text-white px-3 py-1 rounded-full text-sm whitespace-nowrap'>
            Closed
          </span>
        )}
      </div>
      <Link
        to={`/markets/${marketData.market.id}`}
        className='text-blue-400 hover:text-blue-300 font-medium block mb-2'
      >
        <ExpandableText
          text={marketData.market.questionTitle}
          maxLength={60}
          className=""
          expandedClassName="mt-2 p-2 bg-gray-700 rounded border border-gray-600 relative z-10"
          buttonClassName="text-xs text-blue-400 hover:text-blue-300 transition-colors ml-1"
          showFullTextInExpanded={true}
          expandIcon="📐"
        />
      </Link>
      <div className='grid grid-cols-3 text-sm text-gray-400'>
        <span className='truncate'>👤 {marketData.numUsers}</span>
        <div className='flex justify-center items-center gap-1'>
          <CoinIcon size="text-[10px]" className="opacity-40" />
          {marketData.lastProbability.toFixed(2)}%
        </div>
        <span
          className={`text-right ${
            marketData.market.isResolved
              ? getResultCssClass(marketData.market.resolutionResult)
              : 'text-gray-400'
          }`}
        >
          {marketData.market.isResolved
            ? getResolvedText(marketData.market.resolutionResult, marketData.market)
            : 'Pending'}
        </span>
      </div>
    </div>
  );
};

export default MobileMarketCard;
