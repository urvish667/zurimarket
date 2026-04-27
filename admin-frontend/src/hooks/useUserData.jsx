import { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { useAuth } from '../helpers/AuthContent';

const useUserData = (username, usePrivateProfile = false) => {
  const [userData, setUserData] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { token } = useAuth();

  const refetch = () => setRefreshTrigger(prev => prev + 1);

  useEffect(() => {
    const fetchUserData = async () => {
      setUserLoading(true);
      try {
        let url, headers = {};
        
        if (usePrivateProfile) {
          url = `${API_URL}/v0/privateprofile`;
          headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          };
        } else {
          url = `${API_URL}/v0/userinfo/${username}`;
          if (token) {
            headers = {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            };
          }
        }

        const response = await fetch(url, { headers });
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUserError(error.toString());
      } finally {
        setUserLoading(false);
      }
    };

    if (username || usePrivateProfile) {
      fetchUserData();
    }
  }, [username, usePrivateProfile, token, refreshTrigger]);

  return { userData, userLoading, userError, refetch };
};

export default useUserData;
