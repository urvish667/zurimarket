import { API_URL } from '../../../../config';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMarketLabels } from '../../../../utils/labelMapping';

const PositionsActivityLayout = ({ marketId, market, refreshTrigger }) => {
  const [positions, setPositions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/v0/markets/positions/${marketId}?page=${currentPage}&limit=10`);
        if (response.ok) {
          const data = await response.json();
          setPositions(data.positions || []);
          setPagination(data.pagination);
        } else {
          console.error('Error fetching positions:', response.statusText);
        }
      } catch (err) {
        console.error('Error fetching positions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPositions();
  }, [marketId, refreshTrigger, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const labels = market ? getMarketLabels(market) : { yes: "YES", no: "NO" };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row gap-6 p-4">
        {/* NO Shares */}
        <div className="flex-1">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-3 border-b border-white/10 pb-2">
            Shares for: <span className="text-[#f87171] ml-1">{labels.no}</span>
          </h2>
          <div className="flex flex-col gap-2">
            {positions.filter(pos => pos.noSharesOwned > 0).map((pos, index) => (
              <div key={index} className="bg-white/[0.02] border border-white/10 p-3 hover:border-white/30 transition-all flex flex-col gap-2">
                <Link
                  to={`/user/${pos.username}`}
                  className="text-[#ddff5c] text-xs font-black uppercase tracking-widest hover:brightness-110 transition-colors"
                >
                  @{pos.username}
                </Link>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-white/40">Shares</span>
                  <span className="text-white">{Math.floor(pos.noSharesOwned).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-white/40">Value</span>
                  <span className="text-[#f87171]">🪙 {parseFloat(pos.value).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* YES Shares */}
        <div className="flex-1">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-3 border-b border-white/10 pb-2">
            Shares for: <span className="text-[#34d399] ml-1">{labels.yes}</span>
          </h2>
          <div className="flex flex-col gap-2">
            {positions.filter(pos => pos.yesSharesOwned > 0).map((pos, index) => (
              <div key={index} className="bg-white/[0.02] border border-white/10 p-3 hover:border-white/30 transition-all flex flex-col gap-2">
                <Link
                  to={`/user/${pos.username}`}
                  className="text-[#ddff5c] text-xs font-black uppercase tracking-widest hover:brightness-110 transition-colors"
                >
                  @{pos.username}
                </Link>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-white/40">Shares</span>
                  <span className="text-white">{Math.floor(pos.yesSharesOwned).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-white/40">Value</span>
                  <span className="text-[#34d399]">🪙 {parseFloat(pos.value).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {pagination && (
        <div className="px-4 pb-4">
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            totalRows={pagination.totalRows}
            limit={pagination.limit}
          />
        </div>
      )}
    </div>
  );
};

export default PositionsActivityLayout;
