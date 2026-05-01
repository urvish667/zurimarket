import React from 'react';
import MarketDetailsTable from '../../components/marketDetails/MarketDetailsLayout';
import { useMarketDetails } from '../../hooks/useMarketDetails';
import { useAuth } from '../../helpers/AuthContent';
import LoadingSpinner from '../../components/loaders/LoadingSpinner';

const MarketDetails = () => {
  const { username, usertype } = useAuth();
  const { details, isLoggedIn, token, refetchData, currentProbability, optionProbabilities } =
    useMarketDetails();

  if (!details) {
    return <LoadingSpinner />;
  }

  return (
    <div className='flex flex-col min-h-screen'>
      <div className='flex-grow overflow-y-auto'>
        <MarketDetailsTable
          market={details.market}
          creator={details.creator}
          numUsers={details.numUsers}
          totalVolume={details.totalVolume}
          marketDust={details.marketDust || 0}
          commentCount={details.commentCount || 0}
          currentProbability={currentProbability}
          probabilityChanges={details.probabilityChanges}
          optionProbabilities={optionProbabilities}
          marketId={details.market.id}
          username={username}
          usertype={usertype}
          isLoggedIn={isLoggedIn}
          token={token}
          refetchData={refetchData}
        />
      </div>
    </div>
  );
};

export default MarketDetails;
