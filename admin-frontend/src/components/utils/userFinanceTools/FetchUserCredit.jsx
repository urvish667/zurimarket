import React, { useState, useEffect } from 'react';
import { API_URL } from '../../../config';
import { useAuth } from '../../../helpers/AuthContent';

const useUserCredit = (username) => {
    const [userCredit, setUserCredit] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token } = useAuth();

    useEffect(() => {
      const fetchCredit = async () => {
        try {
          const headers = {
            'Content-Type': 'application/json',
          };
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }

          const response = await fetch(`${API_URL}/v0/usercredit/${username}`, { headers });
          if (!response.ok) {
            throw new Error('Failed to fetch user credit');
          }
          const data = await response.json();
          setUserCredit(data.credit);
        } catch (error) {
          console.error('Error fetching user credit:', error);
          setError(error.toString());
        } finally {
          setLoading(false);
        }
      };

      if (username) {
        fetchCredit();
      }
    }, [username, token]);

    return { userCredit, loading, error };
  };

  export default useUserCredit;
