import React, { useState, useEffect } from 'react';
import SiteTabs from '../../components/tabs/SiteTabs';
import MarketsByStatusTable from '../../components/tables/MarketsByStatusTable';
import GlobalSearchBar from '../../components/search/GlobalSearchBar';
import SearchResultsTable from '../../components/tables/SearchResultsTable';
import { TAB_TO_STATUS } from '../../utils/statusMap';
import Pagination from '../../components/common/Pagination';

function Markets() {
    const [searchResults, setSearchResults] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [activeTab, setActiveTab] = useState('Active');
    const [searchPage, setSearchPage] = useState(1);

    const handleSearchResults = (results) => {
        setSearchResults(results);
    };

    const handleSearchPageChange = (newPage) => {
        setSearchPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleTabChange = (tabLabel) => {
        setActiveTab(tabLabel);
        setSearchPage(1); // Reset search page when switching tabs
    };

    const tabsData = [
        { 
            label: 'Active', 
            content: isSearching ? 
                <SearchResultsTable 
                    searchResults={searchResults} 
                    currentPage={searchPage} 
                    onPageChange={handleSearchPageChange} 
                /> : 
                <MarketsByStatusTable status="active" />,
            onSelect: () => handleTabChange('Active')
        },
        { 
            label: 'Closed', 
            content: isSearching ? 
                <SearchResultsTable 
                    searchResults={searchResults} 
                    currentPage={searchPage} 
                    onPageChange={handleSearchPageChange} 
                /> : 
                <MarketsByStatusTable status="closed" />,
            onSelect: () => handleTabChange('Closed')
        },
        { 
            label: 'Resolved', 
            content: isSearching ? 
                <SearchResultsTable 
                    searchResults={searchResults} 
                    currentPage={searchPage} 
                    onPageChange={handleSearchPageChange} 
                /> : 
                <MarketsByStatusTable status="resolved" />,
            onSelect: () => handleTabChange('Resolved')
        },
        { 
            label: 'All', 
            content: isSearching ? 
                <SearchResultsTable 
                    searchResults={searchResults} 
                    currentPage={searchPage} 
                    onPageChange={handleSearchPageChange} 
                /> : 
                <MarketsByStatusTable status="all" />,
            onSelect: () => handleTabChange('All')
        },
    ];

    return (
        <div className='App'>
            <div className='Center-content'>
                <div className='Center-content-header'>
                    <h1 className='text-2xl font-semibold text-gray-300 mb-6'>Markets</h1>
                </div>
                <div className='Center-content-table'>
                    {/* Global Search Bar - Always visible at top */}
                    <GlobalSearchBar 
                        onSearchResults={handleSearchResults}
                        currentStatus={TAB_TO_STATUS[activeTab]}
                        isSearching={isSearching}
                        setIsSearching={setIsSearching}
                        page={searchPage}
                    />
                    
                    {/* Tabs with Content */}
                    <SiteTabs 
                        tabs={tabsData} 
                        onTabChange={handleTabChange}
                        activeTab={activeTab}
                    />
                </div>
            </div>
        </div>
    );
}

export default Markets;
