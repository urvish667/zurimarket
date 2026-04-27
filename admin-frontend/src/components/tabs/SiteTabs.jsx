import React, { useState, useEffect } from 'react';

// Base styles for all tabs
const tabBaseStyle = "px-4 py-3 text-[10px] sm:text-xs font-black uppercase tracking-widest text-center cursor-pointer transition-all border-b-2";
// Styles for the non-selected tabs
const tabInactiveStyle = "text-white/40 border-transparent hover:text-white/80 hover:bg-white/[0.02]";
// Styles for the selected tab
const tabActiveStyle = "text-[#ddff5c] border-[#ddff5c] bg-[#ddff5c]/5";

const SiteTabs = ({ tabs, onTabChange, defaultTab, activeTab }) => {
    const [internalActiveTab, setInternalActiveTab] = useState(defaultTab || tabs[0].label);
    
    // Use activeTab prop if provided, otherwise fall back to internal state
    const currentTab = activeTab ?? internalActiveTab;

    useEffect(() => {
        if (defaultTab && defaultTab !== internalActiveTab) {
            setInternalActiveTab(defaultTab);
        }
    }, [defaultTab]);

    const handleTabClick = (tabLabel) => {
        if (onTabChange) {
            // External control - call the callback
            onTabChange(tabLabel);
        } else {
            // Internal control - update internal state
            setInternalActiveTab(tabLabel);
        }

        // Call individual tab's onSelect callback if it exists
        const tab = tabs.find(t => t.label === tabLabel);
        if (tab && tab.onSelect) {
            tab.onSelect();
        }
    };

    return (
        <div>
            {/* Mobile-responsive tab container with overflow handling */}
            <div className="flex border-b border-white/10 overflow-x-auto custom-scrollbar">
                {tabs.map(tab => (
                    <div
                        key={tab.label}
                        className={`${tabBaseStyle} ${currentTab === tab.label ? tabActiveStyle : tabInactiveStyle} flex-1 min-w-0`}
                        onClick={() => handleTabClick(tab.label)}
                    >
                        {/* Mobile-responsive text with truncation */}
                        <span className="truncate block">
                            {tab.label}
                        </span>
                    </div>
                ))}
            </div>
            <div className="pt-6">
                {tabs.map(tab => (
                    currentTab === tab.label && <div key={tab.label}>{tab.content}</div>
                ))}
            </div>
        </div>
    );
};

export default SiteTabs;
