import React from 'react';
import SiteTabs from './SiteTabs';
import BetsActivityLayout from '../layouts/activity/bets/BetsActivity';
import PositionsActivityLayout from '../layouts/activity/positions/PositionsActivity';
import LeaderboardActivity from '../layouts/activity/leaderboard/LeaderboardActivity';
import CommentsActivity from '../layouts/activity/comments/CommentsActivity';

const ActivityTabs = ({ marketId, market, refreshTrigger }) => {
    const tabsData = [
        { label: 'Positions', content: <PositionsActivityLayout marketId={marketId} market={market} refreshTrigger={refreshTrigger} /> },
        { label: 'Bets', content: <BetsActivityLayout marketId={marketId} refreshTrigger={refreshTrigger} /> },
        { label: 'Leaderboard', content: <LeaderboardActivity marketId={marketId} market={market} /> },
        { label: 'Comments', content: <CommentsActivity marketId={marketId} /> },
    ];

    return <SiteTabs tabs={tabsData} />;
};

export default ActivityTabs;
