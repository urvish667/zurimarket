import { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { useAuth } from '../helpers/AuthContent';

const usePortfolio = (username, page = 1, limit = 20) => {
  const [portfolio, setPortfolio] = useState({ portfolioItems: [], pagination: null, totalSharesOwned: 0 });
  const [portfolioLoading, setPortfolioLoading] = useState(true);
  const [portfolioError, setPortfolioError] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const headers = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
          headers['Content-Type'] = 'application/json';
        }

        const response = await fetch(`${API_URL}/v0/portfolio/${username}?page=${page}&limit=${limit}`, { headers });
        if (!response.ok) {
          throw new Error('Failed to fetch portfolio');
        }
        const data = await response.json();
        setPortfolio({ 
          portfolioItems: data.portfolioItems || [], 
          pagination: data.pagination,
          totalSharesOwned: data.totalSharesOwned || 0
        });
      } catch (error) {
        console.error('Error fetching portfolio:', error);
        setPortfolioError(error.toString());
      } finally {
        setPortfolioLoading(false);
      }
    };

    if (username && token) {
      fetchPortfolio();
    }
  }, [username, token, page, limit]);

  return { portfolio, portfolioLoading, portfolioError };
};

export default usePortfolio;
